import { StyleSheet } from "react-native";

// Cupertino-inspired color palette
export const Colors = {
  primary: "#2089dc",
  secondary: "#8F92A1",
  success: "#2ecc71",
  danger: "#ff6b6b",
  warning: "#f1c40f",
  info: "#3498db",
  light: "#f5f5f5",
  white: "#ffffff",
  black: "#000000",
  gray: "#666666",
  lightGray: "#e1e1e1",
  overlay: "rgba(0, 0, 0, 0.7)",
  shadowColor: "#000000",
};

// Typography styles following iOS design guidelines
export const TextStyles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    letterSpacing: 0.07,
  },
});

// Common layout styles
export const LayoutStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 12,
  },
});

// Common button styles
export const ButtonStyles = StyleSheet.create({
  primary: {
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
  },
  secondary: {
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  danger: {
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: Colors.danger,
  },
  disabled: {
    opacity: 0.6,
  },
});

// Common input styles
export const InputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  label: {
    ...TextStyles.footnote,
    color: Colors.gray,
    marginBottom: 8,
  },
  errorText: {
    ...TextStyles.caption2,
    color: Colors.danger,
    marginTop: 4,
  },
});

// Common avatar styles
export const AvatarStyles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    ...TextStyles.headline,
    color: Colors.white,
  },
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  large: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});
