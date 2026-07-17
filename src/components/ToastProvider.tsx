import { createContext, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";

const ToastContext = createContext<(message: string) => void>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
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
      {!!message && <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]}><Text style={styles.text}>{message}</Text></Animated.View>}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: { position: "absolute", top: 54, alignSelf: "center", zIndex: 100, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: "rgba(28,28,30,.94)" },
  text: { color: "white", fontSize: 13.5, fontWeight: "600" },
});
