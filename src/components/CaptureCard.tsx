import { FileText, Image as ImageIcon, Link2, Mic, StickyNote, CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, shadow } from "../theme";
import type { Capture } from "../types";
import { getImageUri, getPlatform } from "../utils/capture";

const icons = {
  link: Link2,
  image: ImageIcon,
  note: StickyNote,
  document: FileText,
  task: CheckCircle2,
  voice: Mic,
};

export function CaptureCard({ capture, dark = false, query, onPress }: {
  capture: Capture;
  dark?: boolean;
  query?: string;
  onPress?: () => void;
}) {
  const Icon = icons[capture.kind];
  const text = dark ? colors.darkText : colors.text;
  const index = query ? capture.title.toLowerCase().indexOf(query.toLowerCase()) : -1;
  const imageUri = getImageUri(capture);
  const platform = getPlatform(capture.source, capture.title);
  const [logoFailed, setLogoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Pressable onPress={onPress} style={[styles.card, dark && styles.darkCard]}>
      <View style={styles.row}>
        <View style={[styles.icon, platform && styles.platformIconWrap]}>
          {platform && !logoFailed ? (
            <Image source={{ uri: platform.iconUri }} style={styles.platformLogo} accessibilityLabel={`${platform.name} logo`} onError={() => setLogoFailed(true)} />
          ) : platform ? (
            <Text style={styles.platformText}>{platform.label}</Text>
          ) : (
            <Icon size={20} color={colors.accent} />
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{platform?.name || capture.source || capture.kind}</Text>
            {capture.category && <Text style={styles.badge}>{capture.category}</Text>}
          </View>
          <Text style={[styles.title, { color: text }]}>
            {index < 0 ? capture.title : (
              <>
                {capture.title.slice(0, index)}
                <Text style={styles.highlight}>{capture.title.slice(index, index + query!.length)}</Text>
                {capture.title.slice(index + query!.length)}
              </>
            )}
          </Text>
          {(capture.body || capture.metadataDescription) && <Text style={styles.body}>{capture.body || capture.metadataDescription}</Text>}
          {imageUri && !imageFailed && <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" accessibilityLabel={capture.title} onError={() => setImageFailed(true)} />}
          <Text style={styles.time}>{capture.createdAt}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 22, backgroundColor: colors.card, ...shadow },
  darkCard: { backgroundColor: colors.darkCard },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  platformIconWrap: { backgroundColor: "white" },
  platformLogo: { width: 22, height: 22, borderRadius: 5 },
  platformText: { color: colors.accent, fontSize: 13, fontWeight: "800" },
  content: { flex: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { color: colors.muted, fontSize: 12.5, textTransform: "capitalize" },
  badge: { color: colors.accent, backgroundColor: colors.accentSoft, fontSize: 11, fontWeight: "600", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  title: { marginTop: 4, color: colors.text, fontSize: 16.5, lineHeight: 22, fontWeight: "600" },
  body: { marginTop: 4, color: colors.secondary, fontSize: 13.5, lineHeight: 20 },
  imagePreview: { marginTop: 10, width: "100%", height: 150, borderRadius: 14, backgroundColor: colors.surface },
  time: { marginTop: 7, color: colors.faint, fontSize: 12 },
  highlight: { color: colors.accent, backgroundColor: colors.accentSoft },
});
