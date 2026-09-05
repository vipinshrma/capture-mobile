import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Clipboard from "expo-clipboard";
import { shareAsync } from "expo-sharing";
import { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { Archive, Clock3, Copy, Heart, Pause, Play, Share2, Trash2, type LucideIcon } from "lucide-react-native";
import { useAppStore } from "../store/AppStore";
import { useToast } from "../components/ToastProvider";
import { BackHeader, PrimaryButton, Screen, SectionLabel } from "../components/ui";
import { getTheme, radius, shadow, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";
import { formatCaptureTime, getImageUri, getPlatform, getSourceUrl } from "../utils/capture";
import { formatReminderLabel } from "../utils/reminders";

type Props = NativeStackScreenProps<RootStackParamList, "CaptureDetail">;

export function CaptureDetailScreen({ navigation, route }: Props) {
  const { captures, dark, now, toggleFavourite, archiveCapture, deleteCapture, updateCaptureNote } = useAppStore();
  const theme = getTheme(dark);
  const toast = useToast();
  const id = route.params?.id || captures[0]?.id;
  const capture = captures.find((item) => item.id === id);
  const back = () => route.params?.returnTo === "Review" ? navigation.navigate("Main", { screen: "Review" }) : navigation.goBack();
  const [logoFailed, setLogoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [note, setNote] = useState(capture?.userNote || "");

  useEffect(() => setNote(capture?.userNote || ""), [capture?.id, capture?.userNote]);

  if (!capture) return <Screen><View style={styles.center}><Text style={{ color: theme.text }}>This capture no longer exists.</Text></View></Screen>;

  const imageUri = getImageUri(capture);
  const platform = getPlatform(capture.source, capture.title);
  const sourceUrl = getSourceUrl(capture.source, capture.title, capture.body, capture.userNote, capture.metadataTitle, capture.metadataDescription);
  const extractedText = capture.body || capture.metadataDescription;
  const noteChanged = note.trim() !== (capture.userNote || "");
  const reminderLabel = formatReminderLabel(capture.reminderNotificationId ? capture.reminderAt : undefined, new Date(now));
  const saveNote = () => { updateCaptureNote(capture.id, note); toast("Note saved"); };
  const copyText = async () => {
    if (!extractedText) return;
    try { await Clipboard.setStringAsync(extractedText); toast("Copied"); }
    catch (error) { console.error("Failed to copy capture text", error); Alert.alert("Couldn’t copy this text", "Please try again."); }
  };
  const openLink = async () => {
    if (!sourceUrl) return;
    try { await Linking.openURL(sourceUrl); }
    catch (error) { console.error("Failed to open capture link", error); Alert.alert("Couldn’t open this link", "Please try again."); }
  };
  const share = async () => {
    try {
      if (capture.localFileUri) {
        await shareAsync(capture.localFileUri, { mimeType: capture.mimeType, dialogTitle: capture.title });
        toast("Shared");
      } else {
        const result = await Share.share({ message: [...new Set([capture.title, extractedText, capture.userNote, sourceUrl].filter(Boolean))].join("\n\n"), url: sourceUrl });
        if (result.action === Share.sharedAction) toast("Shared");
      }
    } catch (error) { console.error("Failed to share capture", error); Alert.alert("Couldn’t share this capture", "Please try again."); }
  };
  const archive = () => { archiveCapture(capture.id); toast("Archived"); navigation.navigate("Main"); };
  const remove = () => Alert.alert("Delete this capture?", "This can’t be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => {
      if (await deleteCapture(capture.id)) { toast("Deleted"); navigation.navigate("Main"); }
      else Alert.alert("Couldn’t delete this capture", "Please try again.");
    } },
  ]);

  return (
    <Screen>
      <BackHeader onBack={back} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboard}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
        <Text style={[styles.screenTitle, { color: theme.text }]}>Capture Detail</Text>
        <View style={styles.metaRow}>
          {platform && !logoFailed ? <Image source={{ uri: platform.iconUri }} style={styles.platformLogo} accessibilityLabel={`${platform.name} logo`} onError={() => setLogoFailed(true)} /> : null}
          {platform && logoFailed ? <Text style={[styles.platformText, { color: theme.accentText }]}>{platform.label}</Text> : null}
          <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}><Text style={[styles.badgeText, { color: theme.accentText }]}>{capture.category || capture.kind}</Text></View>
          <Text numberOfLines={1} style={[styles.meta, { color: theme.textMuted }]}>{capture.metadataSiteName || platform?.name || capture.source} · {formatCaptureTime(capture.capturedAt, capture.createdAt, new Date(now))}</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{capture.title}</Text>
        {reminderLabel ? <View style={[styles.reminderBadge, { backgroundColor: theme.accentSoft }]}><Clock3 size={15} color={theme.accentText} /><Text style={[styles.badgeText, { color: theme.accentText }]}>{reminderLabel}</Text></View> : null}

        {capture.kind === "voice" && capture.localFileUri ? <VoicePlayer uri={capture.localFileUri} dark={dark} /> : imageUri && !imageFailed ? <Image source={{ uri: imageUri }} style={[styles.imagePreview, { backgroundColor: theme.surfaceMuted }]} resizeMode="cover" accessibilityLabel={capture.title} onError={() => setImageFailed(true)} /> : platform && !logoFailed ? <View style={[styles.preview, { backgroundColor: theme.accentSoft }]}><Image source={{ uri: platform.iconUri }} style={styles.previewPlatformLogo} resizeMode="contain" accessibilityLabel={`${platform.name} logo`} onError={() => setLogoFailed(true)} /></View> : <View style={[styles.preview, { backgroundColor: theme.accentSoft }]}><View style={[styles.browserBar, { backgroundColor: theme.surface }]} /><View style={[styles.line, { backgroundColor: theme.accent }]} /><View style={[styles.line, { width: "58%", backgroundColor: theme.accent }]} /><View style={[styles.line, { width: "75%", backgroundColor: theme.accent }]} /></View>}
        {sourceUrl ? <PrimaryButton secondary onPress={() => void openLink()}>Open Link</PrimaryButton> : null}

        <View style={[styles.extracted, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.extractedHeader}><Text style={[styles.extractedTitle, { color: theme.text }]}>Saved text</Text>{extractedText ? <Pressable accessibilityLabel="Copy saved text" onPress={copyText} style={styles.copy}><Copy size={16} color={theme.accentText} /><Text style={[styles.accentText, { color: theme.accentText }]}>Copy</Text></Pressable> : null}</View>
          <Text style={[styles.body, { color: theme.textSecondary }]}>{extractedText || "No saved text is available for this capture."}</Text>
        </View>

        <View style={styles.noteSection}>
          <SectionLabel>Your note</SectionLabel>
          <TextInput accessibilityLabel="Capture note" multiline value={note} onChangeText={setNote} placeholder="Add a note…" placeholderTextColor={theme.textMuted} style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]} />
          <PrimaryButton disabled={!noteChanged} onPress={saveNote}>Save Note</PrimaryButton>
        </View>

        <View style={styles.actions}>
          <DetailAction icon={Share2} label="Share" onPress={() => void share()} />
          <DetailAction icon={Heart} label="Favourite" active={Boolean(capture.favourite)} onPress={() => { toggleFavourite(capture.id); toast(capture.favourite ? "Removed from Favourites" : "Added to Favourites"); }} />
          <DetailAction icon={Archive} label="Archive" onPress={archive} />
          <DetailAction icon={Trash2} label="Delete" danger onPress={remove} />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function DetailAction({ icon: Icon, label, onPress, active = false, danger = false }: { icon: LucideIcon; label: string; onPress: () => void; active?: boolean; danger?: boolean }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  const color = danger ? theme.danger : active ? theme.accentText : theme.text;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.detailAction, pressed && styles.pressed]}><View style={[styles.actionCircle, { backgroundColor: active ? theme.accentSoft : theme.surface, borderColor: danger ? theme.danger : theme.border }]}><Icon size={22} color={color} fill={active ? color : "transparent"} /></View><Text numberOfLines={1} style={[styles.actionLabel, { color }]}>{label}</Text></Pressable>;
}

