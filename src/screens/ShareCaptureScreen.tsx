import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useIncomingShare } from "expo-sharing";
import { Image } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton, SectionLabel } from "../components/ui";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "ShareCapture">;

export function ShareCaptureScreen({ navigation }: Props) {
  const [note, setNote] = useState("");
  const { clearSharedPayloads, sharedPayloads } = useIncomingShare();
  const { addCapture } = useAppStore();
  const toast = useToast();
  const shared = sharedPayloads[0];
  const sharedValue = shared?.value?.trim() || "";

  useEffect(() => {
    if (sharedValue) setNote(sharedValue);
  }, [sharedValue]);

  const close = () => {
    clearSharedPayloads();
    navigation.goBack();
  };

  const save = () => {
    const isLink = shared?.shareType === "url";
    addCapture(note || sharedValue || "Captured from Safari", isLink ? "link" : "note", isLink ? sharedValue : undefined);
    clearSharedPayloads();
    toast("Saved");
    navigation.replace("Main");
  };

  return (
    <View style={styles.screen}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Pressable onPress={close}><Text style={styles.cancel}>Cancel</Text></Pressable>
          <Text style={styles.title}>Tuck</Text><View style={{ width: 44 }} />
        </View>
        <View style={styles.preview}>
          <View style={styles.thumb}><Image color={colors.accent} /></View>
          <View><SectionLabel>{shared ? shared.shareType === "url" ? "Shared link" : "Shared text" : "Screenshot"}</SectionLabel><Text style={styles.previewTitle}>{shared ? "From another app" : "Captured from Safari"}</Text></View>
        </View>
        <TextInput multiline value={note} onChangeText={setNote} placeholder="Add a thought…" placeholderTextColor={colors.faint} style={styles.input} />
        <PrimaryButton onPress={save}>Save to Inbox</PrimaryButton>
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
  previewTitle: { color: colors.text, fontSize: 14.5 },
  input: { minHeight: 64, padding: 12, borderRadius: 12, backgroundColor: "#F5F4F1", color: colors.text, textAlignVertical: "top" },
});
