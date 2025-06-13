import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  useColorScheme,
  StyleSheet,
  FlatList,
} from "react-native";
import React from "react";
import { useState, useRef, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import data from "../search/lam1-434507-582e9ce43bf3.json";

export default function search() {
  const textinpurRef = useRef<TextInput | null>(null);
  const [focused, setfocused] = useState(false);
  const [searchtext, setsearchtext] = useState("");
  const [apiData, setApiData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [transcription, setTranscription] = useState<string>("");
  // const jsonData = JSON.stringify(data);

  const API_KEY = "xyz";
  //const apiUrl = `https://api.gladia.io/audio/text/audio-transcription/'?key=${API_KEY}`;

  const containertheme =
    useColorScheme() === "dark" ? styles.lightContainer : styles.darkContainer;

  const texttheme =
    useColorScheme() === "light" ? styles.lighttext : styles.darktext;

  useEffect(() => {
    getApiData("https://jsonplaceholder.typicode.com/photos");
    //console.log("spechtotext data:", jsonData);
  }, []);
  //search function
  const getApiData = async (url: any) => {
    try {
      //  console.log("API loaded");

      const response = await fetch(url);
      const data = await response.json();
      // console.log(data);
      setApiData(data);
      setFilteredData(data);
    } catch (e) {
      console.log(e);
    }
  };
  const searchFilterFunc = (searchtext: any) => {
    setsearchtext(searchtext);
    if (searchtext) {
      const newData = apiData.filter((item: any) => {
        const itemData = `${item.id}${item.title}`.toUpperCase();
        const textData = searchtext.toUpperCase();
        return itemData.includes(textData);
      });
      setFilteredData(newData);
      //  console.log(newData);
    } else {
      setFilteredData([]);
    }
  };

  //microphone function
  const startRecording = async () => {
    // if (recording) {
    //   console.log("Recording already in progress...");
    //   return;
    // }

    try {
      if (!permissionResponse || permissionResponse.status !== "granted") {
        console.log("Request Permission...");
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      // console.log("starting Recording...");
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);

      console.log("Recording Started");
      setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (err) {
      console.log("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    //console.log("stop Recording");

    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(undefined);
      console.log("Recording stoped and stored at ", uri);
      if (uri) {
        const response = await fetch(uri);
        const blob = await response.blob();
        console.log("Fetched blob from URI:", blob);
        await sendToGoogleSpeechAPI(blob);
      }
      // console.log("Recording stoped, stored at:", uri);

      // setRecording(undefined);
      // await Voice.stop();
    } catch (err) {
      console.log("Failed to stop recording", err);
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
  };

  const sendToGoogleSpeechAPI = async (audioFile: Blob) => {
    try {
      // const base64Audio = await blobToBase64(audioFile);
      // const cleanBase64Audio = base64Audio.replace(
      //   /^data:audio\/(wav|mpeg);base64,/,
      //   ""
      // );
      // console.log("Base64 Audio Content : ", cleanBase64Audio);

      // const requestBody = {
      //   config: {
      //     encoding: "LINEAR16",
      //     sampleRateHertz: 16000,
      //     languageCode: "en-US",
      //   },
      //   audio: {
      //     content: cleanBase64Audio,
      //   },
      // };
      const formData = new FormData();
      formData.append("audio", audioFile, "recording.m4a");

      // Gladia expects additional config in multipart format
      formData.append("model", "large"); // This may vary based on your model requirements
      formData.append("language", "en"); // Adjust based on language support

      const response = await fetch(
        "https://api.gladia.io/audio/text/audio-transcription/",
        {
          method: "POST",
          headers: {
            // Authorization: `Bearer ${API_KEY}`,
            "x-gladia-key": API_KEY,
            //  "content-Type": "multipart/form-data",
            // "Content-Type": "application/json",
          },
          body: formData,
          // body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text(); //Fetch Error
        throw new Error(
          `HTTP error! status:${response.status}, details: ${errorMessage}`
        );
      }

      const result = await response.json();
      console.log("Api response:", result);
      if (result && result.results && result.results.length > 0) {
        const transcript = result.results[0].alternatives[0].transcript;
        setTranscription(transcript);
      } else {
        console.log("No transcription result found.");
      }
    } catch (err) {
      console.log("Failed to transcript audio", err);
    }
  };
  // helper function to conver a blob to Base64 string
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string); //convert blob to Base64
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  const micfunc = async () => {
    if (recording) {
      console.log("Stopping recording...");
      await stopRecording(); // Stop recording if it's in progress
    } else {
      console.log("Starting recording...");
      await startRecording(); // Start a new recording
    }
  };

  return (
    <View>
      <View
        style={{
          height: 59,

          flexDirection: "row",

          alignItems: "center",
        }}
      >
        <Image
          source={require("../search/LAMIcon.png")}
          style={{
            height: 30,
            width: 30,
            borderRadius: 5,
            resizeMode: "cover",
            marginLeft: 20,
          }}
        />

        <TextInput
          placeholder="Search here"
          placeholderTextColor={"gray"}
          value={searchtext}
          onFocus={() => {
            setfocused(false);
          }}
          onBlur={() => {
            setfocused(true);
          }}
          onChangeText={searchFilterFunc}
          style={[{ marginLeft: 15, width: "70%", fontSize: 16 }, texttheme]}
        />
        {searchtext !== "" ? (
          <View>
            <Pressable
              onPress={() => {
                textinpurRef.current?.clear();
                setsearchtext("");
                // setApiData([]);
                setFilteredData([]);
              }}
            >
              <Ionicons name="close" size={35} color="#ffffff" />
            </Pressable>
          </View>
        ) : (
          <View style={{}}>
            <Pressable
              // onPressIn={() => {
              //   startRecording();
              // }}
              // onPressOut={() => {
              //   stopRecording();
              // }}
              onPress={micfunc}
            >
              <FontAwesome
                name="microphone"
                size={35}
                color={recording ? "gray" : "#ffffff"}
              />
            </Pressable>
          </View>
        )}
      </View>
      <TextInput
        value={transcription}
        onChangeText={setTranscription}
        placeholderTextColor={"gray"}
        placeholder="Recorded voice will diplay here"
        style={{
          height: 60,
          color: "#fffff",
          borderWidth: 1,
          borderColor: "#ffff",
          marginTop: 20,
          marginLeft: 30,
        }}
      />
      {searchtext !== "" && (
        <View style={{ marginTop: 130, height: 700, position: "absolute" }}>
          <FlatList
            data={filteredData}
            keyExtractor={(item: any) => item.id.toString()}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }: { item: any }) => (
              <View
                style={{
                  flexDirection: "row",
                  margin: 20,
                  marginBottom: 25,
                  flexWrap: "wrap",
                }}
              >
                <Text
                  style={[
                    {
                      fontSize: 16,

                      fontWeight: "bold",
                    },
                    texttheme,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
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
  captureButton: { marginTop: 200, marginLeft: 200 },
});
