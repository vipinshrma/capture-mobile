import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";
import { PrimaryButton } from "./ui";

export function QuickCaptureSheet({ visible, onClose, onSave }: {
  visible: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const save = () => {
    onSave(note);
    setNote("");
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.types}>
            {["Write a note", "Record voice", "Choose photo", "Paste link"].map((item, index) => (
              <Text key={item} style={[styles.type, index === 0 && styles.typeActive]}>{item}</Text>
            ))}
          </View>
          <TextInput
            autoFocus
            multiline
            value={note}
            onChangeText={setNote}
            placeholder="What do you want to remember?"
            placeholderTextColor={colors.faint}
            style={styles.input}
          />
          <View style={styles.buttons}>
            <View style={styles.flex}><PrimaryButton secondary onPress={onClose}>Cancel</PrimaryButton></View>
            <View style={styles.flex}><PrimaryButton onPress={save}>Save</PrimaryButton></View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,.35)" },
  sheet: { padding: 18, paddingBottom: 34, gap: 14, backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { alignSelf: "center", width: 36, height: 5, borderRadius: 3, backgroundColor: "#D1D1D6" },
  types: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  type: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 15, backgroundColor: colors.surface, color: colors.secondary, fontSize: 13 },
  typeActive: { backgroundColor: colors.accentSoft, color: colors.accent, fontWeight: "600" },
  input: { minHeight: 96, borderRadius: 14, padding: 13, backgroundColor: "#F5F4F1", color: colors.text, fontSize: 15, textAlignVertical: "top" },
  buttons: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
});
