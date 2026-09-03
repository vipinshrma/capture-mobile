import { CheckCircle2, FileText, Image as ImageIcon, Link2, Mic, StickyNote } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { getTheme, radius, shadow, spacing, type } from "../theme";
import type { Capture } from "../types";
import { getImageUri, getPlatform } from "../utils/capture";

const icons = { link: Link2, image: ImageIcon, note: StickyNote, document: FileText, task: CheckCircle2, voice: Mic };

export function CaptureCard({ capture, dark = false, query, onPress, variant = "standard" }: {
  capture: Capture;
  dark?: boolean;
  query?: string;
  onPress?: () => void;
  variant?: "standard" | "compact";
}) {
  const theme = getTheme(dark);
  const Icon = icons[capture.kind];
  const index = query ? capture.title.toLowerCase().indexOf(query.toLowerCase()) : -1;
  const imageUri = getImageUri(capture);
  const platform = getPlatform(capture.source, capture.title);
  const [logoFailed, setLogoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const compact = variant === "compact";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${capture.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compactCard, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}
    >
      <View style={[styles.media, compact && styles.compactMedia, { backgroundColor: theme.accentSoft }]}>
        {imageUri && !imageFailed ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" accessibilityLabel={capture.title} onError={() => setImageFailed(true)} />
        ) : (
          <Icon size={compact ? 27 : 32} strokeWidth={1.9} color={theme.accentText} />
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.metaRow}>
          {platform && !logoFailed ? <Image source={{ uri: platform.iconUri }} style={styles.platformLogo} accessibilityLabel={`${platform.name} logo`} onError={() => setLogoFailed(true)} /> : null}
          {platform && logoFailed ? <Text style={[styles.platformText, { color: theme.accentText }]}>{platform.label}</Text> : null}
          <Text numberOfLines={1} style={[styles.meta, { color: theme.textMuted }]}>{platform?.name || capture.source || capture.kind}</Text>
          <Text style={[styles.dot, { color: theme.textMuted }]}>·</Text>
          <Text style={[styles.meta, { color: theme.textMuted }]}>{capture.createdAt}</Text>
        </View>
        <Text numberOfLines={compact ? 2 : 3} style={[styles.title, { color: theme.text }]}>
          {index < 0 ? capture.title : <>{capture.title.slice(0, index)}<Text style={{ color: theme.accentText, backgroundColor: theme.accentSoft }}>{capture.title.slice(index, index + query!.length)}</Text>{capture.title.slice(index + query!.length)}</>}
        </Text>
        {capture.body || capture.metadataDescription ? <Text numberOfLines={compact ? 2 : 3} style={[styles.body, { color: theme.textSecondary }]}>{capture.body || capture.metadataDescription}</Text> : null}
        {capture.category ? <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}><Text style={[styles.badgeText, { color: theme.accentText }]}>{capture.category}</Text></View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 154, padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "stretch", gap: spacing.md, ...shadow },
  compactCard: { minHeight: 126, padding: spacing.sm, gap: spacing.sm, shadowOpacity: 0.045, shadowRadius: 14 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  media: { width: 116, minHeight: 122, borderRadius: radius.md, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  compactMedia: { width: 92, minHeight: 100, borderRadius: radius.sm },
  image: { width: "100%", height: "100%" },
  content: { flex: 1, justifyContent: "center", alignItems: "flex-start" },
  metaRow: { maxWidth: "100%", minHeight: 20, flexDirection: "row", alignItems: "center", gap: 5 },
  platformLogo: { width: 17, height: 17, borderRadius: 4 },
  platformText: { fontSize: 11, fontWeight: "800" },
  meta: { ...type.meta, flexShrink: 1, textTransform: "capitalize" },
  dot: { fontSize: 12 },
  title: { ...type.cardTitle, marginTop: 3 },
  body: { ...type.meta, marginTop: 4 },
  badge: { marginTop: spacing.xs, borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 11.5, lineHeight: 15, fontWeight: "600" },
});
