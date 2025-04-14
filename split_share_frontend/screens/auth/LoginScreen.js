import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Text, Button, Icon, Divider } from "@rneui/themed";
import { useAuth } from "../../contexts/AuthContext";
import CupertinoTextInput from "../../components/CupertinoTextInput";
import { Colors, TextStyles } from "../../components/CupertinoStyles";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Icon
              name="receipt"
              size={40}
              color={Colors.primary}
              style={styles.logo}
            />
            <Text h3 style={styles.title}>
              Welcome Back
            </Text>
            <Text style={styles.subtitle}>
              Sign in to continue managing your expenses
            </Text>
          </View>

          <View style={styles.form}>
            <CupertinoTextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Icon
                  name="email"
                  type="material"
                  size={24}
                  color={Colors.gray}
                />
              }
            />

            <CupertinoTextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? "visibility-off" : "visibility"}
                    type="material"
                    size={24}
                    color={Colors.gray}
                  />
                </TouchableOpacity>
              }
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title="Sign In"
              loading={loading}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.button}
              onPress={handleLogin}
            />

            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <Divider style={styles.divider} />
            </View>

            <View style={styles.socialButtons}>
              <Button
                title="Google"
                icon={{
                  name: "google",
                  type: "font-awesome",
                  size: 18,
                  color: Colors.white,
                }}
                buttonStyle={[styles.socialButton, styles.googleButton]}
                containerStyle={styles.socialButtonContainer}
                onPress={() => handleSocialLogin("google")}
              />

              <Button
                title="Facebook"
                icon={{
                  name: "facebook",
                  type: "font-awesome",
                  size: 18,
                  color: Colors.white,
                }}
                buttonStyle={[styles.socialButton, styles.facebookButton]}
                containerStyle={styles.socialButtonContainer}
                onPress={() => handleSocialLogin("facebook")}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.footerButton}>
              <Text style={styles.footerText}>
                Don't have an account?{" "}
                <Text style={styles.footerLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginVertical: 30,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    ...TextStyles.largeTitle,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    ...TextStyles.subhead,
    color: Colors.gray,
    textAlign: "center",
  },
  form: {
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  dividerText: {
    ...TextStyles.footnote,
    color: Colors.gray,
    marginHorizontal: 10,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButtonContainer: {
    flex: 0.48,
  },
  socialButton: {
    borderRadius: 12,
    paddingVertical: 12,
  },
  googleButton: {
    backgroundColor: "#DB4437",
  },
  facebookButton: {
    backgroundColor: "#4267B2",
  },
  footer: {
    marginTop: "auto",
    paddingVertical: 20,
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    ...TextStyles.subhead,
    color: Colors.gray,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
  errorText: {
    color: Colors.danger,
    ...TextStyles.footnote,
    marginTop: 8,
    textAlign: "center",
  },
});
