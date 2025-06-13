import { useState, useEffect } from "react";
import { Camera } from "expo-camera";
import { Alert } from "react-native";



export default function useCameraPermission() {
    const [hasPermission, setHasPermission] = useState(false)

//  Request CameraPermission
    const requestCameraPermission = async ()=>{
    const {status} = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted")
}

useEffect (()=>{
    const checkCameraPermission = async()=>{
        const{status} = await Camera.getCameraPermissionsAsync();
        setHasPermission (status === "granted")
    }
    checkCameraPermission();
},[])

// Handle CameraPermission Error

// const handlePermissionError = ()=>{
// if(hasPermission === false){
//     Alert.alert(
//         "Permission Denied",
//         "We need your permission to access  the camera"
//     )
// }
// }
    return (
   {hasPermission, requestCameraPermission}
  )
}