import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Heart } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CaptureCard } from "../components/CaptureCard";
import { BackHeader, EmptyState, Screen } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { getTheme, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Favourites">;

export function FavouritesScreen({ navigation }: Props) {
  const { captures, dark } = useAppStore();
  const theme = getTheme(dark);
  const favourites = captures.filter((item) => item.favourite);
  return (
    <Screen>
      <BackHeader onBack={navigation.goBack} />
      <Text style={[styles.title, { color: theme.text }]}>Favourites</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {favourites.map((capture) => <CaptureCard key={capture.id} capture={capture} dark={dark} variant="compact" onPress={() => navigation.navigate("CaptureDetail", { id: capture.id })} />)}
        {!favourites.length && <View style={styles.empty}><EmptyState icon={Heart} title="No favourites yet" message="Favourite a capture to keep it close without moving it out of your Inbox." /></View>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...type.display, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  list: { padding: spacing.md, paddingBottom: 48, gap: spacing.md },
  empty: { marginTop: 64 },
});
