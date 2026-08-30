import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FileText, Image, Link2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton, ScreenTitle } from "../components/ui";
import { colors, shadow } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EmptyInbox">;

export function EmptyInboxScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <ScreenTitle title="Inbox" onAvatar={() => navigation.navigate("Settings")} />
      <View style={styles.body}>
        <View style={styles.art}>
          {[Link2, Image, FileText].map((Icon, index) => <View key={index} style={styles.artCard}><Icon size={23} color={colors.accent} /></View>)}
        </View>
        <View>
          <Text style={styles.title}>Your inbox is ready</Text>
          <Text style={styles.copy}>Save links, screenshots, notes and files from any app using the Share button.</Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton onPress={() => navigation.replace("Main", { screen: "Inbox", params: { openQuickCapture: true } })}>Capture something</PrimaryButton>
          <Pressable onPress={() => navigation.replace("Main")} style={styles.textButton}><Text style={styles.textButtonLabel}>Explore the inbox</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, paddingHorizontal: 28, alignItems: "center", justifyContent: "center", gap: 22 },
  art: { width: 180, height: 180, borderRadius: 24, backgroundColor: colors.accentSoft, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  artCard: { width: 48, height: 60, borderRadius: 13, backgroundColor: "white", alignItems: "center", justifyContent: "center", marginHorizontal: -5, ...shadow },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", textAlign: "center" },
  copy: { marginTop: 8, color: colors.secondary, fontSize: 15, lineHeight: 22, textAlign: "center" },
  actions: { width: "100%", gap: 6 },
  textButton: { height: 48, alignItems: "center", justifyContent: "center" },
  textButtonLabel: { color: colors.accent, fontSize: 16, fontWeight: "600" },
});
