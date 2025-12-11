import axios from "axios";

const instance = axios.create({
  baseURL: "https://chitchat-backend-ojed.onrender.com"
});

export default instance;
