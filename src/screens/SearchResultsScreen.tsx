import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CaptureCard } from "../components/CaptureCard";
import { BackHeader, PrimaryButton, SearchPill, SectionLabel } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";
import { matchesSearchFilters, type ContentFilter, type DateFilter } from "../utils/searchFilters";

type Props = NativeStackScreenProps<RootStackParamList, "SearchResults">;

export function SearchResultsScreen({ navigation, route }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [contentFilter, setContentFilter] = useState<ContentFilter>();
  const [dateFilter, setDateFilter] = useState<DateFilter>();
  const { captures, dark } = useAppStore();
  const query = route.params.query;
  const results = useMemo(() => captures.filter((item) => {
    const searchable = `${item.title} ${item.body || ""} ${item.userNote || ""} ${item.category || ""} ${item.metadataTitle || ""} ${item.metadataDescription || ""} ${item.metadataSiteName || ""}`;
    return searchable.toLowerCase().includes(query.toLowerCase())
      && matchesSearchFilters(item, contentFilter, dateFilter);
  }), [captures, contentFilter, dateFilter, query]);
  return (
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <BackHeader dark={dark} onBack={navigation.goBack} />
      <SearchPill dark={dark} label={query} onPress={() => navigation.goBack()} />
      <View style={styles.metaRow}><Text style={styles.meta}>{results.length} results</Text><Pressable onPress={() => setFiltersOpen(true)}><Text style={styles.filters}>Filters</Text></Pressable></View>
      <ScrollView contentContainerStyle={styles.list}>
        {results.map((capture) => <CaptureCard key={capture.id} capture={capture} dark={dark} query={query} onPress={() => navigation.navigate("CaptureDetail", { id: capture.id })} />)}
        {!results.length && <Text style={styles.empty}>No captures match “{query}”.</Text>}
      </ScrollView>
      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setFiltersOpen(false)}>
          <Pressable style={[styles.sheet, dark && styles.darkSurface]} onPress={(event) => event.stopPropagation()}>
            <View style={styles.handle} /><Text style={[styles.title, dark && styles.darkText]}>Filters</Text>
            <SectionLabel>Content type</SectionLabel>
            <View style={styles.wrap}>{(["Links", "Screenshots", "Documents", "Notes", "Audio", "Tasks"] as ContentFilter[]).map((item) => <Pressable key={item} onPress={() => setContentFilter(contentFilter === item ? undefined : item)}><Text style={[styles.chip, dark && styles.darkSurface, contentFilter === item && styles.activeChip]}>{item}</Text></Pressable>)}</View>
            <SectionLabel>Date</SectionLabel>
            <View style={styles.wrap}>{(["Today", "This week", "This month"] as DateFilter[]).map((item) => <Pressable key={item} onPress={() => setDateFilter(dateFilter === item ? undefined : item)}><Text style={[styles.chip, dark && styles.darkSurface, dateFilter === item && styles.activeChip]}>{item}</Text></Pressable>)}</View>
            <PrimaryButton onPress={() => setFiltersOpen(false)}>Apply</PrimaryButton>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  darkScreen: { backgroundColor: colors.darkBackground },
  darkSurface: { backgroundColor: colors.darkCard },
  darkText: { color: colors.darkText },
  metaRow: { padding: 16, flexDirection: "row", justifyContent: "space-between" },
  meta: { color: colors.muted, fontSize: 13 },
  filters: { color: colors.accent, fontSize: 14, fontWeight: "600" },
  list: { padding: 16, gap: 14 },
  empty: { color: colors.secondary, textAlign: "center", marginTop: 60 },
  scrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,.35)" },
  sheet: { padding: 18, paddingBottom: 34, gap: 14, backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: "#D1D1D6" },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.surface, color: colors.secondary },
  activeChip: { backgroundColor: colors.accent, color: "white" },
});
