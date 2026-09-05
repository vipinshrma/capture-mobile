import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FileText, Image, Link2, Search, Share2 } from "lucide-react-native";
import { useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandMark, PrimaryButton, Screen } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, shadow, spacing, type } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const copy = [
  ["Save anything without organizing it first", "Tuck links, screenshots, notes, files and ideas from any app."],
  ["Use the Share button anywhere", "Send content to Tuck from Safari, Photos, Files, WhatsApp and other apps."],
  ["Find it when you need it", "Tuck keeps text, categories and useful items ready when they matter."],
];

export function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const pager = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const { dark, finishOnboarding } = useAppStore();
  const theme = getTheme(dark);
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || (Platform.OS === "android" ? 48 : Platform.OS === "ios" ? 34 : 0);
  const finish = () => {
    finishOnboarding();
    navigation.replace("Main", { screen: "Inbox", params: { openQuickCapture: true } });
  };
  const continueOnboarding = () => {
    if (step === copy.length - 1) { finish(); return; }
    const next = step + 1;
    setStep(next);
    pager.current?.scrollTo({ x: width * next, animated: true });
  };
  return (
    <Screen>
      <View style={styles.brand}><BrandMark /></View>
      <ScrollView
        ref={pager}
        accessibilityLabel="Onboarding pages"
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => setStep(Math.round(event.nativeEvent.contentOffset.x / width))}
        style={styles.pager}
      >
        {copy.map(([title, body], page) => (
          <View key={title} style={[styles.body, { width }]}>
            <View style={[styles.art, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}>
              {page === 1 ? <Share2 size={60} color={theme.accentText} /> : page === 2 ? <Search size={60} color={theme.accentText} /> : (
                <View style={styles.cards}>
                  {[Link2, FileText, Image].map((Icon, index) => <View key={index} style={[styles.artCard, { backgroundColor: theme.surface }]}><Icon size={25} color={index === 1 ? theme.warning : theme.accentText} /></View>)}
                </View>
              )}
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>{body}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: 28 + bottomInset }]}>
        <View style={styles.dots}>{copy.map((_, index) => <View key={index} style={[styles.dot, { backgroundColor: index === step ? theme.accent : theme.border }, index === step && styles.activeDot]} />)}</View>
        <PrimaryButton onPress={continueOnboarding}>{step === 2 ? "Start Capturing" : "Continue"}</PrimaryButton>
        {step === 2 && <Pressable accessibilityRole="button" onPress={finish} style={styles.skipButton}><Text style={[styles.skip, { color: theme.textSecondary }]}>Skip</Text></Pressable>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  pager: { flex: 1 },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingHorizontal: 28 },
  art: { width: 220, height: 220, borderRadius: 32, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  cards: { flexDirection: "row" },
  artCard: { width: 58, height: 74, marginHorizontal: -5, borderRadius: radius.md, alignItems: "center", justifyContent: "center", ...shadow },
  title: { ...type.title, maxWidth: 330, textAlign: "center" },
  bodyText: { ...type.body, maxWidth: 320, textAlign: "center" },
  footer: { padding: 28, gap: spacing.sm, alignItems: "center" },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  activeDot: { width: 20 },
  skipButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.md },
  skip: { ...type.body },
});
