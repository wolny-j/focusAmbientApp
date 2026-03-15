import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { useState } from "react";

export default function PresetNamePopup({
  visible,
  onCancel,
  onSave,
}: {
  visible: boolean;
  onCancel: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>Preset name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter preset name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.buttons}>
            <Pressable
              style={styles.cancel}
              onPress={() => {
                setName("");
                onCancel();
              }}
            >
              <Text style={{ color: "#E57373" }}>Cancel</Text>
            </Pressable>

            <Pressable
              style={styles.save}
              onPress={() => {
                if (!name.trim()) return;

                onSave(name.trim());
                setName("");
              }}
            >
              <Text style={{ color: "#B983FF" }}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },

  popup: {
    backgroundColor: "#2D1F27",
    borderRadius: 20,
    padding: 25,
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "300",
    marginBottom: 20,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#555",
    color: "white",
    padding: 10,
    marginBottom: 25,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancel: {
    padding: 10,
  },

  save: {
    padding: 10,
  },
});
