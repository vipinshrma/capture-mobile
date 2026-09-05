import { createNavigationContainerRef, DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ToastProvider } from "./src/components/ToastProvider";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppStoreProvider, useAppStore } from "./src/store/AppStore";
import { getTheme } from "./src/theme";
import type { RootStackParamList } from "./src/types";

const navigationRef = createNavigationContainerRef<RootStackParamList>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

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
  const { captures, dark, hydrated } = useAppStore();
  const theme = getTheme(dark);
  const response = Notifications.useLastNotificationResponse();
  const handledResponse = useRef<string | undefined>(undefined);

  useEffect(() => {
    const request = response?.notification.request;
    const captureId = request?.content.data?.captureId;
    if (!request || !hydrated || !navigationRef.isReady() || typeof captureId !== "string" || handledResponse.current === request.identifier) return;
    handledResponse.current = request.identifier;
    if (captures.some((capture) => capture.id === captureId)) navigationRef.navigate("CaptureDetail", { id: captureId });
    else navigationRef.navigate("Main", { screen: "Inbox" });
    Notifications.clearLastNotificationResponse();
  }, [captures, hydrated, response]);

  return (
    <NavigationContainer ref={navigationRef} linking={linking} theme={dark ? DarkTheme : DefaultTheme}>
      <StatusBar style={dark ? "light" : "dark"} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top"]}>
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
