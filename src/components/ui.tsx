import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, Search } from "lucide-react-native";
import { colors, shadow } from "../theme";

export function PrimaryButton({ children, onPress, secondary = false, disabled = false }: {
  children: ReactNode;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondaryButton, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{children}</Text>
    </Pressable>
  );
}

export function ScreenTitle({ title, onAvatar, dark = false }: { title: string; onAvatar?: () => void; dark?: boolean }) {
  return (
    <View style={styles.titleBar}>
      <Text style={[styles.title, dark && { color: colors.darkText }]}>{title}</Text>
      {onAvatar && (
        <Pressable accessibilityLabel="Open settings" onPress={onAvatar} style={styles.avatar}>
          <Text style={styles.avatarText}>RK</Text>
        </Pressable>
      )}
    </View>
  );
}

export function BackHeader({ title, onBack, dark = false }: { title?: string; onBack: () => void; dark?: boolean }) {
  return (
    <View style={styles.backHeader}>
      <Pressable accessibilityLabel="Go back" onPress={onBack} style={[styles.circle, dark && { backgroundColor: colors.darkCard }]}>
        <ArrowLeft size={18} color={colors.accent} />
      </Pressable>
      {title && <Text style={[styles.headerTitle, dark && { color: colors.darkText }]}>{title}</Text>}
    </View>
  );
}

export function SearchPill({ label, onPress, dark = false }: { label?: string; onPress?: () => void; dark?: boolean }) {
  return (
    <Pressable accessibilityRole="search" onPress={onPress} style={[styles.search, dark && { backgroundColor: "rgba(255,255,255,.12)" }]}>
      <Search size={17} color={colors.muted} />
      <Text style={[styles.searchText, label && { color: dark ? colors.darkText : colors.text }]}>{label || "Search everything you saved"}</Text>
    </Pressable>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  secondaryButton: { backgroundColor: colors.surface, shadowOpacity: 0, elevation: 0 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  secondaryText: { color: colors.secondary },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.76 },
  titleBar: { paddingHorizontal: 20, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 32, lineHeight: 39, fontWeight: "700" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", ...shadow },
  avatarText: { color: "white", fontSize: 13, fontWeight: "700" },
  backHeader: { minHeight: 56, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  circle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "white", alignItems: "center", justifyContent: "center", ...shadow },
  headerTitle: { color: colors.text, fontSize: 22, fontWeight: "700" },
  search: { height: 42, borderRadius: 21, marginHorizontal: 16, backgroundColor: "rgba(255,255,255,.8)", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 8, ...shadow },
  searchText: { color: colors.muted, fontSize: 15 },
  section: { color: colors.muted, fontSize: 12, lineHeight: 18, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
});
