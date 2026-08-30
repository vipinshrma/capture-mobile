import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Clipboard from "expo-clipboard";
import { shareAsync } from "expo-sharing";
import { useEffect, useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { Archive, ArrowLeft, Copy, Heart, Pause, Play, Share2, Trash2 } from "lucide-react-native";
import { useAppStore } from "../store/AppStore";
import { useToast } from "../components/ToastProvider";
import { colors, shadow } from "../theme";
import type { RootStackParamList } from "../types";
import { getImageUri, getPlatform, getSourceUrl } from "../utils/capture";

type Props = NativeStackScreenProps<RootStackParamList, "CaptureDetail">;

export function CaptureDetailScreen({ navigation, route }: Props) {
  const { captures, dark, toggleFavourite, archiveCapture, deleteCapture, updateCaptureNote } = useAppStore();
  const toast = useToast();
  const id = route.params?.id || captures[0]?.id;
  const capture = captures.find((item) => item.id === id);
  const back = () => route.params?.returnTo === "Review" ? navigation.navigate("Main", { screen: "Review" }) : navigation.goBack();
  const [logoFailed, setLogoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [note, setNote] = useState(capture?.userNote || "");

  useEffect(() => setNote(capture?.userNote || ""), [capture?.id, capture?.userNote]);

  if (!capture) {
    return <View style={styles.center}><Text>This capture no longer exists.</Text></View>;
  }
  const card = dark ? colors.darkCard : colors.card;
  const text = dark ? colors.darkText : colors.text;
  const imageUri = getImageUri(capture);
  const platform = getPlatform(capture.source, capture.title);
  const sourceUrl = getSourceUrl(capture.source, capture.title);
  const extractedText = capture.body || capture.metadataDescription;
  const saveNote = () => {
    updateCaptureNote(capture.id, note);
    toast("Note saved");
  };
  const copyText = async () => {
    if (!extractedText) return;
    try {
      await Clipboard.setStringAsync(extractedText);
      toast("Copied");
    } catch (error) {
      console.error("Failed to copy capture text", error);
      Alert.alert("Couldn’t copy this text", "Please try again.");
    }
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
    } catch (error) {
      console.error("Failed to share capture", error);
      Alert.alert("Couldn’t share this capture", "Please try again.");
    }
  };
  const remove = () => Alert.alert("Delete this capture?", "This can’t be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => {
      if (await deleteCapture(capture.id)) {
        toast("Deleted");
        navigation.navigate("Main");
      } else Alert.alert("Couldn’t delete this capture", "Please try again.");
    } },
  ]);

  return (
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <View style={styles.actions}>
        <Pressable onPress={back} style={[styles.circle, { backgroundColor: card }]}><ArrowLeft size={18} color={colors.accent} /></Pressable>
        <View style={styles.actionGroup}>
          <Pressable accessibilityLabel={capture.favourite ? "Remove from favourites" : "Add to favourites"} onPress={() => { toggleFavourite(capture.id); toast(capture.favourite ? "Removed from Favourites" : "Added to Favourites"); }} style={[styles.circle, { backgroundColor: card }]}><Heart size={18} color={capture.favourite ? colors.warning : colors.accent} fill={capture.favourite ? colors.warning : "transparent"} /></Pressable>
          <Pressable accessibilityLabel="Share capture" onPress={share} style={[styles.circle, { backgroundColor: card }]}><Share2 size={18} color={colors.accent} /></Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {capture.kind === "voice" && capture.localFileUri ? (
          <VoicePlayer uri={capture.localFileUri} dark={dark} />
        ) : imageUri && !imageFailed ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" accessibilityLabel={capture.title} onError={() => setImageFailed(true)} />
        ) : (
          <View style={styles.preview}><View style={styles.browserBar} /><View style={styles.line} /><View style={[styles.line, { width: "58%" }]} /><View style={[styles.line, { width: "75%" }]} /></View>
        )}
        <View style={styles.metaRow}>
          {platform && !logoFailed && <Image source={{ uri: platform.iconUri }} style={styles.platformLogo} accessibilityLabel={`${platform.name} logo`} onError={() => setLogoFailed(true)} />}
          {platform && logoFailed && <Text style={styles.platformText}>{platform.label}</Text>}
          <Text style={styles.badge}>{capture.category || capture.kind}</Text>
          <Pressable disabled={!sourceUrl} onPress={() => sourceUrl && Linking.openURL(sourceUrl)}>
          <Text style={[styles.meta, sourceUrl && styles.link]}>{capture.metadataSiteName || platform?.name || capture.source} · {capture.createdAt}</Text>
          </Pressable>
        </View>
        <Text style={[styles.title, { color: text }]}>{capture.title}</Text>
        <View style={[styles.extracted, { backgroundColor: card }]}>
          <Text style={[styles.extractedTitle, { color: text }]}>Saved text</Text>
          <Text style={styles.body}>{extractedText || "No saved text is available for this capture."}</Text>
          {extractedText && <Pressable accessibilityLabel="Copy saved text" onPress={copyText} style={styles.copy}><Copy size={15} color={colors.accent} /><Text style={styles.accentText}>Copy saved text</Text></Pressable>}
        </View>
        <TextInput multiline value={note} onChangeText={setNote} placeholder="Add a note…" placeholderTextColor={colors.faint} style={[styles.input, { backgroundColor: card, color: text }]} />
        <Pressable accessibilityRole="button" disabled={note.trim() === (capture.userNote || "")} onPress={saveNote} style={[styles.saveNote, note.trim() === (capture.userNote || "") && styles.disabled]}><Text style={styles.saveNoteText}>Save Note</Text></Pressable>
        <View style={styles.chips}>
          <Pressable onPress={() => { archiveCapture(capture.id); toast("Archived"); navigation.navigate("Main"); }} style={styles.chip}><Archive size={14} color={colors.secondary} /><Text style={styles.chipText}>Archive</Text></Pressable>
          <Pressable onPress={remove} style={styles.chip}><Trash2 size={14} color={colors.danger} /><Text style={styles.danger}>Delete</Text></Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function VoicePlayer({ uri, dark }: { uri: string; dark: boolean }) {
  const player = useAudioPlayer(uri, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const duration = status.duration || 0;
  const progress = duration ? Math.min(status.currentTime / duration, 1) : 0;

  const toggle = async () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (duration && status.currentTime >= duration - 0.1) await player.seekTo(0);
    player.play();
  };

  return (
    <View style={[styles.voicePlayer, dark && { backgroundColor: colors.darkCard }]}>
      <Pressable
        accessibilityLabel={status.playing ? "Pause voice note" : "Play voice note"}
        accessibilityRole="button"
        disabled={!status.isLoaded}
        onPress={() => void toggle()}
        style={[styles.playButton, !status.isLoaded && styles.disabled]}
      >
        {status.playing ? <Pause size={25} color="white" fill="white" /> : <Play size={25} color="white" fill="white" />}
      </Pressable>
      <View style={styles.voiceProgress}>
        <Text style={[styles.voiceLabel, dark && { color: colors.darkText }]}>{status.isLoaded ? "Voice note" : "Loading recording…"}</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(status.currentTime)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
}

function formatTime(seconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  darkScreen: { backgroundColor: colors.darkBackground },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  actions: { padding: 12, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between" },
  actionGroup: { flexDirection: "row", gap: 8 },
  circle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", ...shadow },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  preview: { height: 200, borderRadius: 20, backgroundColor: "#DDD9F0", justifyContent: "center", padding: 28, gap: 12, ...shadow },
  imagePreview: { height: 260, borderRadius: 20, backgroundColor: colors.surface, ...shadow },
  voicePlayer: { minHeight: 132, padding: 20, borderRadius: 20, backgroundColor: colors.card, flexDirection: "row", alignItems: "center", gap: 16, ...shadow },
  playButton: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  voiceProgress: { flex: 1, gap: 8 },
  voiceLabel: { color: colors.text, fontSize: 16, fontWeight: "700" },
  progressTrack: { height: 5, borderRadius: 3, overflow: "hidden", backgroundColor: colors.accentSoft },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: colors.accent },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
  time: { color: colors.muted, fontSize: 12 },
  browserBar: { height: 22, borderRadius: 7, backgroundColor: "rgba(255,255,255,.75)" },
  line: { width: "86%", height: 7, borderRadius: 4, backgroundColor: "rgba(66,63,145,.32)" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  platformLogo: { width: 22, height: 22, borderRadius: 5 },
  platformText: { minWidth: 22, color: colors.accent, fontSize: 12, fontWeight: "800", textAlign: "center" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, color: colors.accent, backgroundColor: colors.accentSoft, fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  meta: { color: colors.muted, fontSize: 12.5 },
  link: { color: colors.accent },
  title: { fontSize: 21, lineHeight: 28, fontWeight: "700" },
  extracted: { padding: 16, borderRadius: 16, gap: 7, ...shadow },
  extractedTitle: { fontSize: 15.5, fontWeight: "600" },
  body: { color: colors.secondary, fontSize: 14, lineHeight: 21 },
  copy: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 5 },
  accentText: { color: colors.accent, fontSize: 14, fontWeight: "600" },
  input: { minHeight: 64, borderRadius: 14, padding: 13, textAlignVertical: "top" },
  saveNote: { alignSelf: "flex-end", paddingHorizontal: 16, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  saveNoteText: { color: "white", fontWeight: "600" },
  disabled: { opacity: 0.4 },
  chips: { flexDirection: "row", gap: 8 },
  chip: { height: 36, paddingHorizontal: 13, borderRadius: 18, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 5 },
  chipText: { color: colors.secondary },
  danger: { color: colors.danger },
});
