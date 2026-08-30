import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { Inbox as InboxIcon, Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CaptureCard } from "../components/CaptureCard";
import { QuickCaptureSheet } from "../components/QuickCaptureSheet";
import { useToast } from "../components/ToastProvider";
import { ScreenTitle, SearchPill, SectionLabel } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList, TabParamList } from "../types";

const filters = ["All", "Links", "Images", "Notes", "Documents"] as const;

export function InboxScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<TabParamList, "Inbox">>();
  const { captures, dark, addCapture } = useAppStore();
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
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <ScreenTitle title="Inbox" dark={dark} onAvatar={() => navigation.navigate("Settings")} />
      <SearchPill dark={dark} onPress={() => navigation.navigate("Main", { screen: "Search" })} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroller} contentContainerStyle={styles.filters}>
        {filters.map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, dark && styles.darkFilter, filter === item && styles.activeFilter]}>
            <Text style={[styles.filterText, dark && styles.darkFilterText, filter === item && styles.activeFilterText]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={[styles.list, !visible.length && styles.emptyList]} showsVerticalScrollIndicator={false}>
        {visible.length ? (
          <>
            <SectionLabel>Today</SectionLabel>
            {visible.map((capture) => <CaptureCard key={capture.id} capture={capture} dark={dark} onPress={() => navigation.navigate("CaptureDetail", { id: capture.id })} />)}
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><InboxIcon size={28} color={colors.accent} /></View>
            <Text style={[styles.emptyTitle, dark && { color: colors.darkText }]}>{filter === "All" ? "Your inbox is empty" : `No ${filter.toLowerCase()} yet`}</Text>
            <Text style={styles.emptyText}>Tap + to save something new.</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <Pressable accessibilityLabel="Quick capture" onPress={() => setQuickOpen(true)} style={styles.fab}><Plus size={26} color="white" /></Pressable>
      <QuickCaptureSheet visible={quickOpen} onClose={() => setQuickOpen(false)} onSave={(input) => { addCapture(input); setQuickOpen(false); toast("Added to Inbox"); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  darkScreen: { backgroundColor: colors.darkBackground },
  filterScroller: { flexGrow: 0 },
  filters: { gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filter: { height: 34, paddingHorizontal: 16, borderRadius: 17, backgroundColor: "white", alignItems: "center", justifyContent: "center" },
  darkFilter: { backgroundColor: colors.darkCard },
  activeFilter: { backgroundColor: colors.accent },
  filterText: { color: colors.secondary, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  darkFilterText: { color: colors.faint },
  activeFilterText: { color: "white" },
  list: { padding: 16, gap: 14 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  empty: { alignItems: "center", gap: 8 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  emptyText: { color: colors.muted, fontSize: 14 },
  fab: { position: "absolute", right: 18, bottom: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", elevation: 7 },
});
