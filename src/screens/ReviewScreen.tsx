import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Archive, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, FileText, Image as ImageIcon, Link2, Mic, StickyNote, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { EmptyState, PrimaryButton, Screen, ScreenTitle, SheetShell } from "../components/ui";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, shadow, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";
import { getImageUri } from "../utils/capture";
import { getReminderDate, type ReminderChoice } from "../utils/reminders";

const kindIcons = { link: Link2, image: ImageIcon, note: StickyNote, document: FileText, task: CheckCircle2, voice: Mic };

export function ReviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { captures, dark, reviewIndex, advanceReview, archiveCapture, setCaptureReminder } = useAppStore();
  const theme = getTheme(dark);
  const toast = useToast();
  const [reminderOpen, setReminderOpen] = useState(false);
  const queue = captures.filter((item) => !item.archived);
  const item = queue[reviewIndex];

  const scheduleReminder = async (choice: ReminderChoice) => {
    if (!item) return;
    try {
      let permissions = await Notifications.getPermissionsAsync();
      if (permissions.status !== "granted") permissions = await Notifications.requestPermissionsAsync();
      if (permissions.status !== "granted") { Alert.alert("Notifications are off", "Allow notifications in Settings to create reminders."); return; }
      if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("reminders", { name: "Capture reminders", importance: Notifications.AndroidImportance.DEFAULT });
      const reminderNotificationId = await Notifications.scheduleNotificationAsync({
        content: { title: "Tuck reminder", body: "You have a capture to review.", data: { captureId: item.id } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: getReminderDate(choice), ...(Platform.OS === "android" ? { channelId: "reminders" } : {}) },
      });
      setCaptureReminder(item.id, reminderNotificationId);
      setReminderOpen(false);
      advanceReview();
      toast(choice === "tomorrow" ? "Reminder set for tomorrow" : "Reminder set for next week");
    } catch (error) { console.error("Failed to schedule capture reminder", error); Alert.alert("Couldn’t set reminder", "Please try again."); }
  };

  if (!item) {
    return (
      <Screen>
        <ScreenTitle title="Review" subtitle="Weekly reset" />
        <View style={styles.done}>
          <EmptyState icon={Check} title="You’re all caught up" message="The important things are still here when you need them." />
          <View style={styles.doneButton}><PrimaryButton onPress={() => navigation.navigate("Main", { screen: "Inbox" })}>Return to Inbox</PrimaryButton></View>
        </View>
      </Screen>
    );
  }

  const ItemIcon = kindIcons[item.kind];
  const imageUri = getImageUri(item);
  return (
    <Screen>
      <ScreenTitle title="Review" subtitle="Decide what stays" />
      <View style={styles.progress}>
        <Text style={[styles.meta, { color: theme.textMuted }]}>{reviewIndex + 1} of {queue.length}</Text>
        <View style={[styles.track, { backgroundColor: theme.border }]}><View style={[styles.fill, { width: `${((reviewIndex + 1) / queue.length) * 100}%`, backgroundColor: theme.accent }]} /></View>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.visual, { backgroundColor: theme.accentSoft }]}>{imageUri ? <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" /> : <ItemIcon size={48} color={theme.accentText} />}</View>
          <View style={[styles.kindBadge, { backgroundColor: theme.accentSoft }]}><ItemIcon size={14} color={theme.accentText} /><Text style={[styles.kicker, { color: theme.accentText }]}>{item.kind}</Text></View>
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
          {item.body ? <Text numberOfLines={3} style={[styles.description, { color: theme.textSecondary }]}>{item.body}</Text> : null}
          <Text style={[styles.meta, { color: theme.textMuted }]}>{item.createdAt}</Text>
        </View>
        <View style={styles.actions}>
          <Action icon={CheckCircle2} label="Keep" active onPress={advanceReview} />
          <Action icon={Archive} label="Archive" onPress={() => { archiveCapture(item.id); toast("Archived"); }} />
          <Action icon={Clock3} label="Remind" outlined onPress={() => setReminderOpen(true)} />
          <Action icon={ChevronRight} label="Open" onPress={() => navigation.navigate("CaptureDetail", { id: item.id, returnTo: "Review" })} />
        </View>
      </ScrollView>
      <Modal visible={reminderOpen} transparent animationType="slide" onRequestClose={() => setReminderOpen(false)}>
        <Pressable style={[styles.scrim, { backgroundColor: theme.scrim }]} onPress={() => setReminderOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <SheetShell>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Remind me</Text>
              <Text style={[styles.sheetCopy, { color: theme.textSecondary }]}>Choose when Tuck should bring this capture back.</Text>
              <ReminderRow label="Tomorrow at 9:00 AM" onPress={() => void scheduleReminder("tomorrow")} />
              <ReminderRow label="Next week at 9:00 AM" onPress={() => void scheduleReminder("next-week")} />
              <PrimaryButton secondary onPress={() => setReminderOpen(false)}>Cancel</PrimaryButton>
            </SheetShell>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function Action({ icon: Icon, label, onPress, active = false, outlined = false }: { icon: LucideIcon; label: string; onPress: () => void; active?: boolean; outlined?: boolean }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, { backgroundColor: active ? theme.accent : theme.surface, borderColor: outlined ? theme.accent : theme.border }, pressed && styles.pressed]}><Icon size={21} color={active ? theme.onAccent : outlined ? theme.accentText : theme.text} /><Text style={[styles.actionText, { color: active ? theme.onAccent : outlined ? theme.accentText : theme.text }]}>{label}</Text></Pressable>;
}

function ReminderRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.reminderRow, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, pressed && styles.pressed]}><CalendarDays size={20} color={theme.text} /><Text style={[styles.reminderText, { color: theme.text }]}>{label}</Text><ChevronRight size={18} color={theme.textMuted} /></Pressable>;
}

const styles = StyleSheet.create({
  progress: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  meta: { ...type.meta },
  track: { height: 5, borderRadius: radius.full, overflow: "hidden" },
  fill: { height: 5, borderRadius: radius.full },
  body: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xxl, justifyContent: "center", gap: spacing.md },
  card: { minHeight: 350, padding: spacing.lg, borderRadius: 26, borderWidth: StyleSheet.hairlineWidth, justifyContent: "flex-end", ...shadow },
  visual: { flex: 1, minHeight: 165, marginBottom: spacing.md, borderRadius: radius.md, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  kindBadge: { alignSelf: "flex-start", minHeight: 30, paddingHorizontal: 10, borderRadius: radius.full, flexDirection: "row", alignItems: "center", gap: 6 },
  kicker: { ...type.meta, fontWeight: "700", textTransform: "capitalize" },
  title: { ...type.section, marginTop: spacing.sm },
  description: { ...type.body, marginTop: spacing.xs },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  action: { width: "48%", flexGrow: 1, minHeight: 58, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  actionText: { ...type.label },
  pressed: { opacity: 0.7, transform: [{ scale: 0.985 }] },
  done: { flex: 1, paddingHorizontal: spacing.xxl, alignItems: "center", justifyContent: "center", gap: spacing.xl },
  doneButton: { width: "100%" },
  scrim: { flex: 1, justifyContent: "flex-end" },
  sheetTitle: { ...type.title },
  sheetCopy: { ...type.body, marginTop: -8 },
  reminderRow: { minHeight: 58, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  reminderText: { ...type.body, flex: 1, fontWeight: "600" },
});