function VoicePlayer({ uri, dark }: { uri: string; dark: boolean }) {
  const theme = getTheme(dark);
  const player = useAudioPlayer(uri, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const duration = status.duration || 0;
  const progress = duration ? Math.min(status.currentTime / duration, 1) : 0;
  const toggle = async () => {
    if (status.playing) { player.pause(); return; }
    if (duration && status.currentTime >= duration - 0.1) await player.seekTo(0);
    player.play();
  };
  return (
    <View style={[styles.voicePlayer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Pressable accessibilityLabel={status.playing ? "Pause voice note" : "Play voice note"} accessibilityRole="button" disabled={!status.isLoaded} onPress={() => void toggle()} style={[styles.playButton, { backgroundColor: theme.accent }, !status.isLoaded && styles.disabled]}>{status.playing ? <Pause size={25} color={theme.onAccent} fill={theme.onAccent} /> : <Play size={25} color={theme.onAccent} fill={theme.onAccent} />}</Pressable>
      <View style={styles.voiceProgress}>
        <Text style={[styles.voiceLabel, { color: theme.text }]}>{status.isLoaded ? "Voice note" : "Loading recording…"}</Text>
        <View style={[styles.progressTrack, { backgroundColor: theme.accentSoft }]}><View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.accent }]} /></View>
        <View style={styles.timeRow}><Text style={[styles.time, { color: theme.textMuted }]}>{formatTime(status.currentTime)}</Text><Text style={[styles.time, { color: theme.textMuted }]}>{formatTime(duration)}</Text></View>
      </View>
    </View>
  );
}

