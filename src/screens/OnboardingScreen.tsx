import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FileText, Image, Link2, Search, Share2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/ui";
import { useAppStore } from "../store/AppStore";
import { colors, shadow } from "../theme";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const copy = [
  ["Save anything without organizing it first", "Tuck links, screenshots, notes, files and ideas from any app."],
  ["Use the Share button anywhere", "Send content to Tuck from Safari, Photos, Files, WhatsApp and other apps."],
  ["Find it when you need it", "Tuck keeps text, categories and useful items ready when they matter."],
];

export function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const { finishOnboarding } = useAppStore();
  const finish = () => {
    finishOnboarding();
    navigation.replace("Main", { screen: "Inbox", params: { openQuickCapture: true } });
  };
  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <View style={styles.art}>
          {step === 1 ? <Share2 size={60} color={colors.accent} /> : step === 2 ? <Search size={60} color={colors.accent} /> : (
            <View style={styles.cards}>
              {[Link2, FileText, Image].map((Icon, index) => <View key={index} style={styles.artCard}><Icon size={25} color={index === 1 ? colors.warning : colors.accent} /></View>)}
            </View>
          )}
        </View>
        <Text style={styles.title}>{copy[step][0]}</Text>
        <Text style={styles.bodyText}>{copy[step][1]}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.dots}>{copy.map((_, index) => <View key={index} style={[styles.dot, index === step && styles.activeDot]} />)}</View>
        <PrimaryButton onPress={() => step === 2 ? finish() : setStep(step + 1)}>{step === 2 ? "Start Capturing" : "Continue"}</PrimaryButton>
        {step === 2 && <Pressable onPress={finish}><Text style={styles.skip}>Skip</Text></Pressable>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 22, paddingHorizontal: 28 },
  art: { width: 220, height: 220, borderRadius: 28, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  cards: { flexDirection: "row" },
  artCard: { width: 55, height: 70, marginHorizontal: -5, borderRadius: 14, backgroundColor: "white", alignItems: "center", justifyContent: "center", ...shadow },
  title: { color: colors.text, fontSize: 26, lineHeight: 34, fontWeight: "700", textAlign: "center" },
  bodyText: { color: colors.secondary, fontSize: 15, lineHeight: 22, textAlign: "center" },
  footer: { padding: 28, gap: 14, alignItems: "center" },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D6D4E8" },
  activeDot: { backgroundColor: colors.accent },
  skip: { color: colors.muted, fontSize: 15 },
});
