import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { FileText, Image as ImageIcon, Inbox as InboxIcon, Link2, Plus, StickyNote } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CaptureCard } from "../components/CaptureCard";
import { QuickCaptureSheet } from "../components/QuickCaptureSheet";
import { useToast } from "../components/ToastProvider";
import { EmptyState, FilterChip, Screen, ScreenTitle, SearchPill, SectionLabel } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { getTheme, spacing } from "../theme";
import type { RootStackParamList, TabParamList } from "../types";

const filters = ["All", "Links", "Images", "Notes", "Documents"] as const;
const filterIcons = { All: InboxIcon, Links: Link2, Images: ImageIcon, Notes: StickyNote, Documents: FileText };

export function InboxScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<TabParamList, "Inbox">>();
  const { captures, dark, addCapture } = useAppStore();
  const theme = getTheme(dark);
  const toast = useToast();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [quickOpen, setQuickOpen] = useState(Boolean(route.params?.openQuickCapture));
  const visible = useMemo(() => captures.filter((item) => {
    if (item.archived) return false;
    if (filter === "All") return true;
    return {
      Links: "link",
      Images: "image",
      Notes: "note",
      Documents: "document",
    }[filter] === item.kind;
  }), [captures, filter]);

  return (
    <Screen>
      <ScreenTitle title="Inbox" subtitle="All captures" onAvatar={() => navigation.navigate("Settings")} />
      <SearchPill dark={dark} onPress={() => navigation.navigate("Main", { screen: "Search" })} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroller} contentContainerStyle={styles.filters}>
        {filters.map((item) => (
          <FilterChip key={item} label={item} icon={filterIcons[item]} selected={filter === item} onPress={() => setFilter(item)} />
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={[styles.list, !visible.length && styles.emptyList]} showsVerticalScrollIndicator={false}>
        {visible.length ? (
          <>
            <SectionLabel>{filter === "All" ? "Recently saved" : filter}</SectionLabel>
            {visible.map((capture) => <CaptureCard key={capture.id} capture={capture} dark={dark} onPress={() => navigation.navigate("CaptureDetail", { id: capture.id })} />)}
          </>
        ) : (
          <EmptyState icon={InboxIcon} title={filter === "All" ? "Your inbox is ready" : `No ${filter.toLowerCase()} yet`} message="Tap the plus button to save something without organizing it first." />
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <Pressable accessibilityLabel="Quick capture" accessibilityRole="button" onPress={() => setQuickOpen(true)} style={({ pressed }) => [styles.fab, { backgroundColor: theme.accent, shadowColor: theme.shadow }, pressed && styles.pressed]}><Plus size={27} color={theme.onAccent} /></Pressable>
      <QuickCaptureSheet visible={quickOpen} onClose={() => setQuickOpen(false)} onSave={(input) => { addCapture(input); setQuickOpen(false); toast("Added to Inbox"); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterScroller: { flexGrow: 0 },
  filters: { gap: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  list: { padding: spacing.md, gap: spacing.md },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  fab: { position: "absolute", right: 18, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.24, shadowRadius: 18, elevation: 7 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.96 }] },
});