function formatTime(seconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: spacing.md, paddingBottom: 48, gap: spacing.md },
  screenTitle: { ...type.display },
  metaRow: { minHeight: 28, flexDirection: "row", alignItems: "center", gap: 7 },
  platformLogo: { width: 22, height: 22, borderRadius: 5 },
  platformText: { minWidth: 22, fontSize: 12, fontWeight: "800", textAlign: "center" },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  badgeText: { ...type.meta, fontWeight: "700", textTransform: "capitalize" },
  reminderBadge: { alignSelf: "flex-start", minHeight: 30, paddingHorizontal: 10, borderRadius: radius.full, flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { ...type.meta, maxWidth: 230 },
  title: { ...type.title },
  preview: { height: 210, borderRadius: radius.lg, justifyContent: "center", padding: 28, gap: spacing.sm, ...shadow },
  imagePreview: { height: 280, borderRadius: radius.lg, ...shadow },
  previewPlatformLogo: { width: 88, height: 88, borderRadius: radius.md, alignSelf: "center" },
  browserBar: { height: 24, borderRadius: 8, opacity: 0.82 },
  line: { width: "86%", height: 7, borderRadius: radius.full, opacity: 0.25 },
  voicePlayer: { minHeight: 150, padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: spacing.md, ...shadow },
  playButton: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center" },
  voiceProgress: { flex: 1, gap: spacing.xs },
  voiceLabel: { ...type.cardTitle },
  progressTrack: { height: 5, borderRadius: radius.full, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: radius.full },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
  time: { ...type.meta },
  extracted: { padding: spacing.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, gap: spacing.xs },
  extractedHeader: { minHeight: 28, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  extractedTitle: { ...type.cardTitle },
  body: { ...type.body },
  copy: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: spacing.md },
  accentText: { ...type.label },
  noteSection: { gap: spacing.sm },
  input: { minHeight: 130, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, ...type.body, textAlignVertical: "top" },
  actions: { flexDirection: "row", justifyContent: "space-between", gap: spacing.xs, marginTop: spacing.xs },
  detailAction: { flex: 1, minWidth: 0, alignItems: "center", gap: spacing.xs },
  actionCircle: { width: 58, height: 58, borderRadius: 29, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11.5, lineHeight: 16, fontWeight: "600" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.42 },
});
