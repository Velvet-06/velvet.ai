import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function explore() {
  return (
    <SafeAreaView
      style={{ justifyContent: "center", flex: 1, alignItems: "center" }}
    >
      <View>
        <Text style={{ fontSize: 30 }}>Terms & Policy</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
