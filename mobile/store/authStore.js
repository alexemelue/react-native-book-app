import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,
  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);
      set({
        token: data.token,
        user: data.user,
        isLoading: false,
        isCheckingAuth: false,
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, isCheckingAuth: false });
      return { success: false, error: error.message };
    }
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);
      set({
        token: data.token,
        user: data.user,
        isLoading: false,
        isCheckingAuth: false,
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, isCheckingAuth: false });
      return { success: false, error: error.message };
    }
  },
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      let user = null;
      if (userJson) {
        try {
          user = JSON.parse(userJson);
        } catch (parseError) {
          await AsyncStorage.removeItem("user");
          user = null;
        }
      }
      set({ token, user });
    } catch (error) {
      console.log("Auth Check Failed", error);
      set({ token: null, user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ token: null, user: null, isCheckingAuth: false, isLoading: false });
  },
}));

// https://www.jetbrains.com/lp/mono/
// https://storyset.com/illustration/reading-glasses/bro
// https://unsplash.com/
// https://www.dicebear.com/playground/
// https://console.cloudinary.com/app/c-63f24e01a68331718bae44df04ee5b/settings/api-keys
// npx expo install expo-image-picker
// npx create-expo-app@latest .
// npm i zustand
// npm run reset-project
// npx expo install expo-file-system
// npx expo install expo-image
// npx expo
// npm i @react-native-async-storage/async-storage
// npm i cron
