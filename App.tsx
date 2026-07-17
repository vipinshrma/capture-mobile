import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { ToastProvider } from "./src/components/ToastProvider";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppStoreProvider, useAppStore } from "./src/store/AppStore";

function Root() {
  const { dark } = useAppStore();
  return (
    <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
      <StatusBar style={dark ? "light" : "dark"} />
      <SafeAreaView style={{ flex: 1, backgroundColor: dark ? "#000000" : "#F3F1ED" }} edges={["top"]}>
        <AppNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <ToastProvider><Root /></ToastProvider>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
