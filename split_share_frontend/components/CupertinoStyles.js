import { StyleSheet } from "react-native";

// Cupertino-inspired color palette
export const Colors = {
  primary: "#007AFF", // iOS blue
  secondary: "#5AC8FA", // iOS light blue
  success: "#34C759", // iOS green
  warning: "#FF9500", // iOS orange
  danger: "#FF3B30", // iOS red
  light: "#F2F2F7", // iOS light background
  dark: "#1C1C1E", // iOS dark background
  gray: "#8E8E93", // iOS gray
  lightGray: "#E5E5EA", // iOS light gray
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

// Cupertino-inspired text styles
export const TextStyles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.41,
  },
  title1: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.34,
  },
  title2: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.29,
  },
  title3: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: "400",
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 0.07,
  },
});

// Common component styles
export const ComponentStyles = StyleSheet.create({
  // Container styles
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.light,
  },

  // Input styles
  textInput: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    fontSize: 17,
    color: Colors.dark,
    marginVertical: 8,
  },

  // Button styles
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: Colors.transparent,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: "600",
  },

  // Card styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },

  // Form styles
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.gray,
    marginBottom: 8,
  },
  formError: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: 4,
  },
});

// Navigation header options for Cupertino style
export const cupertinoHeaderOptions = {
  headerStyle: {
    backgroundColor: Colors.light,
  },
  headerTintColor: Colors.primary,
  headerTitleStyle: {
    fontWeight: "600",
    fontSize: 17,
  },
  headerBackTitleVisible: false,
  headerShadowVisible: false,
};
