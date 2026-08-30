import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronRight } from "lucide-react-native";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { BackHeader, SectionLabel } from "../components/ui";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { dark, deleteAllCaptures, setDark } = useAppStore();
  const toast = useToast();
  const deleteAll = () => Alert.alert("Delete all captures?", "This removes every capture and local attachment. This can’t be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete All", style: "destructive", onPress: async () => {
      if (await deleteAllCaptures()) {
        toast("All captures deleted");
        navigation.navigate("Main", { screen: "Inbox" });
      } else Alert.alert("Couldn’t delete all data", "Your data was not fully removed. Please try again.");
    } },
  ]);
  return (
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <BackHeader title="Settings" dark={dark} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View><SectionLabel>Appearance</SectionLabel><View style={[styles.group, dark && styles.darkGroup]}><View style={styles.row}><Text style={[styles.rowText, dark && styles.darkText]}>Dark mode</Text><View style={styles.switchSlot}><Switch accessibilityLabel="Dark mode" value={dark} onValueChange={setDark} trackColor={{ false: dark ? "#3A3A3C" : "#D1D1D6", true: colors.accent }} ios_backgroundColor={dark ? "#3A3A3C" : "#D1D1D6"} /></View></View></View></View>
        <View><SectionLabel>Privacy</SectionLabel><View style={[styles.group, dark && styles.darkGroup]}>
          <Row dark={dark} label="Your captures belong to you" onPress={() => navigation.navigate("Privacy")} />
          <Row dark={dark} label="Delete all data" onPress={deleteAll} danger last />
        </View></View>
        <View><SectionLabel>Data</SectionLabel><View style={[styles.group, dark && styles.darkGroup]}>
          <Row dark={dark} label="Favourites" onPress={() => navigation.navigate("Favourites")} />
          <Row dark={dark} label="Archive" onPress={() => navigation.navigate("Archive")} last />
        </View></View>
      </ScrollView>
    </View>
  );
}

function Row({ label, onPress, dark = false, danger = false, last = false }: { label: string; onPress?: () => void; dark?: boolean; danger?: boolean; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !last && styles.divider]}>
      <Text style={[styles.rowText, dark && styles.darkText, danger && { color: colors.danger }]}>{label}</Text>
      {onPress && <ChevronRight size={17} color={colors.faint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  darkScreen: { backgroundColor: colors.darkBackground },
  content: { padding: 16, gap: 18 },
  group: { marginTop: 6, borderRadius: 16, overflow: "hidden", backgroundColor: "white" },
  darkGroup: { backgroundColor: colors.darkCard },
  row: { height: 52, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowText: { color: colors.text, fontSize: 15.5 },
  darkText: { color: colors.darkText },
  switchSlot: { width: 52, height: 52, alignItems: "flex-end", justifyContent: "center" },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
});
