import {
  View,
  Text,
  Pressable,
  Button,
  StatusBar,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { useColorScheme } from "react-native";
import CameraComponent from "@/components/camera/CameraComponent";

import Searchbar from "@/components/search/Search";

import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

export default function Homescreen() {
  const [camera, setCamera] = useState(false);
  const containertheme =
    useColorScheme() === "dark" ? styles.lightContainer : styles.darkContainer;

  const texttheme =
    useColorScheme() === "light" ? styles.lighttext : styles.darktext;
  return (
    <SafeAreaView style={[styles.container, containertheme]}>
      {!camera ? (
        <View>
          <View>
            <StatusBar backgroundColor={"#242c40"} barStyle="light-content" />
          </View>

          <View
            style={{
              height: 60,
              width: "90%",
              borderWidth: 2,
              borderColor: "#ffffff",
              borderRadius: 30,
              flexDirection: "row",
              marginTop: 70,
            }}
          >
            <Searchbar />
            <Pressable
              onPress={() => setCamera(true)}
              style={{ justifyContent: "center", marginRight: 10 }}
            >
              <Ionicons name="camera" size={35} color={"white"} />
            </Pressable>
          </View>
        </View>
      ) : (
        <CameraComponent />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  darktext: {
    color: "#000000",
  },
  lighttext: {
    color: "#ffffff",
  },

  lightContainer: {
    backgroundColor: "#d0d0c0",
  },
  darkContainer: {
    backgroundColor: "#242c40",
  },
});
