import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LockKeyhole, ShieldCheck, Trash2 } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BackHeader } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Privacy">;

const rows = [
  [LockKeyhole, "Captures stay in Tuck’s protected app storage and are excluded from Android cloud backup."],
  [ShieldCheck, "An account is never required."],
  [Trash2, "You can delete everything at any time."],
] as const;

export function PrivacyScreen({ navigation }: Props) {
  const { dark } = useAppStore();
  return (
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <BackHeader dark={dark} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, dark && styles.darkText]}>Your captures belong to you</Text>
        {rows.map(([Icon, text]) => <View key={text} style={styles.row}><View style={styles.icon}><Icon size={18} color={colors.accent} /></View><Text style={[styles.text, dark && styles.darkText]}>{text}</Text></View>)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  darkScreen: { backgroundColor: colors.darkBackground },
  darkText: { color: colors.darkText },
  content: { padding: 20, gap: 16 },
  title: { color: colors.text, fontSize: 24, lineHeight: 31, fontWeight: "700", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, paddingTop: 7, color: "#3A3A3C", fontSize: 15, lineHeight: 22 },
});
