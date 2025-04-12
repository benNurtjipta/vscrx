import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

export default function SettingsScreen({ navigation }) {
  const [ip, setIp] = useState("");

  useEffect(() => {
    const loadIp = async () => {
      const saved = await AsyncStorage.getItem("ws_ip");
      if (saved) setIp(saved);
    };
    loadIp();
  }, []);

  const saveIp = async () => {
    if (!ip) {
      Alert.alert("Error", "IP address cannot be empty.");
      return;
    }

    await AsyncStorage.setItem("ws_ip", ip);
    Alert.alert("Saved", "IP address saved!");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />
      <Text style={styles.title}>Enter WebSocket IP</Text>
      <TextInput
        value={ip}
        onChangeText={setIp}
        placeholder="e.g. 192.168.1.100"
        style={styles.input}
        keyboardType="numbers-and-punctuation"
      />
      <Button title="Save IP" onPress={saveIp} />
      <Text style={styles.helpText}>
        Run <Text style={styles.code}>vscrx.showQr</Text> in your VS Code
        command palette to display the current IP address of the extension host.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#1e1e1e",
    flex: 1,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  helpText: {
    color: "#ccc",
    marginTop: 20,
  },
  code: {
    color: "#2EA2FA",
    fontFamily: "monospace",
  },
});
