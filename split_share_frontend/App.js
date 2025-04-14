import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@rneui/themed";
import { Icon } from "@rneui/themed";

// Screens
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import ReceiptDetailScreen from "./screens/ReceiptDetailScreen";
import ReceiptConfirmationScreen from "./screens/ReceiptConfirmationScreen";
import ReceiptSplitScreen from "./screens/ReceiptSplitScreen";
import GroupsScreen from "./screens/GroupsScreen";
import GroupDetailScreen from "./screens/GroupDetailScreen";
import CreateGroupScreen from "./screens/CreateGroupScreen";
import SplashScreen from "./screens/SplashScreen";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ReceiptProvider } from "./contexts/ReceiptContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = "home";
          } else if (route.name === "GroupsTab") {
            iconName = "people";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreenStack}
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsScreenStack}
        options={{
          title: "Groups",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function HomeScreenStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="ReceiptDetail"
        component={ReceiptDetailScreen}
        options={{
          title: "Receipt Details",
        }}
      />
    </Stack.Navigator>
  );
}

function GroupsScreenStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          title: "Groups",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{
          title: "Group Details",
        }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          title: "Create Group",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="ReceiptConfirmation"
        component={ReceiptConfirmationScreen}
        options={{
          title: "Review Receipt",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="ReceiptSplit"
        component={ReceiptSplitScreen}
        options={{
          title: "Split Receipt",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        {isAuthenticated() ? (
          <Stack.Screen
            name="MainApp"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
        ) : (
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
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ReceiptProvider>
            <AppNavigator />
          </ReceiptProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
