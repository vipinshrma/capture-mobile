import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, Link2, Mic, Pause, Play, StickyNote } from "lucide-react-native";
import { useRef, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, spacing, type } from "../theme";
import type { CaptureKind } from "../types";
import { normalizeWebUrl } from "../utils/capture";
import { persistSharedFile } from "../utils/files";
import { PrimaryButton, SheetShell } from "./ui";

type Mode = "note" | "voice" | "photo" | "link";
type QuickCaptureInput = {
  title?: string;
  kind?: CaptureKind;
  source?: string;
  localFileUri?: string;
  mimeType?: string;
};
type PendingPhoto = { uri: string; fileName: string; fileSize?: number; mimeType: string };

const modes = [
  { id: "note", label: "Write a note", icon: StickyNote },
  { id: "voice", label: "Record voice", icon: Mic },
  { id: "photo", label: "Choose photo", icon: ImagePlus },
  { id: "link", label: "Paste link", icon: Link2 },
] satisfies { id: Mode; label: string; icon: typeof StickyNote }[];

export function QuickCaptureSheet({ visible, onClose, onSave }: {
  visible: boolean;
  onClose: () => void;
  onSave: (input: QuickCaptureInput) => void;
}) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  const [mode, setMode] = useState<Mode>("note");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<PendingPhoto>();
  const [recordingUri, setRecordingUri] = useState<string>();
  const formScroll = useRef<ScrollView>(null);
  const inputFocused = useRef(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const previewPlayer = useAudioPlayer(recordingUri || null, { updateInterval: 250 });
  const previewStatus = useAudioPlayerStatus(previewPlayer);
  const isRecording = recorderState.isRecording || recorder.isRecording;
  const isTextMode = mode === "note" || mode === "link";
  const revealInput = () => formScroll.current?.scrollToEnd({ animated: true });

  const reset = () => {
    setMode("note");
    setValue("");
    setPhoto(undefined);
    setRecordingUri(undefined);
    setBusy(false);
  };

  const close = async () => {
    if (isRecording) {
      await recorder.stop().catch(() => undefined);
      await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    }
    previewPlayer.pause();
    reset();
    onClose();
  };

  const complete = (input: QuickCaptureInput) => {
    onSave(input);
    reset();
  };

  const choosePhoto = async () => {
    setMode("photo");
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 1,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, fileName: asset.fileName || "Photo", fileSize: asset.fileSize, mimeType: asset.mimeType || "image/jpeg" });
    } catch (error) {
      Alert.alert("Couldn’t save photo", error instanceof Error ? error.message : "The selected photo was not added. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const startRecording = async () => {
    setBusy(true);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Microphone access needed", "Allow microphone access in Settings to record a voice note.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.error("Failed to start voice recording", error);
      Alert.alert(
        "Couldn’t start recording",
        error instanceof Error ? error.message : "Check microphone access and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const stopRecording = async () => {
    setBusy(true);
    try {
      await recorder.stop();
      if (!recorder.uri) throw new Error("Recording has no file");
      setRecordingUri(recorder.uri);
    } catch (error) {
      Alert.alert("Couldn’t save recording", error instanceof Error ? error.message : "Your recording was not added. Please try again.");
    } finally {
      await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
      setBusy(false);
    }
  };

  const savePhoto = () => {
    if (!photo) { void choosePhoto(); return; }
    try {
      complete({ title: photo.fileName, kind: "image", localFileUri: persistSharedFile(photo.uri, photo.fileName, photo.fileSize), mimeType: photo.mimeType });
    } catch (error) {
      Alert.alert("Couldn’t save photo", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const saveRecording = () => {
    if (!recordingUri) { void startRecording(); return; }
    try {
      previewPlayer.pause();
      complete({ title: "Voice note", kind: "voice", localFileUri: persistSharedFile(recordingUri, `voice-${Date.now()}.m4a`), mimeType: "audio/mp4" });
    } catch (error) {
      Alert.alert("Couldn’t save recording", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const togglePreview = async () => {
    if (previewStatus.playing) { previewPlayer.pause(); return; }
    if (previewStatus.duration && previewStatus.currentTime >= previewStatus.duration - 0.1) await previewPlayer.seekTo(0);
    previewPlayer.play();
  };

  const saveText = () => {
    const text = value.trim();
    if (mode === "link") {
      try {
        const url = normalizeWebUrl(text);
        complete({ title: url, kind: "link", source: url });
      } catch {
        Alert.alert("Enter a valid link", "Use a web address such as example.com/article.");
      }
      return;
    }
    complete({ title: text, kind: "note" });
  };

  const selectMode = (nextMode: Mode) => {
    if (busy || isRecording) return;
    previewPlayer.pause();
    setMode(nextMode);
    setValue("");
    setPhoto(undefined);
    setRecordingUri(undefined);
  };

  const duration = Math.floor(recorderState.durationMillis / 1000);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => void close()}>
      <Pressable style={[styles.scrim, { backgroundColor: theme.scrim }]} onPress={() => void close()}>
        <KeyboardAvoidingView behavior="padding" style={styles.keyboard}>
        <Pressable onPress={(event) => event.stopPropagation()}>
          <SheetShell style={styles.captureSheet}>
          <ScrollView ref={formScroll} onLayout={() => inputFocused.current && revealInput()} style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          <View>
            <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>Save something</Text>
            <Text style={[styles.title, { color: theme.text }]}>Quick Capture</Text>
          </View>
          <View style={styles.types}>
            {modes.map((item) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: mode === item.id }}
                disabled={busy || isRecording}
                key={item.id}
                onPress={() => selectMode(item.id)}
                style={({ pressed }) => [styles.typeCard, { backgroundColor: theme.surfaceRaised, borderColor: mode === item.id ? theme.accent : theme.border }, pressed && styles.pressed]}
              >
                <View style={[styles.typeIcon, { backgroundColor: mode === item.id ? theme.accentSoft : theme.surfaceMuted }]}><item.icon size={26} color={mode === item.id ? theme.accentText : theme.textSecondary} /></View>
                <Text style={[styles.typeLabel, { color: theme.text }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {isTextMode ? (
            <TextInput
              autoCapitalize={mode === "link" ? "none" : "sentences"}
              autoCorrect={mode !== "link"}
              autoFocus={false}
              keyboardType={mode === "link" ? "url" : "default"}
              multiline={mode === "note"}
              onBlur={() => { inputFocused.current = false; }}
              onFocus={() => { inputFocused.current = true; revealInput(); }}
              value={value}
              onChangeText={setValue}
              placeholder={mode === "link" ? "https://example.com" : "What do you want to remember?"}
              placeholderTextColor={theme.textMuted}
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.text }, mode === "link" && styles.linkInput]}
            />
          ) : mode === "voice" ? recordingUri ? (
            <Pressable accessibilityLabel={previewStatus.playing ? "Pause audio preview" : "Play audio preview"} accessibilityRole="button" onPress={() => void togglePreview()} style={[styles.mediaPreview, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <View style={[styles.previewControl, { backgroundColor: theme.accent }]}>{previewStatus.playing ? <Pause size={22} color={theme.onAccent} fill={theme.onAccent} /> : <Play size={22} color={theme.onAccent} fill={theme.onAccent} />}</View>
              <View style={styles.previewCopy}><Text style={[styles.photoTitle, { color: theme.text }]}>Audio preview</Text><Text style={[styles.photoText, { color: theme.textSecondary }]}>Tap to {previewStatus.playing ? "pause" : "listen"} before saving.</Text></View>
            </Pressable>
          ) : (
            <View style={[styles.recording, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <View style={[styles.recordingDot, { backgroundColor: isRecording ? "#E5484D" : theme.textMuted }]} />
              <Text style={[styles.recordingText, { color: theme.textSecondary }]}>
                {isRecording ? `Recording ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}` : "Ready to record"}
              </Text>
            </View>
          ) : photo ? (
            <Pressable accessibilityLabel="Choose a different photo" accessibilityRole="button" disabled={busy} onPress={() => void choosePhoto()} style={[styles.imagePreview, { borderColor: theme.border }]}>
              <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="cover" accessibilityLabel={photo.fileName} />
              <View style={[styles.changePhoto, { backgroundColor: theme.surfaceRaised }]}><Text style={[styles.changePhotoText, { color: theme.accentText }]}>Change</Text></View>
            </Pressable>
          ) : (
            <Pressable
              accessibilityLabel="Choose a photo from your library"
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void choosePhoto()}
              style={({ pressed }) => [styles.photoPicker, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, pressed && styles.pressed]}
            >
              <View style={[styles.photoIcon, { backgroundColor: theme.accentSoft }]}><ImagePlus size={28} color={theme.accentText} /></View>
              <View style={styles.photoCopy}>
                <Text style={[styles.photoTitle, { color: theme.accentText }]}>{busy ? "Opening Photos…" : "Select from Photos"}</Text>
                <Text style={[styles.photoText, { color: theme.textSecondary }]}>Choose one image to save securely in Tuck.</Text>
              </View>
            </Pressable>
          )}
          </ScrollView>

          <View style={styles.buttons}>
            <View style={styles.flex}><PrimaryButton secondary disabled={busy} onPress={() => void close()}>Cancel</PrimaryButton></View>
            <View style={styles.flex}>
              {mode === "photo" ? (
                <PrimaryButton disabled={busy} onPress={savePhoto}>{busy ? "Opening Photos…" : photo ? "Save Image" : "Choose Image"}</PrimaryButton>
              ) : mode === "voice" ? (
                <PrimaryButton disabled={busy} onPress={() => void (isRecording ? stopRecording() : saveRecording())}>
                  {isRecording ? "Stop & Preview" : recordingUri ? "Save Audio" : "Start Recording"}
                </PrimaryButton>
              ) : (
                <PrimaryButton disabled={busy || !value.trim()} onPress={saveText}>Save</PrimaryButton>
              )}
            </View>
          </View>
          </SheetShell>
        </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: "flex-end" },
  keyboard: { flex: 1, justifyContent: "flex-end" },
  captureSheet: { maxHeight: "92%" },
  formScroll: { flexShrink: 1 },
  formContent: { gap: spacing.md },
  eyebrow: { ...type.meta, marginBottom: 2 },
  title: { ...type.title },
  types: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  typeCard: { width: "48%", flexGrow: 1, minHeight: 124, padding: spacing.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  typeIcon: { width: 54, height: 54, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  typeLabel: { ...type.label, textAlign: "center" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  input: { minHeight: 108, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, ...type.body, textAlignVertical: "top" },
  linkInput: { minHeight: 52, textAlignVertical: "center" },
  recording: { minHeight: 108, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  recordingDot: { width: 12, height: 12, borderRadius: 6 },
  recordingText: { ...type.body, fontWeight: "600" },
  photoPicker: { minHeight: 108, padding: spacing.md, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  photoIcon: { width: 52, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  photoCopy: { flex: 1, gap: 4 },
  photoTitle: { ...type.cardTitle },
  photoText: { ...type.meta },
  imagePreview: { height: 190, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  previewImage: { width: "100%", height: "100%" },
  changePhoto: { position: "absolute", right: spacing.sm, bottom: spacing.sm, minHeight: 36, paddingHorizontal: spacing.sm, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  changePhotoText: { ...type.label },
  mediaPreview: { minHeight: 108, padding: spacing.md, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  previewControl: { width: 48, height: 48, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  previewCopy: { flex: 1, gap: 4 },
  buttons: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
});
