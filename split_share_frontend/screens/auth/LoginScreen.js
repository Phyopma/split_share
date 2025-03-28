import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import CupertinoTextInput from "../../components/CupertinoTextInput";
import CupertinoButton from "../../components/CupertinoButton";
import {
  Colors,
  TextStyles,
  ComponentStyles,
} from "../../components/CupertinoStyles";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }

    // Simple email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue to Split Share
          </Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          <CupertinoTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CupertinoTextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <CupertinoButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    ...TextStyles.largeTitle,
    color: Colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    ...TextStyles.body,
    color: Colors.gray,
    textAlign: "center",
  },
  formContainer: {
    marginTop: 20,
  },
  loginButton: {
    marginTop: 30,
  },
  errorContainer: {
    backgroundColor: Colors.danger + "20",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.danger,
    ...TextStyles.subhead,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    ...TextStyles.body,
    color: Colors.gray,
  },
  registerLink: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: "600",
  },
});
