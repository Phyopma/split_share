import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "./CupertinoStyles";

export default function CupertinoButton({
  title,
  onPress,
  type = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const getButtonStyle = () => {
    switch (type) {
      case "secondary":
        return styles.secondaryButton;
      case "destructive":
        return styles.destructiveButton;
      case "ghost":
        return styles.ghostButton;
      case "primary":
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case "secondary":
        return styles.secondaryButtonText;
      case "destructive":
        return styles.destructiveButtonText;
      case "ghost":
        return styles.ghostButtonText;
      case "primary":
      default:
        return styles.primaryButtonText;
    }
  };

  const buttonDisabledStyle = disabled ? styles.disabledButton : {};
  const textDisabledStyle = disabled ? styles.disabledButtonText : {};

  return (
    <TouchableOpacity
      style={[getButtonStyle(), buttonDisabledStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator
          color={type === "primary" ? Colors.white : Colors.primary}
        />
      ) : (
        <Text style={[getTextStyle(), textDisabledStyle, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: "600",
  },
  destructiveButton: {
    backgroundColor: Colors.transparent,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  destructiveButtonText: {
    color: Colors.danger,
    fontSize: 17,
    fontWeight: "600",
  },
  ghostButton: {
    backgroundColor: Colors.transparent,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  ghostButtonText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    opacity: 0.6,
  },
});
