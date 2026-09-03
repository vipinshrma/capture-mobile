import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Archive } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CaptureCard } from "../components/CaptureCard";
import { BackHeader, EmptyState, Screen } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { getTheme, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Archive">;

export function ArchiveScreen({ navigation }: Props) {
  const { captures, dark } = useAppStore();
  const theme = getTheme(dark);
  const archived = captures.filter((item) => item.archived);
  return (
    <Screen>
      <BackHeader onBack={navigation.goBack} />
      <Text style={[styles.title, { color: theme.text }]}>Archive</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {archived.map((capture) => <CaptureCard key={capture.id} capture={capture} dark={dark} variant="compact" onPress={() => navigation.navigate("CaptureDetail", { id: capture.id })} />)}
        {!archived.length && <View style={styles.empty}><EmptyState icon={Archive} title="Nothing archived yet" message="Captures you archive during review will appear here." /></View>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...type.display, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  list: { padding: spacing.md, paddingBottom: 48, gap: spacing.md },
  empty: { marginTop: 64 },
});
