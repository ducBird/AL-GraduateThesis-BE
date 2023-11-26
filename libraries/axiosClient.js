import axios from "axios";
import { API_URL } from "../constants/URLS.js";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export { axiosClient };
