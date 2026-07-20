import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { ToastProvider } from "./src/components/ToastProvider";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppStoreProvider, useAppStore } from "./src/store/AppStore";

const linking = {
  prefixes: [Linking.createURL("/")],
  config: { screens: { ShareCapture: "handle-share" } },
  async getInitialURL() {
    return processURL(await Linking.getInitialURL());
  },
  subscribe(listener: (url: string) => void) {
    const subscription = Linking.addEventListener("url", ({ url }) => listener(processURL(url) || url));
    return () => subscription.remove();
  },
};

function processURL(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname === "expo-sharing" ? Linking.createURL("/handle-share") : url;
  } catch {
    return url;
  }
}

function Root() {
  const { dark } = useAppStore();
  return (
    <NavigationContainer linking={linking} theme={dark ? DarkTheme : DefaultTheme}>
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
