import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useIncomingShare } from "expo-sharing";
import { FileText, Image as ImageIcon, Mic } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton, SectionLabel, SheetShell } from "../components/ui";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";
import { persistSharedFile } from "../utils/files";
import { mapSharedPayload, type SharedCaptureInput } from "../utils/sharePayload";

type Props = NativeStackScreenProps<RootStackParamList, "ShareCapture">;

export function ShareCaptureScreen({ navigation }: Props) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const { clearSharedPayloads, error, isResolving, resolvedSharedPayloads, sharedPayloads } = useIncomingShare();
  const { addCapture, dark } = useAppStore();
  const theme = getTheme(dark);
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
    <View style={[styles.screen, { backgroundColor: theme.scrim }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboard}>
        <SheetShell style={styles.sheet}>
          <ScrollView style={styles.formScroll} contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Pressable accessibilityRole="button" onPress={close} style={styles.headerAction}><Text style={[styles.cancel, { color: theme.textSecondary }]}>Cancel</Text></Pressable>
              <Text style={[styles.title, { color: theme.text }]}>Save to Tuck</Text><View style={styles.headerAction} />
            </View>
            <View style={[styles.preview, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <View style={[styles.thumb, { backgroundColor: theme.accentSoft }]}>{previewUri ? <Image source={{ uri: previewUri }} style={styles.previewImage} /> : <Icon color={theme.accentText} />}</View>
              <View style={styles.previewCopy}><SectionLabel>{shared ? `Shared ${shared.shareType}` : "Screenshot"}</SectionLabel><Text numberOfLines={2} style={[styles.previewTitle, { color: theme.text }]}>{mapped?.title || "Captured from Safari"}</Text></View>
            </View>
            {(mappingError || attachment && error) && <Text style={[styles.error, { color: theme.danger }]}>{mappingError || "This item couldn’t be read. Try sharing it again."}</Text>}
            <TextInput multiline value={note} onChangeText={setNote} placeholder="Add a thought…" placeholderTextColor={theme.textMuted} style={[styles.input, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, color: theme.text }]} />
          </ScrollView>
          <PrimaryButton disabled={saving || unavailable || Boolean(mappingError || attachment && error)} onPress={save}>{saving ? "Saving…" : attachment && isResolving ? "Preparing…" : "Save to Inbox"}</PrimaryButton>
        </SheetShell>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "flex-end" },
  keyboard: { flex: 1, justifyContent: "flex-end" },
  sheet: { maxHeight: "92%" },
  formScroll: { flexShrink: 1 },
  form: { gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerAction: { width: 72, minHeight: 44, justifyContent: "center" },
  cancel: { ...type.body },
  title: { ...type.section },
  preview: { padding: spacing.sm, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  previewImage: { width: 56, height: 56 },
  previewCopy: { flex: 1 },
  previewTitle: { ...type.body, fontWeight: "600" },
  error: { ...type.meta },
  input: { minHeight: 84, padding: spacing.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, ...type.body, textAlignVertical: "top" },
});
