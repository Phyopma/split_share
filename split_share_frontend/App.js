import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "@rneui/themed";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ReceiptProvider } from "./contexts/ReceiptContext";
import HomeScreen from "./screens/HomeScreen";
import ReceiptDetailScreen from "./screens/ReceiptDetailScreen";
import ReceiptConfirmationScreen from "./screens/ReceiptConfirmationScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import { Colors } from "./components/CupertinoStyles";
import { useEffect, useState, useMemo } from "react"; // Added useMemo

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // Use useEffect with a proper dependency array
  useEffect(() => {
    // Only update isReady when loading changes
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]); // Specify dependency array correctly

  // Use a memoized value for the initial route to prevent unnecessary navigation rerenders
  const initialRouteName = useMemo(() => {
    return isAuthenticated() ? "Home" : "Login";
  }, [isAuthenticated]);

  if (!isReady) {
    return null; // or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerBackTitleVisible: false,
        }}>
        {isAuthenticated() ? (
          // Auth screens
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "Split Share",
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="ReceiptDetail"
              component={ReceiptDetailScreen}
              options={{ title: "Receipt Details" }}
            />
            <Stack.Screen
              name="ReceiptConfirmation"
              component={ReceiptConfirmationScreen}
              options={{
                title: "Confirm Receipt",
                // Don't allow swiping back when in confirmation screen to prevent data loss
                gestureEnabled: false,
              }}
            />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  // Using memo here to ensure the app component is not rerendered unnecessarily
  return (
    <ThemeProvider>
      <AuthProvider>
        <ReceiptProvider>
          <AppNavigator />
        </ReceiptProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
