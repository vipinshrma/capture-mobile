import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Archive, ChevronRight, Heart, Moon, ShieldCheck, Trash2, type LucideIcon } from "lucide-react-native";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { BackHeader, Screen, SectionLabel } from "../components/ui";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { dark, deleteAllCaptures, setDark } = useAppStore();
  const theme = getTheme(dark);
  const toast = useToast();
  const deleteAll = () => Alert.alert("Delete all captures?", "This removes every capture and local attachment. This can’t be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete All", style: "destructive", onPress: async () => {
      if (await deleteAllCaptures()) { toast("All captures deleted"); navigation.navigate("Main", { screen: "Inbox" }); }
      else Alert.alert("Couldn’t delete all data", "Your data was not fully removed. Please try again.");
    } },
  ]);

  return (
    <Screen>
      <BackHeader onBack={navigation.goBack} />
      <View style={styles.heading}><Text style={[styles.title, { color: theme.text }]}>Settings</Text><Text style={[styles.subtitle, { color: theme.textSecondary }]}>Make Tuck feel right for you.</Text></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View><SectionLabel>Appearance</SectionLabel><View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}><View style={styles.row}><RowIcon icon={Moon} /><Text style={[styles.rowText, { color: theme.text }]}>Dark mode</Text><View style={styles.switchSlot}><Switch accessibilityLabel="Dark mode" value={dark} onValueChange={setDark} trackColor={{ false: theme.border, true: theme.accent }} ios_backgroundColor={theme.border} /></View></View></View></View>
        <View><SectionLabel>Library</SectionLabel><View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}><Row icon={Heart} label="Favourites" onPress={() => navigation.navigate("Favourites")} /><Row icon={Archive} label="Archive" onPress={() => navigation.navigate("Archive")} last /></View></View>
        <View><SectionLabel>Privacy and data</SectionLabel><View style={[styles.group, { backgroundColor: theme.surface, borderColor: theme.border }]}><Row icon={ShieldCheck} label="Your captures belong to you" onPress={() => navigation.navigate("Privacy")} /><Row icon={Trash2} label="Delete all data" onPress={deleteAll} danger last /></View></View>
      </ScrollView>
    </Screen>
  );
}

function RowIcon({ icon: Icon, danger = false }: { icon: LucideIcon; danger?: boolean }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return <View style={[styles.rowIcon, { backgroundColor: danger ? "transparent" : theme.accentSoft }]}><Icon size={18} color={danger ? theme.danger : theme.accentText} /></View>;
}

function Row({ icon, label, onPress, danger = false, last = false }: { icon: LucideIcon; label: string; onPress: () => void; danger?: boolean; last?: boolean }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }, pressed && styles.pressed]}><RowIcon icon={icon} danger={danger} /><Text style={[styles.rowText, { color: danger ? theme.danger : theme.text }]}>{label}</Text><ChevronRight size={18} color={theme.textMuted} /></Pressable>;
}

const styles = StyleSheet.create({
  heading: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { ...type.display },
  subtitle: { ...type.body, marginTop: spacing.xs },
  content: { padding: spacing.md, paddingBottom: 48, gap: spacing.xl },
  group: { marginTop: spacing.xs, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  row: { minHeight: 62, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  rowText: { ...type.body, flex: 1, fontWeight: "600" },
  switchSlot: { width: 58, height: 52, alignItems: "flex-end", justifyContent: "center" },
  pressed: { opacity: 0.68 },
});
