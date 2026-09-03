import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Globe2, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BackHeader, Screen } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Privacy">;

const rows = [
  [LockKeyhole, "Captures are stored in Tuck’s local app storage and are excluded from Android cloud backup."],
  [ShieldCheck, "No account is required to use Tuck."],
  [Globe2, "Tuck does not fetch page content. Recognized services may load a favicon from Google when capture details open."],
  [Trash2, "You can delete everything at any time."],
] as const;

export function PrivacyScreen({ navigation }: Props) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return (
    <Screen>
      <BackHeader onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Your captures belong to you</Text>
        <Text style={[styles.lede, { color: theme.textSecondary }]}>Tuck is designed to work without an account and keep your saved content on your device.</Text>
        <View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}>{rows.map(([Icon, text], index) => <View key={text} style={[styles.row, index < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}><View style={[styles.icon, { backgroundColor: theme.accentSoft }]}><Icon size={18} color={theme.accentText} /></View><Text style={[styles.text, { color: theme.text }]}>{text}</Text></View>)}</View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 48 },
  title: { ...type.display },
  lede: { ...type.body, marginTop: spacing.sm, marginBottom: spacing.xl, maxWidth: 340 },
  group: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  row: { minHeight: 82, padding: spacing.md, flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  icon: { width: 38, height: 38, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, paddingTop: 7, ...type.body },
});
