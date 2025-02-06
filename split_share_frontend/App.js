import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "@rneui/themed";
import HomeScreen from "./screens/HomeScreen";
import ReceiptDetailScreen from "./screens/ReceiptDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
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
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
