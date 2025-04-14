import { Platform } from "react-native";

// Get the correct API URL based on the platform and environment
function getApiUrl() {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000"; // Android emulator
    }
    if (Platform.OS === "ios") {
      return "http://localhost:3000"; // iOS simulator
    }
  }
  // Production URL (change this to your production API URL)
  return "https://your-production-api.com";
}

export const API_BASE_URL = getApiUrl();
