import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Archive, Check, CheckCircle2, ChevronRight, Clock3, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton, ScreenTitle } from "../components/ui";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store/AppStore";
import { colors, shadow } from "../theme";
import type { RootStackParamList } from "../types";

export function ReviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { captures, dark, reviewIndex, advanceReview, archiveCapture } = useAppStore();
  const toast = useToast();
  const queue = captures.filter((item) => !item.archived);
  const item = queue[reviewIndex];

  if (!item) {
    return (
      <View style={[styles.screen, dark && styles.darkScreen]}>
        <ScreenTitle title="Review" dark={dark} />
        <View style={styles.done}>
          <View style={styles.success}><Check size={34} color={colors.accent} /></View>
          <Text style={[styles.doneTitle, dark && styles.darkText]}>You’re all caught up</Text>
          <Text style={styles.doneCopy}>The important things are still here when you need them.</Text>
          <PrimaryButton onPress={() => navigation.navigate("Main", { screen: "Inbox" })}>Return to Inbox</PrimaryButton>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <ScreenTitle title="Review" dark={dark} />
      <View style={styles.progress}>
        <Text style={styles.meta}>{reviewIndex + 1} of {queue.length}</Text>
        <View style={styles.track}><View style={[styles.fill, { width: `${((reviewIndex + 1) / queue.length) * 100}%` }]} /></View>
      </View>
      <View style={styles.body}>
        <View style={[styles.card, dark && styles.darkCard]}>
          <View style={styles.visual}><Sparkles size={46} color={colors.accent} /></View>
          <Text style={styles.kicker}>{item.kind} · {item.source || "Capture"}</Text>
          <Text style={[styles.title, dark && styles.darkText]}>{item.title}</Text>
          <Text style={styles.meta}>{item.createdAt}</Text>
        </View>
        <View style={styles.actions}>
          <Action icon={CheckCircle2} label="Keep" dark={dark} onPress={advanceReview} />
          <Action icon={Archive} label="Archive" dark={dark} onPress={() => { archiveCapture(item.id); toast("Archived"); }} />
          <Action icon={Clock3} label="Remind" dark={dark} onPress={() => { advanceReview(); toast("Remind later"); }} />
          <Action icon={ChevronRight} label="Open" active onPress={() => navigation.navigate("CaptureDetail", { id: item.id, returnTo: "Review" })} />
        </View>
      </View>
    </View>
  );
}

function Action({ icon: Icon, label, onPress, active = false, dark = false }: {
  icon: typeof Check;
  label: string;
  onPress: () => void;
  active?: boolean;
  dark?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.action, dark && styles.darkCard, active && styles.activeAction]}>
      <Icon size={22} color={active ? "white" : colors.secondary} />
      <Text style={[styles.actionText, active && { color: "white" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  darkScreen: { backgroundColor: colors.darkBackground },
  darkCard: { backgroundColor: colors.darkCard },
  darkText: { color: colors.darkText },
  progress: { paddingHorizontal: 20, gap: 8 },
  meta: { color: colors.faint, fontSize: 12, marginTop: 7 },
  track: { height: 5, borderRadius: 3, backgroundColor: "#DDD9D2", overflow: "hidden" },
  fill: { height: 5, borderRadius: 3, backgroundColor: colors.accent },
  body: { flex: 1, padding: 20, justifyContent: "center", gap: 18 },
  card: { minHeight: 380, padding: 22, borderRadius: 26, backgroundColor: "white", justifyContent: "flex-end", ...shadow },
  visual: { flex: 1, marginBottom: 22, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  kicker: { color: colors.accent, fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: "600", marginTop: 6 },
  actions: { flexDirection: "row", gap: 7 },
  action: { flex: 1, height: 66, borderRadius: 18, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", gap: 5 },
  activeAction: { backgroundColor: colors.accent },
  actionText: { color: colors.secondary, fontSize: 11.5, fontWeight: "600" },
  done: { flex: 1, paddingHorizontal: 32, alignItems: "center", justifyContent: "center", gap: 16 },
  success: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  doneTitle: { color: colors.text, fontSize: 22, fontWeight: "700" },
  doneCopy: { color: colors.secondary, fontSize: 15, lineHeight: 22, textAlign: "center", marginBottom: 8 },
});
