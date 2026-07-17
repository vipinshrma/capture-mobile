import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { CheckCircle2, Inbox, Search } from "lucide-react-native";
import { ArchiveScreen } from "../screens/ArchiveScreen";
import { CaptureDetailScreen } from "../screens/CaptureDetailScreen";
import { EmptyInboxScreen } from "../screens/EmptyInboxScreen";
import { FavouritesScreen } from "../screens/FavouritesScreen";
import { InboxScreen } from "../screens/InboxScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { PrivacyScreen } from "../screens/PrivacyScreen";
import { ReviewScreen } from "../screens/ReviewScreen";
import { SearchResultsScreen } from "../screens/SearchResultsScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ShareCaptureScreen } from "../screens/ShareCaptureScreen";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList, TabParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { dark } = useAppStore();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: [styles.tabBar, dark && styles.darkTabBar],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size }) => {
          const Icon = route.name === "Inbox" ? Inbox : route.name === "Search" ? Search : CheckCircle2;
          return <Icon color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Review" component={ReviewScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { dark, hydrated, onboarded } = useAppStore();
  if (!hydrated) return <View style={styles.loader}><ActivityIndicator color={colors.accent} /></View>;
  return (
    <Stack.Navigator initialRouteName={onboarded ? "Main" : "Onboarding"} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: dark ? colors.darkBackground : colors.background } }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="EmptyInbox" component={EmptyInboxScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ShareCapture" component={ShareCaptureScreen} options={{ presentation: "transparentModal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="CaptureDetail" component={CaptureDetailScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Archive" component={ArchiveScreen} />
      <Stack.Screen name="Favourites" component={FavouritesScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  tabBar: { height: 70, paddingTop: 7, paddingBottom: 10, backgroundColor: "rgba(255,255,255,.96)", borderTopColor: colors.separator },
  darkTabBar: { backgroundColor: colors.darkCard, borderTopColor: "#2C2C2E" },
  tabLabel: { fontSize: 10 },
});
