import { createContext, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, shadow, spacing, type } from "../theme";

const ToastContext = createContext<(message: string) => void>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const opacity = useRef(new Animated.Value(0)).current;

  const show = (next: string) => {
    setMessage(next);
    opacity.stopAnimation();
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.delay(760),
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  return (
    <ToastContext.Provider value={show}>
      {children}
      {!!message && <Animated.View accessibilityLiveRegion="polite" pointerEvents="none" style={[styles.toast, { top: insets.top + 10, opacity, backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}><View style={[styles.icon, { backgroundColor: theme.accentSoft }]}><Check size={15} color={theme.accentText} /></View><Text style={[styles.text, { color: theme.text }]}>{message}</Text></Animated.View>}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: { position: "absolute", maxWidth: "88%", minHeight: 46, alignSelf: "center", zIndex: 100, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: spacing.xs, ...shadow },
  icon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  text: { ...type.label, flexShrink: 1 },
});
