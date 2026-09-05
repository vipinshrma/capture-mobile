import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { ArrowLeft, Search, Settings2, type LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../store/AppStore";
import { getTheme, radius, shadow, spacing, type } from "../theme";

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  const { dark } = useAppStore();
  return <View style={[styles.screen, { backgroundColor: getTheme(dark).background }, style]}>{children}</View>;
}

export function PrimaryButton({ children, onPress, secondary = false, danger = false, disabled = false }: {
  children: ReactNode;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  const backgroundColor = danger ? theme.danger : secondary ? theme.surfaceMuted : theme.accent;
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor }, disabled && styles.disabled, pressed && styles.pressed]}>
      <Text style={[styles.buttonText, { color: secondary ? theme.textSecondary : theme.onAccent }]}>{children}</Text>
    </Pressable>
  );
}

export function BrandMark() {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return (
    <View accessibilityLabel="Tuck" style={styles.brand}>
      <View style={styles.brandGlyph}>
        <View style={[styles.brandPill, { backgroundColor: theme.accent }]} />
        <View style={[styles.brandPill, styles.brandPillMiddle, { backgroundColor: theme.accent }]} />
        <View style={[styles.brandPill, { backgroundColor: theme.accent }]} />
      </View>
      <Text style={[styles.brandText, { color: theme.text }]}>Tuck</Text>
    </View>
  );
}

export function ScreenTitle({ title, subtitle, onAvatar, dark: _dark }: { title: string; subtitle?: string; onAvatar?: () => void; dark?: boolean }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return (
    <View style={styles.titleBar}>
      <View style={styles.titleCopy}>
        {title === "Inbox" ? <BrandMark /> : null}
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      </View>
      {onAvatar ? <IconButton accessibilityLabel="Open settings" icon={Settings2} onPress={onAvatar} /> : null}
    </View>
  );
}

export function BackHeader({ title, onBack, dark: _dark }: { title?: string; onBack: () => void; dark?: boolean }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return <View style={styles.backHeader}><IconButton accessibilityLabel="Go back" icon={ArrowLeft} onPress={onBack} />{title ? <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text> : null}</View>;
}

export function IconButton({ accessibilityLabel, icon: Icon, onPress, active = false, danger = false }: {
  accessibilityLabel: string;
  icon: LucideIcon;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: active ? theme.accent : theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
      <Icon size={20} strokeWidth={2.1} color={danger ? theme.danger : active ? theme.onAccent : theme.accentText} />
    </Pressable>
  );
}

export function SearchPill({ label, onPress, dark: _dark }: { label?: string; onPress?: () => void; dark?: boolean }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return (
    <Pressable accessibilityRole="search" onPress={onPress} style={({ pressed }) => [styles.search, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
      <Search size={19} strokeWidth={2} color={theme.textMuted} />
      <Text numberOfLines={1} style={[styles.searchText, { color: label ? theme.text : theme.textMuted }]}>{label || "Search everything you saved"}</Text>
    </Pressable>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const { dark } = useAppStore();
  return <Text style={[styles.section, { color: getTheme(dark).textSecondary }]}>{children}</Text>;
}

export function FilterChip({ label, selected = false, icon: Icon, onPress }: { label: string; selected?: boolean; icon?: LucideIcon; onPress: () => void }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.chip, { backgroundColor: selected ? theme.accent : theme.surface, borderColor: selected ? theme.accent : theme.border }, pressed && styles.pressed]}>
      {Icon ? <Icon size={16} color={selected ? theme.onAccent : theme.textSecondary} /> : null}
      <Text style={[styles.chipText, { color: selected ? theme.onAccent : theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

export function SheetShell({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  return <View style={[styles.sheet, { paddingBottom: spacing.lg + bottomInset, backgroundColor: theme.surface, borderColor: theme.border }, style]}><View style={[styles.handle, { backgroundColor: theme.border }]} />{children}</View>;
}

export function EmptyState({ icon: Icon, title, message, action }: { icon: LucideIcon; title: string; message: string; action?: ReactNode }) {
  const { dark } = useAppStore();
  const theme = getTheme(dark);
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.accentSoft }]}><Icon size={30} color={theme.accentText} /></View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>{message}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  button: { width: "100%", minHeight: 52, borderRadius: radius.full, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  buttonText: { ...type.body, fontWeight: "700" },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  titleBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  titleCopy: { flex: 1, alignItems: "flex-start" },
  subtitle: { ...type.meta, marginTop: spacing.sm, marginBottom: 2 },
  title: { ...type.display },
  brand: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 9 },
  brandGlyph: { width: 27, height: 27, justifyContent: "center", gap: 2 },
  brandPill: { width: 17, height: 7, borderRadius: radius.full, transform: [{ rotate: "8deg" }] },
  brandPillMiddle: { alignSelf: "flex-end" },
  brandText: { fontSize: 26, lineHeight: 31, fontWeight: "800", letterSpacing: -0.7 },
  backHeader: { minHeight: 64, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconButton: { width: 44, height: 44, borderRadius: radius.full, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center", ...shadow },
  headerTitle: { ...type.section },
  search: { minHeight: 50, borderRadius: radius.full, marginHorizontal: spacing.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, gap: spacing.sm },
  searchText: { ...type.body, flex: 1 },
  section: { ...type.label, marginBottom: spacing.xs },
  chip: { minHeight: 42, paddingHorizontal: spacing.md, borderRadius: radius.full, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  chipText: { ...type.label },
  sheet: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: radius.full, marginBottom: spacing.xs },
  empty: { paddingHorizontal: spacing.xl, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyIcon: { width: 68, height: 68, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", marginBottom: spacing.xs },
  emptyTitle: { ...type.section, textAlign: "center" },
  emptyMessage: { ...type.body, maxWidth: 300, textAlign: "center" },
});
