import { Archive, CheckCircle2, FileText, Heart, Image as ImageIcon, Link2, Mic, Share2, StickyNote, Trash2, type LucideIcon } from "lucide-react-native";
import { shareAsync } from "expo-sharing";
import { useState } from "react";
import { Alert, Image, Modal, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { getTheme, radius, shadow, spacing, type } from "../theme";
import type { Capture } from "../types";
import { useAppStore } from "../store/AppStore";
import { formatCaptureTime, getImageUri, getPlatform, getSourceUrl } from "../utils/capture";
import { formatReminderLabel } from "../utils/reminders";
import { useToast } from "./ToastProvider";
import { SheetShell } from "./ui";

const icons = { link: Link2, image: ImageIcon, note: StickyNote, document: FileText, task: CheckCircle2, voice: Mic };

export function CaptureCard({ capture, dark = false, query, onPress, variant = "standard" }: {
  capture: Capture;
  dark?: boolean;
  query?: string;
  onPress?: () => void;
  variant?: "standard" | "compact";
}) {
  const theme = getTheme(dark);
  const toast = useToast();
  const { now, archiveCapture, deleteCapture, toggleFavourite } = useAppStore();
  const Icon = icons[capture.kind];
  const index = query ? capture.title.toLowerCase().indexOf(query.toLowerCase()) : -1;
  const imageUri = getImageUri(capture);
  const platform = getPlatform(capture.source, capture.title);
  const [logoFailed, setLogoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const compact = variant === "compact";
  const reminderLabel = formatReminderLabel(capture.reminderNotificationId ? capture.reminderAt : undefined, new Date(now));
  const sourceUrl = getSourceUrl(capture.source, capture.title, capture.body, capture.userNote, capture.metadataTitle, capture.metadataDescription);

  const share = async () => {
    setActionsOpen(false);
    try {
      if (capture.localFileUri) await shareAsync(capture.localFileUri, { mimeType: capture.mimeType, dialogTitle: capture.title });
      else await Share.share({ message: [...new Set([capture.title, capture.body, capture.userNote, sourceUrl].filter(Boolean))].join("\n\n"), url: sourceUrl });
      toast("Shared");
    } catch (error) { console.error("Failed to share capture", error); Alert.alert("Couldn’t share this capture", "Please try again."); }
  };

  const remove = () => {
    setActionsOpen(false);
    Alert.alert("Delete this capture?", "This can’t be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        if (await deleteCapture(capture.id)) toast("Deleted");
        else Alert.alert("Couldn’t delete this capture", "Please try again.");
      } },
    ]);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${capture.title}`}
        accessibilityHint="Hold for capture actions"
        delayLongPress={350}
        onLongPress={() => setActionsOpen(true)}
        onPress={onPress}
        style={({ pressed }) => [styles.card, compact && styles.compactCard, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}
      >
      <View style={[styles.media, compact && styles.compactMedia, { backgroundColor: theme.accentSoft }]}>
        {imageUri && !imageFailed ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" accessibilityLabel={capture.title} onError={() => setImageFailed(true)} />
        ) : platform && !logoFailed ? (
          <Image source={{ uri: platform.iconUri }} style={styles.mediaPlatformLogo} resizeMode="contain" accessibilityLabel={`${platform.name} logo`} onError={() => setLogoFailed(true)} />
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
          <Text style={[styles.meta, { color: theme.textMuted }]}>{formatCaptureTime(capture.capturedAt, capture.createdAt, new Date(now))}</Text>
        </View>
        <Text numberOfLines={compact ? 2 : 3} style={[styles.title, { color: theme.text }]}>
          {index < 0 ? capture.title : <>{capture.title.slice(0, index)}<Text style={{ color: theme.accentText, backgroundColor: theme.accentSoft }}>{capture.title.slice(index, index + query!.length)}</Text>{capture.title.slice(index + query!.length)}</>}
        </Text>
        {capture.body || capture.metadataDescription ? <Text numberOfLines={compact ? 2 : 3} style={[styles.body, { color: theme.textSecondary }]}>{capture.body || capture.metadataDescription}</Text> : null}
        {capture.category || reminderLabel ? <View style={styles.badgeRow}>
          {capture.category ? <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}><Text style={[styles.badgeText, { color: theme.accentText }]}>{capture.category}</Text></View> : null}
          {reminderLabel ? <View style={[styles.badge, { backgroundColor: theme.surfaceMuted }]}><Text style={[styles.badgeText, { color: theme.textSecondary }]}>{reminderLabel}</Text></View> : null}
        </View> : null}
      </View>
      </Pressable>
      <Modal visible={actionsOpen} transparent animationType="slide" onRequestClose={() => setActionsOpen(false)}>
        <Pressable style={[styles.scrim, { backgroundColor: theme.scrim }]} onPress={() => setActionsOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <SheetShell>
              <Text numberOfLines={2} style={[styles.sheetTitle, { color: theme.text }]}>{capture.title}</Text>
              <CardAction icon={Share2} label="Share" onPress={() => void share()} />
              <CardAction icon={Heart} label={capture.favourite ? "Remove from Favourites" : "Add to Favourites"} active={capture.favourite} onPress={() => { setActionsOpen(false); toggleFavourite(capture.id); toast(capture.favourite ? "Removed from Favourites" : "Added to Favourites"); }} />
              <CardAction icon={Archive} label="Archive" onPress={() => { setActionsOpen(false); if (!capture.archived) archiveCapture(capture.id); toast(capture.archived ? "Already archived" : "Archived"); }} />
              <CardAction icon={Trash2} label="Delete" danger onPress={remove} />
            </SheetShell>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function CardAction({ icon: Icon, label, onPress, active = false, danger = false }: { icon: LucideIcon; label: string; onPress: () => void; active?: boolean; danger?: boolean }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  const color = danger ? theme.danger : active ? theme.accentText : theme.text;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, pressed && styles.pressed]}><Icon size={20} color={color} fill={active ? color : "transparent"} /><Text style={[styles.actionText, { color }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  card: { minHeight: 154, padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "flex-start", gap: spacing.md, ...shadow },
  compactCard: { minHeight: 126, padding: spacing.sm, gap: spacing.sm, shadowOpacity: 0.045, shadowRadius: 14 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  media: { width: 116, height: 122, borderRadius: radius.md, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  compactMedia: { width: 92, height: 100, borderRadius: radius.sm },
  image: { width: "100%", height: "100%" },
  mediaPlatformLogo: { width: 58, height: 58, borderRadius: radius.sm },
  content: { flex: 1, minWidth: 0, justifyContent: "center", alignItems: "flex-start" },
  metaRow: { width: "100%", minHeight: 20, flexDirection: "row", alignItems: "center", gap: 5, overflow: "hidden" },
  platformLogo: { width: 17, height: 17, borderRadius: 4 },
  platformText: { fontSize: 11, fontWeight: "800" },
  meta: { ...type.meta, flexShrink: 1, textTransform: "capitalize" },
  dot: { fontSize: 12 },
  title: { ...type.cardTitle, alignSelf: "stretch", marginTop: 3 },
  body: { ...type.meta, alignSelf: "stretch", marginTop: 4 },
  badgeRow: { marginTop: spacing.xs, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 11.5, lineHeight: 15, fontWeight: "600" },
  scrim: { flex: 1, justifyContent: "flex-end" },
  sheetTitle: { ...type.section, marginBottom: spacing.xs },
  action: { minHeight: 54, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  actionText: { ...type.body, fontWeight: "600" },
});
