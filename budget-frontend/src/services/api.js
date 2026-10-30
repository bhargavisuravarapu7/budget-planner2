import axios from "axios";

const api = axios.create({
  baseURL: "https://budget-planner-backend-eh1w.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;