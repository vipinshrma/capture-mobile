import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, Link2, Mic, StickyNote } from "lucide-react-native";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const isRecording = recorderState.isRecording || recorder.isRecording;

  const reset = () => {
    setMode("note");
    setValue("");
    setBusy(false);
  };

  const close = async () => {
    if (isRecording) {
      await recorder.stop().catch(() => undefined);
      await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    }
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
      const localFileUri = persistSharedFile(asset.uri, asset.fileName || "photo.jpg", asset.fileSize);
      complete({
        title: asset.fileName || "Photo",
        kind: "image",
        localFileUri,
        mimeType: asset.mimeType || "image/jpeg",
      });
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
      const localFileUri = persistSharedFile(recorder.uri, `voice-${Date.now()}.m4a`);
      complete({ title: "Voice note", kind: "voice", localFileUri, mimeType: "audio/mp4" });
    } catch (error) {
      Alert.alert("Couldn’t save recording", error instanceof Error ? error.message : "Your recording was not added. Please try again.");
    } finally {
      await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
      setBusy(false);
    }
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
    setMode(nextMode);
    setValue("");
  };

  const isTextMode = mode === "note" || mode === "link";
  const duration = Math.floor(recorderState.durationMillis / 1000);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => void close()}>
      <Pressable style={[styles.scrim, { backgroundColor: theme.scrim }]} onPress={() => void close()}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboard}>
        <Pressable onPress={(event) => event.stopPropagation()}>
          <SheetShell>
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
              value={value}
              onChangeText={setValue}
              placeholder={mode === "link" ? "https://example.com" : "What do you want to remember?"}
              placeholderTextColor={theme.textMuted}
              style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.text }, mode === "link" && styles.linkInput]}
            />
          ) : mode === "voice" ? (
            <View style={[styles.recording, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <View style={[styles.recordingDot, { backgroundColor: isRecording ? "#E5484D" : theme.textMuted }]} />
              <Text style={[styles.recordingText, { color: theme.textSecondary }]}>
                {isRecording ? `Recording ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}` : "Ready to record"}
              </Text>
            </View>
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

          <View style={styles.buttons}>
            <View style={styles.flex}><PrimaryButton secondary disabled={busy} onPress={() => void close()}>Cancel</PrimaryButton></View>
            {mode !== "photo" && <View style={styles.flex}>
              {mode === "voice" ? (
                <PrimaryButton disabled={busy} onPress={() => void (isRecording ? stopRecording() : startRecording())}>
                  {isRecording ? "Stop & Save" : "Start Recording"}
                </PrimaryButton>
              ) : (
                <PrimaryButton disabled={busy || !value.trim()} onPress={saveText}>Save</PrimaryButton>
              )}
            </View>}
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
  buttons: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
});
