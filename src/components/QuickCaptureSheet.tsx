import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus } from "lucide-react-native";
import { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";
import type { CaptureKind } from "../types";
import { normalizeWebUrl } from "../utils/capture";
import { persistSharedFile } from "../utils/files";
import { PrimaryButton } from "./ui";

type Mode = "note" | "voice" | "photo" | "link";
type QuickCaptureInput = {
  title?: string;
  kind?: CaptureKind;
  source?: string;
  localFileUri?: string;
  mimeType?: string;
};

const modes: { id: Mode; label: string }[] = [
  { id: "note", label: "Write a note" },
  { id: "voice", label: "Record voice" },
  { id: "photo", label: "Choose photo" },
  { id: "link", label: "Paste link" },
];

export function QuickCaptureSheet({ visible, onClose, onSave }: {
  visible: boolean;
  onClose: () => void;
  onSave: (input: QuickCaptureInput) => void;
}) {
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
      <Pressable style={styles.scrim} onPress={() => void close()}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.types}>
            {modes.map((item) => (
              <Pressable
                accessibilityRole="button"
                disabled={busy || isRecording}
                key={item.id}
                onPress={() => selectMode(item.id)}
              >
                <Text style={[styles.type, mode === item.id && styles.typeActive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {isTextMode ? (
            <TextInput
              autoCapitalize={mode === "link" ? "none" : "sentences"}
              autoCorrect={mode !== "link"}
              autoFocus
              keyboardType={mode === "link" ? "url" : "default"}
              multiline={mode === "note"}
              value={value}
              onChangeText={setValue}
              placeholder={mode === "link" ? "https://example.com" : "What do you want to remember?"}
              placeholderTextColor={colors.faint}
              style={[styles.input, mode === "link" && styles.linkInput]}
            />
          ) : mode === "voice" ? (
            <View style={styles.recording}>
              <View style={[styles.recordingDot, isRecording && styles.recordingDotActive]} />
              <Text style={styles.recordingText}>
                {isRecording ? `Recording ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}` : "Ready to record"}
              </Text>
            </View>
          ) : (
            <Pressable
              accessibilityLabel="Choose a photo from your library"
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void choosePhoto()}
              style={({ pressed }) => [styles.photoPicker, pressed && styles.photoPickerPressed]}
            >
              <View style={styles.photoIcon}><ImagePlus size={28} color={colors.accent} /></View>
              <View style={styles.photoCopy}>
                <Text style={styles.photoTitle}>{busy ? "Opening Photos…" : "Select from Photos"}</Text>
                <Text style={styles.photoText}>Choose one image to save securely in Tuck.</Text>
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,.35)" },
  sheet: { padding: 18, paddingBottom: 34, gap: 14, backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: "#D1D1D6" },
  types: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  type: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 15, overflow: "hidden", backgroundColor: colors.surface, color: colors.secondary, fontSize: 13 },
  typeActive: { backgroundColor: colors.accentSoft, color: colors.accent, fontWeight: "600" },
  input: { minHeight: 96, borderRadius: 14, padding: 13, backgroundColor: "#F5F4F1", color: colors.text, fontSize: 15, textAlignVertical: "top" },
  linkInput: { minHeight: 52, textAlignVertical: "center" },
  recording: { minHeight: 96, borderRadius: 14, backgroundColor: "#F5F4F1", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.faint },
  recordingDotActive: { backgroundColor: "#E5484D" },
  recordingText: { color: colors.secondary, fontSize: 16, fontWeight: "600" },
  photoPicker: { minHeight: 108, padding: 16, borderWidth: 1, borderColor: "#DAD7EF", borderRadius: 18, backgroundColor: "#F7F6FC", flexDirection: "row", alignItems: "center", gap: 14 },
  photoPickerPressed: { opacity: 0.72 },
  photoIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  photoCopy: { flex: 1, gap: 4 },
  photoTitle: { color: colors.accent, fontSize: 16, fontWeight: "700" },
  photoText: { color: colors.muted, fontSize: 13.5, lineHeight: 19 },
  buttons: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
});
