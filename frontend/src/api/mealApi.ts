import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";

/* =========================
   AXIOS INSTANCE
========================= */
const api = axios.create({
  baseURL: API_BASE_URL,
});

/* =========================
   ADD TOKEN AUTOMATICALLY
========================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================
   MEAL APIs
========================= */
export const getMeals = async () => {
  const response = await api.get("/meals");
  return response.data;
};

export const createMeal = async (mealData: any) => {
  const response = await api.post("/meals/create", mealData);
  return response.data;
};

export const joinMeal = async (id: string) => {
  const response = await api.post(`/meals/${id}/join`);
  return response.data;
};

export const leaveMeal = async (id: string) => {
  const response = await api.post(`/meals/${id}/leave`);
  return response.data;
};
