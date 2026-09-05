import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Clipboard from "expo-clipboard";
import { shareAsync } from "expo-sharing";
import { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { Archive, Check, Clock3, Copy, ExternalLink, FileText, Heart, Pause, Pencil, Play, Share2, StickyNote, Trash2, X, type LucideIcon } from "lucide-react-native";
import { useAppStore } from "../store/AppStore";
import { useToast } from "../components/ToastProvider";
import { BackHeader, PrimaryButton, Screen } from "../components/ui";
import { getTheme, radius, shadow, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";
import { formatCaptureTime, getImageUri, getPlatform, getSourceUrl } from "../utils/capture";
import { formatReminderLabel } from "../utils/reminders";

type Props = NativeStackScreenProps<RootStackParamList, "CaptureDetail">;

export function CaptureDetailScreen({ navigation, route }: Props) {
  const { captures, dark, now, toggleFavourite, archiveCapture, deleteCapture, updateCaptureNote, updateCaptureTitle, updateCaptureBody } = useAppStore();
  const theme = getTheme(dark);
  const toast = useToast();
  const id = route.params?.id || captures[0]?.id;
  const capture = captures.find((item) => item.id === id);
  const back = () => route.params?.returnTo === "Review" ? navigation.navigate("Main", { screen: "Review" }) : navigation.goBack();
  const [logoFailed, setLogoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [note, setNote] = useState(capture?.userNote || "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(capture?.title || "");
  const [editingBody, setEditingBody] = useState(false);
  const [bodyDraft, setBodyDraft] = useState(capture?.body || capture?.metadataDescription || "");
  const [noteFocused, setNoteFocused] = useState(false);

  useEffect(() => setNote(capture?.userNote || ""), [capture?.id, capture?.userNote]);
  useEffect(() => {
    if (!editingTitle) setTitleDraft(capture?.title || "");
  }, [capture?.id, capture?.title, editingTitle]);
  useEffect(() => {
    if (!editingBody) setBodyDraft(capture?.body || capture?.metadataDescription || "");
  }, [capture?.id, capture?.body, capture?.metadataDescription, editingBody]);

  if (!capture) return <Screen><View style={styles.center}><Text style={{ color: theme.text }}>This capture no longer exists.</Text></View></Screen>;

  const imageUri = getImageUri(capture);
  const platform = getPlatform(capture.source, capture.title);
  const sourceUrl = getSourceUrl(capture.source, capture.title, capture.body, capture.userNote, capture.metadataTitle, capture.metadataDescription);
  const extractedText = capture.body || capture.metadataDescription;
  const siteName = capture.metadataSiteName || platform?.name || capture.source || "Saved capture";
  const timeLabel = formatCaptureTime(capture.capturedAt, capture.createdAt, new Date(now));
  const wordCount = extractedText ? extractedText.trim().split(/\s+/).filter(Boolean).length : 0;
  const noteChanged = note.trim() !== (capture.userNote || "");
  const titleChanged = titleDraft.trim() !== (capture.title || "") && titleDraft.trim().length > 0;
  const bodyChanged = bodyDraft.trim() !== (extractedText || "");
  const reminderLabel = formatReminderLabel(capture.reminderNotificationId ? capture.reminderAt : undefined, new Date(now));

  const saveNote = () => { updateCaptureNote(capture.id, note); toast("Note saved"); };
  const discardNote = () => setNote(capture.userNote || "");
  const saveTitle = () => {
    const next = titleDraft.trim();
    if (!next) {
      Alert.alert("Give this capture a title", "A title helps you find it later in search.");
      return;
    }
    updateCaptureTitle(capture.id, next);
    setEditingTitle(false);
    toast("Title renamed");
  };
  const saveBody = () => {
    updateCaptureBody(capture.id, bodyDraft);
    setEditingBody(false);
    toast(bodyDraft.trim() ? "Saved text updated" : "Saved text cleared");
  };
  const copyText = async () => {
    if (!extractedText) return;
    try { await Clipboard.setStringAsync(extractedText); toast("Copied"); }
    catch (error) { console.error("Failed to copy capture text", error); Alert.alert("Couldn’t copy this text", "Please try again."); }
  };
  const copyLink = async () => {
    if (!sourceUrl) return;
    try { await Clipboard.setStringAsync(sourceUrl); toast("Link copied"); }
    catch (error) { console.error("Failed to copy capture link", error); Alert.alert("Couldn’t copy this link", "Please try again."); }
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
      <BackHeader onBack={back} title="Details" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboard}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
        <View style={[styles.sourceRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.sourceAvatar, { backgroundColor: theme.accentSoft }]}>
            {platform && !logoFailed
              ? <Image source={{ uri: platform.iconUri }} style={styles.sourceLogo} accessibilityLabel={`${platform.name} logo`} onError={() => setLogoFailed(true)} />
              : <Text style={[styles.sourceFallback, { color: theme.accentText }]}>{platform?.label || siteName.slice(0, 2).toUpperCase()}</Text>}
          </View>
          <View style={styles.sourceCopy}>
            <Text numberOfLines={1} style={[styles.sourceName, { color: theme.text }]}>{siteName}</Text>
            <Text numberOfLines={1} style={[styles.sourceMeta, { color: theme.textMuted }]}>{timeLabel}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.badgeText, { color: theme.accentText }]}>{capture.category || capture.kind}</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          {editingTitle ? (
            <View style={[styles.editorCard, { backgroundColor: theme.surface, borderColor: theme.accent }]}>
              <TextInput
                accessibilityLabel="Capture title"
                autoFocus
                value={titleDraft}
                onChangeText={setTitleDraft}
                placeholder="Name this capture…"
                placeholderTextColor={theme.textMuted}
                maxLength={300}
                multiline
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={saveTitle}
                style={[styles.titleInput, { color: theme.text }]}
              />
              <View style={styles.editorActions}>
                <Pressable accessibilityRole="button" accessibilityLabel="Cancel renaming" onPress={() => { setTitleDraft(capture.title); setEditingTitle(false); }} style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}>
                  <X size={16} color={theme.textSecondary} /><Text style={[styles.ghostText, { color: theme.textSecondary }]}>Cancel</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Save title" disabled={!titleChanged} onPress={saveTitle} style={({ pressed }) => [styles.savePill, { backgroundColor: theme.accent }, !titleChanged && styles.disabled, pressed && styles.pressed]}>
                  <Check size={16} color={theme.onAccent} /><Text style={[styles.savePillText, { color: theme.onAccent }]}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.text }]}>{capture.title}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Rename capture" onPress={() => setEditingTitle(true)} style={({ pressed }) => [styles.renameButton, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
                <Pencil size={17} color={theme.accentText} />
              </Pressable>
            </View>
          )}
          <Text style={[styles.titleHint, { color: theme.textMuted }]}>{editingTitle ? "Give it a name you’ll recognise in search." : "Tap the pencil to rename this capture."}</Text>
        </View>

        {sourceUrl ? (
          <View style={[styles.linkCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Pressable accessibilityRole="link" accessibilityLabel={`Open ${sourceUrl}`} accessibilityHint="Opens in your browser. Long-press to copy." onPress={() => void openLink()} onLongPress={() => void copyLink()} style={({ pressed }) => [styles.linkPress, pressed && styles.pressed]}>
              <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.linkText, { color: theme.accentText }]}>{sourceUrl}</Text>
              <Text style={[styles.linkHint, { color: theme.textMuted }]}>Tap to open · long-press to copy</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Open link in browser" onPress={() => void openLink()} style={({ pressed }) => [styles.openPill, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
              <ExternalLink size={15} color={theme.onAccent} />
              <Text style={[styles.openPillText, { color: theme.onAccent }]}>Open</Text>
            </Pressable>
          </View>
        ) : null}
        {reminderLabel ? <View style={[styles.reminderBadge, { backgroundColor: theme.accentSoft }]}><Clock3 size={15} color={theme.accentText} /><Text style={[styles.badgeText, { color: theme.accentText }]}>{reminderLabel}</Text></View> : null}

        {capture.kind === "voice" && capture.localFileUri ? <VoicePlayer uri={capture.localFileUri} dark={dark} /> : imageUri && !imageFailed ? <Image source={{ uri: imageUri }} style={[styles.imagePreview, { backgroundColor: theme.surfaceMuted }]} resizeMode="cover" accessibilityLabel={capture.title} onError={() => setImageFailed(true)} /> : null}

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: theme.accentSoft }]}><FileText size={18} color={theme.accentText} /></View>
            <View style={styles.cardHeading}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Saved text</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>{extractedText ? `${wordCount} word${wordCount === 1 ? "" : "s"} · from this capture` : "Nothing saved yet"}</Text>
            </View>
            {extractedText && !editingBody ? (
              <Pressable accessibilityLabel="Copy saved text" accessibilityRole="button" onPress={copyText} style={({ pressed }) => [styles.iconGhost, { borderColor: theme.border }, pressed && styles.pressed]}>
                <Copy size={16} color={theme.accentText} />
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={editingBody ? "Done editing saved text" : extractedText ? "Edit saved text" : "Add saved text"}
              onPress={() => editingBody ? saveBody() : setEditingBody(true)}
              style={({ pressed }) => [styles.iconGhost, { borderColor: theme.border, backgroundColor: editingBody ? theme.accent : "transparent" }, pressed && styles.pressed]}
            >
              {editingBody ? <Check size={16} color={theme.onAccent} /> : <Pencil size={16} color={theme.accentText} />}
            </Pressable>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          {editingBody ? (
            <View style={styles.cardBody}>
              <TextInput
                accessibilityLabel="Edit saved text"
                autoFocus
                multiline
                value={bodyDraft}
                onChangeText={setBodyDraft}
                placeholder="Paste or type the text you want to keep…"
                placeholderTextColor={theme.textMuted}
                maxLength={50_000}
                style={[styles.bodyInput, { color: theme.text }]}
                textAlignVertical="top"
              />
              <Text style={[styles.helper, { color: theme.textMuted }]}>Edits stay on this capture and remain searchable offline.</Text>
              <View style={styles.editorActions}>
                <Pressable accessibilityRole="button" accessibilityLabel="Discard saved text changes" onPress={() => { setBodyDraft(extractedText || ""); setEditingBody(false); }} style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}>
                  <X size={16} color={theme.textSecondary} /><Text style={[styles.ghostText, { color: theme.textSecondary }]}>Discard</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Save edited text" disabled={!bodyChanged} onPress={saveBody} style={({ pressed }) => [styles.savePill, { backgroundColor: theme.accent }, !bodyChanged && styles.disabled, pressed && styles.pressed]}>
                  <Check size={16} color={theme.onAccent} /><Text style={[styles.savePillText, { color: theme.onAccent }]}>Save text</Text>
                </Pressable>
              </View>
            </View>
          ) : extractedText ? (
            <View style={styles.cardBody}>
              <Text selectable style={[styles.body, { color: theme.textSecondary }]}>{extractedText}</Text>
            </View>
          ) : (
            <View style={styles.cardBody}>
              <Text style={[styles.emptyBody, { color: theme.textMuted }]}>No saved text yet. Add the key quote, summary, or content you want to find later.</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Add saved text" onPress={() => setEditingBody(true)} style={({ pressed }) => [styles.addButton, { backgroundColor: theme.accentSoft }, pressed && styles.pressed]}>
                <Pencil size={15} color={theme.accentText} /><Text style={[styles.addButtonText, { color: theme.accentText }]}>Add text</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: theme.accentSoft }]}><StickyNote size={18} color={theme.accentText} /></View>
            <View style={styles.cardHeading}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Your note</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>Private to you · searchable offline</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.cardBody}>
            <TextInput
              accessibilityLabel="Capture note"
              multiline
              value={note}
              onChangeText={setNote}
              onFocus={() => setNoteFocused(true)}
              onBlur={() => setNoteFocused(false)}
              placeholder="Add context, a follow-up, or why this matters…"
              placeholderTextColor={theme.textMuted}
              maxLength={10_000}
              style={[styles.noteInput, { backgroundColor: theme.surfaceMuted, borderColor: noteFocused ? theme.accent : theme.border, color: theme.text }]}
              textAlignVertical="top"
            />
            {noteChanged ? (
              <View style={styles.editorActions}>
                <Pressable accessibilityRole="button" accessibilityLabel="Discard note changes" onPress={discardNote} style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}>
                  <X size={16} color={theme.textSecondary} /><Text style={[styles.ghostText, { color: theme.textSecondary }]}>Discard</Text>
                </Pressable>
                <View style={styles.saveFlex}><PrimaryButton onPress={saveNote}>Save Note</PrimaryButton></View>
              </View>
            ) : (
              <Text style={[styles.helper, { color: theme.textMuted }]}>{capture.userNote ? "Notes sync to search instantly." : "Notes never leave this device."}</Text>
            )}
          </View>
        </View>

        <View style={[styles.actionsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.detailAction, pressed && styles.pressed]}><View style={[styles.actionCircle, { backgroundColor: active ? theme.accentSoft : theme.surfaceMuted, borderColor: danger ? theme.danger : theme.border }]}><Icon size={22} color={color} fill={active ? color : "transparent"} /></View><Text numberOfLines={1} style={[styles.actionLabel, { color }]}>{label}</Text></Pressable>;
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
  sourceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, paddingRight: spacing.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, ...shadow },
  sourceAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  sourceLogo: { width: 28, height: 28, borderRadius: 7 },
  sourceFallback: { fontSize: 15, fontWeight: "800" },
  sourceCopy: { flex: 1, minWidth: 0, gap: 1 },
  sourceName: { ...type.label },
  sourceMeta: { ...type.meta },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full },
  badgeText: { ...type.meta, fontWeight: "700", textTransform: "capitalize" },
  reminderBadge: { alignSelf: "flex-start", minHeight: 30, paddingHorizontal: 10, borderRadius: radius.full, flexDirection: "row", alignItems: "center", gap: 6 },
  titleBlock: { gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  title: { flex: 1, fontSize: 24, lineHeight: 30, fontWeight: "800", letterSpacing: -0.5 },
  renameButton: { width: 44, height: 44, borderRadius: radius.full, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  titleHint: { ...type.meta },
  editorCard: { borderRadius: radius.md, borderWidth: 1.5, padding: spacing.sm, gap: spacing.sm },
  titleInput: { fontSize: 20, lineHeight: 26, fontWeight: "700", minHeight: 52, textAlignVertical: "top" },
  linkCard: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.sm, paddingLeft: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  linkPress: { flex: 1, minWidth: 0, minHeight: 44, justifyContent: "center", gap: 2 },
  linkText: { ...type.body },
  linkHint: { ...type.meta },
  openPill: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.full, flexDirection: "row", alignItems: "center", gap: 6 },
  openPillText: { ...type.label },
  imagePreview: { height: 280, borderRadius: radius.lg, ...shadow },
  voicePlayer: { minHeight: 150, padding: spacing.lg, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: spacing.md, ...shadow },
  playButton: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center" },
  voiceProgress: { flex: 1, gap: spacing.xs },
  voiceLabel: { ...type.cardTitle },
  progressTrack: { height: 5, borderRadius: radius.full, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: radius.full },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
  time: { ...type.meta },
  card: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden", ...shadow },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 64 },
  cardIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardHeading: { flex: 1, minWidth: 0, gap: 1 },
  cardTitle: { ...type.cardTitle },
  cardSubtitle: { ...type.meta },
  iconGhost: { width: 44, height: 44, borderRadius: radius.full, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  divider: { height: StyleSheet.hairlineWidth },
  cardBody: { padding: spacing.md, gap: spacing.sm },
  body: { ...type.body },
  bodyInput: { ...type.body, minHeight: 160, textAlignVertical: "top" },
  emptyBody: { ...type.body },
  addButton: { alignSelf: "flex-start", minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.full, flexDirection: "row", alignItems: "center", gap: 6 },
  addButtonText: { ...type.label },
  noteInput: { minHeight: 110, borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, ...type.body },
  helper: { ...type.meta },
  editorActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  ghostButton: { minHeight: 44, paddingHorizontal: spacing.sm, borderRadius: radius.full, flexDirection: "row", alignItems: "center", gap: 6 },
  ghostText: { ...type.label },
  savePill: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.full, flexDirection: "row", alignItems: "center", gap: 6 },
  savePillText: { ...type.label },
  saveFlex: { flex: 1 },
  actionsCard: { flexDirection: "row", justifyContent: "space-between", gap: spacing.xs, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, ...shadow },
  detailAction: { flex: 1, minWidth: 0, alignItems: "center", gap: spacing.xs, paddingVertical: 4 },
  actionCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11.5, lineHeight: 16, fontWeight: "600" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.42 },
});
