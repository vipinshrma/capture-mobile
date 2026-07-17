import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CaptureCard } from "../components/CaptureCard";
import { BackHeader } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Archive">;

export function ArchiveScreen({ navigation }: Props) {
  const { captures, dark } = useAppStore();
  const archived = captures.filter((item) => item.archived);
  return (
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <BackHeader title="Archive" dark={dark} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.list}>
        {archived.map((capture) => <CaptureCard key={capture.id} capture={capture} dark={dark} onPress={() => navigation.navigate("CaptureDetail", { id: capture.id })} />)}
        {!archived.length && <Text style={styles.empty}>Nothing archived yet.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  darkScreen: { backgroundColor: colors.darkBackground },
  list: { padding: 16, gap: 14 },
  empty: { marginTop: 50, color: colors.secondary, textAlign: "center" },
});
