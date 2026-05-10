/* ================= CREATE MEAL MODAL =================
   Purpose:
   - Create a meal/session
   - Pick location on map
   - Convert coordinates → address (on submit)
===================================================== */

import React, { useState } from "react";
import MapPicker from "./MapPicker";
import { getAddressFromCoords } from "../../utils/getAddressFromCoords.util.ts";

/* ================= PROPS ================= */
type Props = {
  onClose: () => void;
  onCreate: (mealData: any) => Promise<void>;
};

function CreateMealModal({ onClose, onCreate }: Props) {
  const TITLE_LIMIT = 40;
  const DESCRIPTION_LIMIT = 150;

  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time: "",
    slots: 5,
    lat: 0,
    lng: 0,
  });

  /* ================= MIN DATETIME =================
     Prevent selecting past time
  ================================================= */
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  /* ================= INPUT HANDLER ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === "slots" ? Number(e.target.value) : e.target.value,
    });
  };

  /* ================= MAP SELECT =================
     Gets coordinates from MapPicker
  ================================================= */
  const handleMapSelect = (loc: { lat: number; lng: number }) => {
    setFormData((prev) => ({
      ...prev,
      lat: loc.lat,
      lng: loc.lng,
    }));
  };

  /* ================= SUBMIT =================
     - validates input
     - reverse geocodes coordinates → address
     - sends meal data to backend
  ================================================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* validation: time cannot be in past */
    if (new Date(formData.time) < new Date()) {
      alert("Meal time cannot be in the past");
      return;
    }

    /* validation: must pick location */
    if (!formData.lat || !formData.lng) {
      alert("Please select a location on the map");
      return;
    }

    try {
      /* ================= REVERSE GEOCODING ================= */
      const address = await getAddressFromCoords(formData.lat, formData.lng);

      /* ================= CREATE MEAL ================= */
      await onCreate({
        title: formData.title,
        description: formData.description,
        location: {
          address,
          lat: formData.lat,
          lng: formData.lng,
        },
        time: formData.time,
        slots: formData.slots,
      });

      /* ================= RESET FORM ================= */
      setFormData({
        title: "",
        description: "",
        time: "",
        slots: 5,
        lat: 0,
        lng: 0,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create meal session");
    }
  };

  return (
    /* ================= MODAL BACKDROP ================= */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {/* ================= MODAL CONTAINER ================= */}
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        {/* ================= HEADER ================= */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Create Meal Session</h2>

          <button onClick={onClose} className="text-2xl font-bold text-gray-400">
            ×
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Meal title"
            maxLength={TITLE_LIMIT}
            className="w-full mb-4 rounded-xl border p-3"
            required
          />

          <p className="text-xs text-gray-400 mb-4 text-right">
            {formData.title.length}/{TITLE_LIMIT}
          </p>

          {/* DESCRIPTION */}
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            maxLength={DESCRIPTION_LIMIT}
            className="w-full mb-4 rounded-xl border p-3"
            required
          />

          <p className="text-xs text-gray-400 mb-4 text-right">
            {formData.description.length}/{DESCRIPTION_LIMIT}
          </p>

          {/* ================= MAP PICKER ================= */}
          <MapPicker onSelect={handleMapSelect} value={{ lat: formData.lat, lng: formData.lng }} />

          {/* TIME */}
          <input
            type="datetime-local"
            name="time"
            value={formData.time}
            onChange={handleChange}
            min={getMinDateTime()}
            className="w-full mt-4 mb-4 rounded-xl border p-3"
            required
          />

          {/* SLOTS */}
          <input
            type="number"
            name="slots"
            value={formData.slots}
            onChange={handleChange}
            min={2}
            max={20}
            className="w-full mb-4 rounded-xl border p-3"
            required
          />

          {/* ================= BUTTONS ================= */}
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 border p-3 rounded-xl">
              Cancel
            </button>

            <button type="submit" className="flex-1 bg-teal-500 text-white p-3 rounded-xl">
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMealModal;
