import { useState, useRef } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import SoundManager from "../tools/soundManager";

export default function TimerPopup() {
  const [minutes, setMinutes] = useState<number>(30);
  const [tempMinutes, setTempMinutes] = useState<number>(30);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [colour, setColour] = useState("white");
  const [cancelTimerVisible, setCancelTimerVisible] = useState(false);

  function startTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    } // czyścimy poprzedni timer, jeśli istnieje
    setColour("#B983FF");
    setCancelTimerVisible(true);
    timerRef.current = setInterval(() => {
      setMinutes((prev) => {
        if (prev < 0) {
          SoundManager.stopAll();
          if (timerRef.current) clearInterval(timerRef.current);
          setMinutes(30);
          setColour("#FFFFFF");
          setCancelTimerVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 60000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setMinutes(30);
    setColour("white");
    setCancelTimerVisible(false);
  }

  return (
    <View style={{ flexDirection: "row" }}>
      <Pressable onPress={() => setVisible(true)}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MaterialIcons
            name={cancelTimerVisible ? "timelapse" : "timer"}
            size={28}
            color={colour}
          />
          <Text style={{ color: colour, fontSize: 22, fontWeight: 200 }}>
            {minutes} min
          </Text>
        </View>
      </Pressable>

      {cancelTimerVisible && (
        <Pressable
          style={{
            position: "absolute",
            right: 10,
          }}
          onPress={() => stopTimer()}
        >
          <MaterialIcons name="timer-off" size={28} color="#E57373" />
        </Pressable>
      )}

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.title}>Set timer</Text>

            <Picker
              selectedValue={tempMinutes}
              onValueChange={(value) => setTempMinutes(value)}
              style={{ color: "white" }}
              focusable
            >
              {[1, 3, 5, 10, 15, 30, 45, 60, 90, 120, 150, 180].map((m) => (
                <Picker.Item key={m} label={`${m} min`} value={m} />
              ))}
            </Picker>

            <Pressable
              onPress={() => {
                setMinutes(tempMinutes);
                setVisible(false);
                startTimer();
              }}
            >
              <Text style={styles.close}>Select</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#251922",
    justifyContent: "flex-end",
  },
  popup: {
    backgroundColor: "#2D1F27",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    marginBottom: 10,
  },
  close: {
    color: "#B983FF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
});
