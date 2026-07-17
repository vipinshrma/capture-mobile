import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CaptureCard } from "../components/CaptureCard";
import { BackHeader } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { colors } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Favourites">;

export function FavouritesScreen({ navigation }: Props) {
  const { captures, dark } = useAppStore();
  const favourites = captures.filter((item) => item.favourite && !item.archived);
  return (
    <View style={[styles.screen, dark && styles.darkScreen]}>
      <BackHeader title="Favourites" dark={dark} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.list}>
        {favourites.map((capture) => <CaptureCard key={capture.id} capture={capture} dark={dark} onPress={() => navigation.navigate("CaptureDetail", { id: capture.id })} />)}
        {!favourites.length && <Text style={styles.empty}>No favourites yet.</Text>}
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
