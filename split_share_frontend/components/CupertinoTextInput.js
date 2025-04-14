import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Text } from "@rneui/themed";
import { Colors, TextStyles, InputStyles } from "./CupertinoStyles";

export default function CupertinoTextInput({
  label,
  error,
  value,
  onChangeText,
  placeholder,
  containerStyle,
  leftIcon,
  rightIcon,
  secureTextEntry,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [labelAnim] = useState(new Animated.Value(value ? 1 : 0));

  const handleFocus = () => {
    setIsFocused(true);
    animateLabel(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      animateLabel(0);
    }
  };

  const animateLabel = (toValue) => {
    Animated.timing(labelAnim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const labelStyle = {
    position: "absolute",
    left: leftIcon ? 52 : 16,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -8],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors.gray, Colors.primary],
    }),
    backgroundColor: Colors.white,
    paddingHorizontal: 4,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Animated.Text style={labelStyle}>{label}</Animated.Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={!isFocused ? placeholder : ""}
          placeholderTextColor={Colors.gray}
          secureTextEntry={secureTextEntry}
          {...props}
        />

        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
  },
  inputContainerError: {
    borderColor: Colors.danger,
  },
  iconContainer: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  errorText: {
    ...TextStyles.caption2,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 16,
  },
});
