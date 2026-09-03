import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SearchX } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CaptureCard } from "../components/CaptureCard";
import { BackHeader, EmptyState, FilterChip, PrimaryButton, Screen, SearchPill, SectionLabel, SheetShell } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { getTheme, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";
import { matchesSearchFilters, type ContentFilter, type DateFilter } from "../utils/searchFilters";

type Props = NativeStackScreenProps<RootStackParamList, "SearchResults">;

export function SearchResultsScreen({ navigation, route }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [contentFilter, setContentFilter] = useState<ContentFilter>();
  const [dateFilter, setDateFilter] = useState<DateFilter>();
  const { captures, dark } = useAppStore();
  const theme = getTheme(dark);
  const query = route.params.query;
  const results = useMemo(() => captures.filter((item) => {
    const searchable = `${item.title} ${item.body || ""} ${item.userNote || ""} ${item.category || ""} ${item.metadataTitle || ""} ${item.metadataDescription || ""} ${item.metadataSiteName || ""}`;
    return searchable.toLowerCase().includes(query.toLowerCase()) && matchesSearchFilters(item, contentFilter, dateFilter);
  }), [captures, contentFilter, dateFilter, query]);

  return (
    <Screen>
      <BackHeader onBack={navigation.goBack} />
      <View style={styles.heading}>
        <Text style={[styles.count, { color: theme.textMuted }]}>{results.length} results</Text>
        <Text style={[styles.headingTitle, { color: theme.text }]}>Search Results</Text>
      </View>
      <SearchPill label={query} onPress={() => navigation.goBack()} />
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>{contentFilter || dateFilter ? "Filtered results" : "All matching captures"}</Text>
        <Pressable accessibilityRole="button" onPress={() => setFiltersOpen(true)} style={styles.filterButton}><Text style={[styles.filters, { color: theme.accentText }]}>Filters{contentFilter || dateFilter ? " · Active" : ""}</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {results.map((capture) => <CaptureCard key={capture.id} capture={capture} dark={dark} query={query} variant="compact" onPress={() => navigation.navigate("CaptureDetail", { id: capture.id })} />)}
        {!results.length ? <View style={styles.empty}><EmptyState icon={SearchX} title="No matching captures" message={`Try another search or clear a filter for “${query}”.`} /></View> : null}
      </ScrollView>
      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={[styles.scrim, { backgroundColor: theme.scrim }]} onPress={() => setFiltersOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <SheetShell>
              <Text style={[styles.title, { color: theme.text }]}>Filter results</Text>
              <SectionLabel>Content type</SectionLabel>
              <View style={styles.wrap}>{(["Links", "Screenshots", "Documents", "Notes", "Audio", "Tasks"] as ContentFilter[]).map((item) => <FilterChip key={item} label={item} selected={contentFilter === item} onPress={() => setContentFilter(contentFilter === item ? undefined : item)} />)}</View>
              <SectionLabel>Date</SectionLabel>
              <View style={styles.wrap}>{(["Today", "This week", "This month"] as DateFilter[]).map((item) => <FilterChip key={item} label={item} selected={dateFilter === item} onPress={() => setDateFilter(dateFilter === item ? undefined : item)} />)}</View>
              <PrimaryButton onPress={() => setFiltersOpen(false)}>Apply filters</PrimaryButton>
            </SheetShell>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  count: { ...type.meta, marginBottom: 2 },
  headingTitle: { ...type.display },
  metaRow: { minHeight: 52, paddingHorizontal: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  meta: { ...type.meta },
  filterButton: { minHeight: 44, justifyContent: "center", paddingLeft: spacing.md },
  filters: { ...type.label },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  empty: { marginTop: 64 },
  scrim: { flex: 1, justifyContent: "flex-end" },
  title: { ...type.title },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
