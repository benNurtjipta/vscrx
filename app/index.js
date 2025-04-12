import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Button as RNButton,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const ws = useRef(null);
  const [ip, setIp] = useState("");
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const storedIp = await AsyncStorage.getItem("ws_ip");
      if (storedIp) {
        setIp(storedIp);
        connect(storedIp); // Attempt to connect when stored IP is found
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (ip) {
      connect(ip); // Reconnect when IP is updated
    }
  }, [ip]);

  const connect = (ipAddress) => {
    if (!ipAddress) return;

    // Close the existing WebSocket connection if it's open
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close();
    }

    ws.current = new WebSocket(`ws://${ipAddress}:8080`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      setConnectionStatus("Connected"); // Update status to "Connected"
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected. Reconnecting in 2s...");
      setConnected(false);
      setConnectionStatus("Disconnected");
      setTimeout(() => connect(ipAddress), 2000);
    };

    ws.current.onerror = (e) => {
      console.log("WebSocket error", e.message);
      setConnectionStatus("Connection Failed"); // Update status to "Connection Failed"
    };
  };

  const sendCommand = (command) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log(`Sending command: ${command}`);
      ws.current.send(command);
    } else {
      Alert.alert("Error", "WebSocket not connected.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />

      <View style={styles.header}>
        <Text style={styles.title}>VS Code Remote</Text>
      </View>

      <View style={styles.content}>
        {!ip ? (
          <View style={styles.warning}>
            <Text style={styles.warningText}>⚠️ IP address not set.</Text>
            <Text style={styles.warningText}>
              Run `vscrx.showQr` in VS Code and enter the IP in Settings.
            </Text>
            <RNButton
              title="Go to Settings"
              onPress={() => router.push("/settings")}
            />
          </View>
        ) : (
          <View style={styles.buttonGroup}>
            <ControlButton
              label="Command Palette"
              onPress={() => sendCommand("openCommandPalette")}
            />
            <ControlButton
              label="Source Control"
              onPress={() => sendCommand("openSourceControl")}
            />
            <ControlButton
              label="Close Terminal"
              onPress={() => sendCommand("closeTerminal")}
            />
            <ControlButton
              label="Insert {"
              onPress={() => sendCommand("insertBracesLeft")}
            />
            <ControlButton
              label="Insert }"
              onPress={() => sendCommand("insertBracesRight")}
            />
            <ControlButton
              label="Insert ||"
              onPress={() => sendCommand("insertPipes")}
            />
            <ControlButton
              label="Reload Window"
              onPress={() => sendCommand("reloadWindow")}
            />
          </View>
        )}
      </View>

      <View style={styles.connectionStatus}>
        <Text style={styles.connectionStatusText}>
          Connection Status: {connectionStatus}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const ControlButton = ({ label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    padding: 20,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    color: "#fff",
    marginBottom: 20,
    alignSelf: "center",
    padding: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  button: {
    backgroundColor: "#2EA2FA",
    padding: 10,
    borderRadius: 10,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  warning: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  warningText: {
    color: "#FFA500",
    textAlign: "center",
    marginBottom: 10,
  },
  connectionStatus: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  connectionStatusText: {
    color: "#fff",
    fontSize: 12, // Smaller font size
    fontWeight: "bold",
  },
  header: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
  },
});
