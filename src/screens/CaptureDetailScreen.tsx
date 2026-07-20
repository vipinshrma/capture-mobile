import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Archive, ArrowLeft, Copy, Heart, MoreHorizontal, Share2, Trash2 } from "lucide-react-native";
import { useAppStore } from "../store/AppStore";
import { useToast } from "../components/ToastProvider";
import { colors, shadow } from "../theme";
import type { RootStackParamList } from "../types";
import { getImageUri, getPlatform, getSourceUrl } from "../utils/capture";

type Props = NativeStackScreenProps<RootStackParamList, "CaptureDetail">;

export function CaptureDetailScreen({ navigation, route }: Props) {
  const { captures, dark, toggleFavourite, archiveCapture, deleteCapture } = useAppStore();
  const toast = useToast();
  const id = route.params?.id || captures[0]?.id;
  const capture = captures.find((item) => item.id === id);
  const back = () => route.params?.returnTo === "Review" ? navigation.navigate("Main", { screen: "Review" }) : navigation.goBack();

  if (!capture) {
    return <View style={styles.center}><Text>This capture no longer exists.</Text></View>;
  }
  const card = dark ? colors.darkCard : colors.card;
  const text = dark ? colors.darkText : colors.text;
  const imageUri = getImageUri(capture);
  const platform = getPlatform(capture.source, capture.title);
  const sourceUrl = getSourceUrl(capture.source, capture.title);
  const remove = () => Alert.alert("Delete this capture?", "This can’t be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => { deleteCapture(capture.id); toast("Deleted"); navigation.navigate("Main"); } },
  ]);

  return (
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <View style={styles.actions}>
        <Pressable onPress={back} style={[styles.circle, { backgroundColor: card }]}><ArrowLeft size={18} color={colors.accent} /></Pressable>
        <View style={styles.actionGroup}>
          <Pressable onPress={() => toggleFavourite(capture.id)} style={[styles.circle, { backgroundColor: card }]}><Heart size={18} color={capture.favourite ? colors.warning : colors.accent} fill={capture.favourite ? colors.warning : "transparent"} /></Pressable>
          <Pressable style={[styles.circle, { backgroundColor: card }]}><Share2 size={18} color={colors.accent} /></Pressable>
          <Pressable style={[styles.circle, { backgroundColor: card }]}><MoreHorizontal size={19} color={colors.accent} /></Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" accessibilityLabel={capture.title} />
        ) : (
          <View style={styles.preview}><View style={styles.browserBar} /><View style={styles.line} /><View style={[styles.line, { width: "58%" }]} /><View style={[styles.line, { width: "75%" }]} /></View>
        )}
        <View style={styles.metaRow}>
          {platform && <Image source={{ uri: platform.iconUri }} style={styles.platformLogo} accessibilityLabel={`${platform.name} logo`} />}
          <Text style={styles.badge}>{capture.category || capture.kind}</Text>
          <Pressable disabled={!sourceUrl} onPress={() => sourceUrl && Linking.openURL(sourceUrl)}>
            <Text style={[styles.meta, sourceUrl && styles.link]}>{platform?.name || capture.source} · {capture.createdAt}</Text>
          </Pressable>
        </View>
        <Text style={[styles.title, { color: text }]}>{capture.title}</Text>
        <View style={[styles.extracted, { backgroundColor: card }]}>
          <Text style={[styles.extractedTitle, { color: text }]}>Extracted text</Text>
          <Text style={styles.body}>{capture.body || "No extracted text is available for this capture."}</Text>
          <Pressable onPress={() => toast("Copied")} style={styles.copy}><Copy size={15} color={colors.accent} /><Text style={styles.accentText}>Copy extracted text</Text></Pressable>
        </View>
        <TextInput multiline placeholder="Add a note…" placeholderTextColor={colors.faint} style={[styles.input, { backgroundColor: card, color: text }]} />
        <View style={styles.chips}>
          <Pressable onPress={() => { archiveCapture(capture.id); toast("Archived"); navigation.navigate("Main"); }} style={styles.chip}><Archive size={14} color={colors.secondary} /><Text style={styles.chipText}>Archive</Text></Pressable>
          <Pressable onPress={remove} style={styles.chip}><Trash2 size={14} color={colors.danger} /><Text style={styles.danger}>Delete</Text></Pressable>
        </View>
      </ScrollView>
    </View>
  );
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
  browserBar: { height: 22, borderRadius: 7, backgroundColor: "rgba(255,255,255,.75)" },
  line: { width: "86%", height: 7, borderRadius: 4, backgroundColor: "rgba(66,63,145,.32)" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  platformLogo: { width: 22, height: 22, borderRadius: 5 },
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
  chips: { flexDirection: "row", gap: 8 },
  chip: { height: 36, paddingHorizontal: 13, borderRadius: 18, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 5 },
  chipText: { color: colors.secondary },
  danger: { color: colors.danger },
});
