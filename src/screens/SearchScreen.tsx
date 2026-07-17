import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { ChevronRight, Clock3, Search, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenTitle, SectionLabel } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { colors, shadow } from "../theme";
import type { RootStackParamList } from "../types";

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { dark } = useAppStore();
  const [query, setQuery] = useState("");
  const search = (value = query) => value.trim() && navigation.navigate("SearchResults", { query: value.trim() });
  return (
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <ScreenTitle title="Search" dark={dark} />
      <View style={[styles.search, dark && styles.darkSurface]}>
        <Search size={17} color={colors.muted} />
        <TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => search()} placeholder="Search everything" placeholderTextColor={colors.muted} style={[styles.input, dark && styles.darkText]} />
        {!!query && <Pressable onPress={() => setQuery("")}><X size={17} color={colors.muted} /></Pressable>}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel>Recent searches</SectionLabel>
        {["offline-first", "product research", "daily review"].map((item) => (
          <Pressable key={item} onPress={() => search(item)} style={styles.row}><Clock3 size={17} color={colors.muted} /><Text style={[styles.rowText, dark && styles.darkText]}>{item}</Text><ChevronRight size={16} color={colors.faint} /></Pressable>
        ))}
        <View style={styles.suggested}>
          <SectionLabel>Suggested categories</SectionLabel>
          <View style={styles.wrap}>{["Development", "Ideas", "Reading", "Work", "Documents"].map((item) => <Text key={item} style={[styles.chip, dark && styles.darkSurface]}>{item}</Text>)}</View>
        </View>
        <Text style={styles.helper}>Search titles, notes, OCR text, transcriptions, URLs and categories.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  darkScreen: { backgroundColor: colors.darkBackground },
  darkSurface: { backgroundColor: colors.darkCard },
  darkText: { color: colors.darkText },
  search: { height: 42, marginHorizontal: 16, borderRadius: 21, paddingHorizontal: 14, backgroundColor: "white", flexDirection: "row", alignItems: "center", gap: 8, ...shadow },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  content: { padding: 20 },
  row: { minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator, flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { flex: 1, color: colors.text, fontSize: 16 },
  suggested: { marginTop: 22, gap: 9 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.surface, color: colors.secondary, fontSize: 13 },
  helper: { marginTop: 26, color: colors.faint, fontSize: 13, lineHeight: 19 },
});
