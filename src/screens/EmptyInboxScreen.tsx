import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FileText, Image, Link2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EmptyState, PrimaryButton, Screen, ScreenTitle } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, shadow, spacing } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EmptyInbox">;

export function EmptyInboxScreen({ navigation }: Props) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return (
    <Screen>
      <ScreenTitle title="Inbox" subtitle="All captures" onAvatar={() => navigation.navigate("Settings")} />
      <View style={styles.body}>
        <View style={[styles.art, { backgroundColor: theme.accentSoft }]}>{[Link2, Image, FileText].map((Icon, index) => <View key={index} style={[styles.artCard, { backgroundColor: theme.surface }]}><Icon size={23} color={theme.accentText} /></View>)}</View>
        <EmptyState icon={FileText} title="Your inbox is ready" message="Save links, screenshots, notes, voice recordings, and files without organizing them first." />
        <View style={styles.actions}>
          <PrimaryButton onPress={() => navigation.replace("Main", { screen: "Inbox", params: { openQuickCapture: true } })}>Capture something</PrimaryButton>
          <Pressable onPress={() => navigation.replace("Main")} style={styles.textButton}><Text style={[styles.textButtonLabel, { color: theme.accentText }]}>Explore the inbox</Text></Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 28, alignItems: "center", justifyContent: "center", gap: spacing.xl },
  art: { width: 180, height: 180, borderRadius: 28, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  artCard: { width: 48, height: 60, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", marginHorizontal: -5, ...shadow },
  actions: { width: "100%", gap: spacing.xs },
  textButton: { height: 48, alignItems: "center", justifyContent: "center" },
  textButtonLabel: { fontSize: 16, fontWeight: "600" },
});
