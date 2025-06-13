import { Button, Pressable, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Camera, CameraType, CameraView } from "expo-camera";
import useCameraPermission from "@/hooks/useCameraPermission";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useRouter } from "expo-router";

export default function CameraComponent() {
  const { hasPermission, requestCameraPermission } = useCameraPermission();
  const cameraRef = React.createRef<CameraView | null>();
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraFocused, setCameraFocused] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (hasPermission === null) {
      requestCameraPermission(); //Ask for Permission if null
      //setCameraView(true);
    }
  }, [hasPermission]);

  if (hasPermission === null) {
    return (
      <View>
        <Text>Request Permission</Text>
      </View>
    );
  }

  // If permission is denied, show an error message
  if (hasPermission === false) {
    return (
      <View>
        <Text>Camera permission denied.</Text>
        <Button title="Request Permission" onPress={requestCameraPermission} />
      </View>
    );
  }
  const captureImage = async () => {
    if (cameraRef.current) {
      setCameraFocused(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          setCapturedPhoto(photo.uri);
          //setCameraFocused(false);
          console.log("image Captured : ", photo.uri);
        } else {
          console.log("No image captured or uri is undifined.");
        }
      } catch (error) {
        console.log("Error Capturing Image : ", error);
      }
    }
  };

  //if permission granted show the camera
  return (
    <View style={{ flex: 1, width: 400 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        animateShutter={true}
        flash="auto"
        mirror={false}
        mode={"picture"}
        active={true}
        facing={facing}
        ref={cameraRef}
      >
        <View style={{ marginLeft: 350, marginTop: 15 }}>
          <Pressable
            onPress={() => {
              router.push("/(tabs)");
            }}
          >
            <Ionicons name="close" size={40} color={"white"} />
          </Pressable>
        </View>
        <View style={{ marginTop: 670, marginLeft: 300 }}></View>
        <View style={{ alignItems: "center", marginTop: -50 }}></View>

        {/*captured image will display here */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          {capturedPhoto ? (
            <Image
              source={{ uri: capturedPhoto }}
              resizeMode="cover"
              style={{
                width: 70,
                height: 70,
                borderRadius: 50,
              }}
            />
          ) : (
            <Image
              source={require("./LAMIcon.png")}
              resizeMode="cover"
              style={{ width: 80, height: 80, borderRadius: 50 }}
            />
          )}
          <Pressable
            onPress={() => {
              captureImage();
            }}
            // style={{ marginTop: 500, marginLeft: 300 }}
          >
            <MaterialCommunityIcons
              name="circle-slice-8"
              size={80}
              color={"#ffffff"}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              setFacing((current: any) =>
                current === "back" ? "front" : "back"
              );
            }}
          >
            <MaterialIcons name="flip-camera-ios" size={50} color={"white"} />
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({});
