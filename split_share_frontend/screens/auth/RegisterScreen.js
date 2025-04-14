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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    // TODO: Implement social signup
    console.log(`Sign up with ${provider}`);
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
              Create Account
            </Text>
            <Text style={styles.subtitle}>
              Join Split Share to start sharing expenses with friends
            </Text>
          </View>

          <View style={styles.form}>
            <CupertinoTextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              leftIcon={
                <Icon
                  name="person"
                  type="material"
                  size={24}
                  color={Colors.gray}
                />
              }
            />

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

            <CupertinoTextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title="Sign Up"
              loading={loading}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.button}
              onPress={handleRegister}
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
                onPress={() => handleSocialSignup("google")}
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
                onPress={() => handleSocialSignup("facebook")}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.footerButton}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text style={styles.footerLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By signing up, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
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
    marginBottom: 16,
  },
  footerText: {
    ...TextStyles.subhead,
    color: Colors.gray,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
  termsText: {
    ...TextStyles.caption2,
    color: Colors.gray,
    textAlign: "center",
  },
  termsLink: {
    color: Colors.primary,
  },
  errorText: {
    color: Colors.danger,
    ...TextStyles.footnote,
    marginTop: 8,
    textAlign: "center",
  },
});
