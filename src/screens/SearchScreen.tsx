import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { ChevronRight, Search, X } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { FilterChip, Screen, ScreenTitle, SectionLabel } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  const [query, setQuery] = useState("");
  const tabBarHeight = useBottomTabBarHeight();
  const search = (value = query) => value.trim() && navigation.navigate("SearchResults", { query: value.trim() });
  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboard}>
        <ScreenTitle title="Search" subtitle="Find anything you saved" />
        <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={19} color={theme.textMuted} />
          <TextInput accessibilityLabel="Search captures" returnKeyType="search" value={query} onChangeText={setQuery} onSubmitEditing={() => search()} placeholder="Search everything" placeholderTextColor={theme.textMuted} style={[styles.input, { color: theme.text }]} />
          {!!query && <Pressable accessibilityLabel="Clear search" onPress={() => setQuery("")} style={styles.clear}><X size={18} color={theme.textMuted} /></Pressable>}
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 24 }]} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          <SectionLabel>Try a search</SectionLabel>
          {["offline-first", "product research", "review"].map((item) => (
            <Pressable key={item} onPress={() => search(item)} style={[styles.row, { borderBottomColor: theme.border }]}><Search size={17} color={theme.textMuted} /><Text style={[styles.rowText, { color: theme.text }]}>{item}</Text><ChevronRight size={17} color={theme.textMuted} /></Pressable>
          ))}
          <View style={styles.suggested}>
            <SectionLabel>Suggested categories</SectionLabel>
            <View style={styles.wrap}>{["Development", "Screenshot", "Idea"].map((item) => <FilterChip key={item} label={item} onPress={() => search(item)} />)}</View>
          </View>
          <Text style={[styles.helper, { color: theme.textMuted }]}>Search titles, notes, URLs, categories, and saved details.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  search: { minHeight: 52, marginHorizontal: spacing.md, borderRadius: radius.full, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  input: { flex: 1, ...type.body },
  clear: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: -12 },
  content: { padding: spacing.lg },
  row: { minHeight: 58, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowText: { flex: 1, ...type.body, fontWeight: "600" },
  suggested: { marginTop: spacing.xl, gap: spacing.xs },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  helper: { marginTop: spacing.xxl, ...type.meta },
});
