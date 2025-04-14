import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Colors } from "../components/CupertinoStyles";
import { useAuth } from "../contexts/AuthContext";

export default function SplashScreen({ navigation }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Add a small delay to show the splash screen
    const timer = setTimeout(() => {
      // Navigate to MainApp or Login based on authentication status
      navigation.replace(isAuthenticated() ? "MainApp" : "Login");
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/splash-icon.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "60%",
    height: "60%",
  },
});
