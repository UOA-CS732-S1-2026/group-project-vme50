import React, { useState } from "react";
import MapPicker from "./MapPicker";
import { getAddressFromCoords } from "../../utils/getAddressFromCoords.util.ts";

type Props = {
  onClose: () => void;
  onCreate: (mealData: any) => Promise<void>;
};

function CreateMealModal({ onClose, onCreate }: Props) {
  const TITLE_LIMIT = 40;
  const DESCRIPTION_LIMIT = 150;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time: "",
    slots: 5,
    lat: 0,
    lng: 0,
  });

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === "slots" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleMapSelect = (loc: { lat: number; lng: number }) => {
    setFormData((prev) => ({
      ...prev,
      lat: loc.lat,
      lng: loc.lng,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.time) < new Date()) {
      alert("Meal time cannot be in the past");
      return;
    }

    if (!formData.lat || !formData.lng) {
      alert("Please select a location on the map");
      return;
    }

    try {
      const address = await getAddressFromCoords(formData.lat, formData.lng);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Create Meal Session</h2>

          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-600 text-2xl font-bold transition cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* TITLE */}
          <div>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              maxLength={TITLE_LIMIT}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {formData.title.length}/{TITLE_LIMIT}
            </p>
          </div>

          {/* DESCRIPTION */}
          <div>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              maxLength={DESCRIPTION_LIMIT}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {formData.description.length}/{DESCRIPTION_LIMIT}
            </p>
          </div>

          {/* MAP */}
          <div className="rounded-xl overflow-hidden border">
            <MapPicker
              onSelect={handleMapSelect}
              value={{ lat: formData.lat, lng: formData.lng }}
            />
          </div>

          {/* TIME + SLOTS */}
          <div className="grid grid-cols-2 gap-3">
            {/* TIME */}
            <div>
              <label className="text-xs text-gray-500">Meal Start Time</label>
              <input
                type="datetime-local"
                name="time"
                value={formData.time}
                onChange={handleChange}
                min={getMinDateTime()}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            {/* SLOTS */}
            <div>
              <label className="text-xs text-gray-500">Max Slots</label>
              <input
                type="number"
                name="slots"
                value={formData.slots}
                onChange={handleChange}
                min={2}
                max={20}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMealModal;
