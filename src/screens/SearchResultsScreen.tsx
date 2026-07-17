import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CaptureCard } from "../components/CaptureCard";
import { BackHeader, PrimaryButton, SearchPill, SectionLabel } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "SearchResults">;

export function SearchResultsScreen({ navigation, route }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { captures, dark } = useAppStore();
  const query = route.params.query;
  const results = useMemo(() => captures.filter((item) => `${item.title} ${item.body || ""} ${item.category || ""}`.toLowerCase().includes(query.toLowerCase())), [captures, query]);
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
            <View style={styles.wrap}>{["Links", "Screenshots", "Documents", "Notes"].map((item, index) => <Text key={item} style={[styles.chip, dark && styles.darkSurface, index === 0 && styles.activeChip]}>{item}</Text>)}</View>
            <SectionLabel>Date</SectionLabel>
            <View style={styles.wrap}>{["Today", "This week", "This month"].map((item) => <Text key={item} style={[styles.chip, dark && styles.darkSurface]}>{item}</Text>)}</View>
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
