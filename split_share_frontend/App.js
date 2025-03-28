import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "@rneui/themed";
import HomeScreen from "./screens/HomeScreen";
import ReceiptDetailScreen from "./screens/ReceiptDetailScreen";
import ReceiptConfirmationScreen from "./screens/ReceiptConfirmationScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#2089dc",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Split Share" }}
          />
          <Stack.Screen
            name="ReceiptDetail"
            component={ReceiptDetailScreen}
            options={{ title: "Receipt Details" }}
          />
          <Stack.Screen
            name="ReceiptConfirmation"
            component={ReceiptConfirmationScreen}
            options={{ title: "Confirm Receipt" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
