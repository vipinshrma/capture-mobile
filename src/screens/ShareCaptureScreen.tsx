import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useIncomingShare } from "expo-sharing";
import { FileText, Image as ImageIcon, Mic } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton, SectionLabel } from "../components/ui";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";
import { persistSharedFile } from "../utils/files";
import { mapSharedPayload, type SharedCaptureInput } from "../utils/sharePayload";

type Props = NativeStackScreenProps<RootStackParamList, "ShareCapture">;

export function ShareCaptureScreen({ navigation }: Props) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const { clearSharedPayloads, error, isResolving, resolvedSharedPayloads, sharedPayloads } = useIncomingShare();
  const { addCapture } = useAppStore();
  const toast = useToast();
  const shared = sharedPayloads[0];
  const resolved = resolvedSharedPayloads[0];
  const payload = resolved || shared;
  let mapped: SharedCaptureInput | undefined;
  let mappingError: string | undefined;
  try {
    mapped = payload ? mapSharedPayload(payload) : undefined;
  } catch (payloadError) {
    mappingError = payloadError instanceof Error ? payloadError.message : "This item can’t be saved.";
  }
  const attachment = shared && !["text", "url"].includes(shared.shareType);

  useEffect(() => {
    setNote("");
  }, [shared?.value]);

  const close = () => {
    clearSharedPayloads();
    navigation.goBack();
  };

  const save = async () => {
    if (attachment && !resolved) return;
    setSaving(true);
    try {
      const capture = mapped || { kind: "note" as const, title: "Captured from Safari" };
      const localFileUri = capture.localFileUri
        ? persistSharedFile(capture.localFileUri, resolved?.originalName, resolved?.contentSize)
        : undefined;
      addCapture({ ...capture, localFileUri, userNote: note });
      clearSharedPayloads();
      toast("Saved");
      navigation.replace("Main");
    } catch (saveError) {
      console.error("Failed to save shared capture", saveError);
      Alert.alert("Couldn’t save this capture", saveError instanceof Error ? saveError.message : "The shared item is still available. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const Icon = shared?.shareType === "audio" ? Mic : shared?.shareType === "file" ? FileText : ImageIcon;
  const previewUri = shared?.shareType === "image" ? resolved?.contentUri : undefined;
  const unavailable = Boolean(attachment && (isResolving || !resolved));

  return (
    <View style={styles.screen}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Pressable onPress={close}><Text style={styles.cancel}>Cancel</Text></Pressable>
          <Text style={styles.title}>Tuck</Text><View style={{ width: 44 }} />
        </View>
        <View style={styles.preview}>
          <View style={styles.thumb}>{previewUri ? <Image source={{ uri: previewUri }} style={styles.previewImage} /> : <Icon color={colors.accent} />}</View>
          <View style={styles.previewCopy}><SectionLabel>{shared ? `Shared ${shared.shareType}` : "Screenshot"}</SectionLabel><Text numberOfLines={2} style={styles.previewTitle}>{mapped?.title || "Captured from Safari"}</Text></View>
        </View>
        {(mappingError || attachment && error) && <Text style={styles.error}>{mappingError || "This item couldn’t be read. Try sharing it again."}</Text>}
        <TextInput multiline value={note} onChangeText={setNote} placeholder="Add a thought…" placeholderTextColor={colors.faint} style={styles.input} />
        <PrimaryButton disabled={saving || unavailable || Boolean(mappingError || attachment && error)} onPress={save}>{saving ? "Saving…" : attachment && isResolving ? "Preparing…" : "Save to Inbox"}</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "rgba(0,0,0,.35)", justifyContent: "flex-end" },
  sheet: { padding: 18, paddingBottom: 34, gap: 14, backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: "#D1D1D6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cancel: { color: colors.muted, fontSize: 16 },
  title: { color: colors.text, fontSize: 16, fontWeight: "600" },
  preview: { padding: 12, borderRadius: 16, backgroundColor: "#F5F4F1", flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { width: 46, height: 46, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  previewImage: { width: 46, height: 46, borderRadius: 10 },
  previewCopy: { flex: 1 },
  previewTitle: { color: colors.text, fontSize: 14.5 },
  error: { color: colors.danger, fontSize: 13 },
  input: { minHeight: 64, padding: 12, borderRadius: 12, backgroundColor: "#F5F4F1", color: colors.text, textAlignVertical: "top" },
});
