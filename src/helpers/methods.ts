import { Alert, Dimensions, Linking, Platform, Text, ToastAndroid } from "react-native";

import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-root-toast';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { updateData } from "./api";
import * as Device from 'expo-device';
import axios from "axios";
import { LocalTrack } from "@/constants/Types";
import { Song } from "../state/slices/musicPlayer";
export {Notifications}
Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
});
export const showToast = (message: string): void => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    let toast = Toast.show(message, {
      duration: Toast.durations.LONG,
    });
  }
};
export const getHeight = () => {
  const { height } = Dimensions.get('screen');
  if(height < 740){
    return 525
  }else{
    if(Platform.OS === 'android'){
      return 400
    }else{
      return 600
    }
  }
}
export const sendSms = (phoneNo: string, msg: string,auth:string): void => {
  const request = new XMLHttpRequest();
  request.open('POST', 'https://rest.clicksend.com/v3/sms/send');
  request.setRequestHeader('Content-Type', 'application/json');
  request.setRequestHeader('Authorization', 'Basic '+auth);
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      showToast(`Message sent to ${phoneNo}`);
    }
  };

  const body = {
    'messages': [
      {
        'source': 'javascript',
        'from': "uberFlirt",
        'body': msg,
        'to': phoneNo,
        'schedule': '',
        'custom_string': ''
      }
    ]
  };

  request.send(JSON.stringify(body));
};
export const timeAgo = (timestamp: number): string => {
  const now = Date.now();
  const secondsPast = (now - timestamp) / 1000;

  if (secondsPast < 60) {
    return `${Math.floor(secondsPast)} seconds ago`;
  }
  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)} minutes ago`;
  }
  if (secondsPast < 86400) {
    return `${Math.floor(secondsPast / 3600)} hours ago`;
  }
  if (secondsPast < 2592000) { // Less than 30 days
    return `${Math.floor(secondsPast / 86400)} days ago`;
  }
  if (secondsPast < 31536000) { // Less than 1 year
    return `${Math.floor(secondsPast / 2592000)} months ago`;
  }
  return `${Math.floor(secondsPast / 31536000)} years ago`;
}
export const calculateDurationInHHMM = (startTimestamp: string): string => {
  if(startTimestamp){
    const startTime = new Date(startTimestamp);
    const currentTime = new Date();

    const durationInMilliseconds = currentTime.getTime() - startTime.getTime();

    const minutes = Math.floor((durationInMilliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((durationInMilliseconds / (1000 * 60 * 60)) % 24);

    // Add leading zeros if necessary
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}.${formattedMinutes}`;
  }else{
    return '00.00'
  }
};
export const phoneNoValidation = (phone: string, countryCode: string): string | false => {
  countryCode = countryCode.slice(1, countryCode.length);
  let phoneNumber = phone.replace(/ /g, '');

  if (phoneNumber.length < 16 && phoneNumber.length > 7) {
    if (phoneNumber[0] === "0" && phoneNumber[1] !== "0") {
      phoneNumber = phoneNumber.slice(1);
    } else if (phoneNumber[0] !== '0') {
      phoneNumber = phoneNumber;
    }

    if (countryCode !== "") {
      if (countryCode[0] === "+") {
        countryCode = countryCode.slice(1);
      } else {
        if (countryCode[0] === "0" && countryCode[1] === "0") {
          countryCode = countryCode.slice(2);
        }
      }
      return countryCode + phoneNumber;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const nativeLink = (type: string, obj: { lat?: number; lng?: number; label?: string; phoneNumber?: string; email?: string }): void => {
    if (type === 'map') {
      const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${obj.lat},${obj.lng}`;
      const label = obj.label;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      }) as string; // Type assertion here
      Linking.openURL(url);
    } else if (type === 'call') {
      let phoneNumber = obj.phoneNumber;
      if (Platform.OS !== 'android') {
        phoneNumber = `telprompt:${obj.phoneNumber}`;
      } else {
        phoneNumber = `tel:${obj.phoneNumber}`;
      }
      Linking.canOpenURL(phoneNumber)
        .then((supported) => {
          if (!supported) {
            Alert.alert('Phone number is not available');
          } else {
            return Linking.openURL(phoneNumber || '');
          }
        })
        .catch((err) => console.log(err));
    } else if (type === 'email') {
      Linking.openURL(`mailto:${obj.email}`);
    }else if (type === 'whatsapp') {
      const url = `whatsapp://send?phone=${obj.phoneNumber}&text=${encodeURIComponent('Hello there I need help')}`;
      Linking.openURL(url);
    }
};
export const sendPushNotification = async (to: string | null | undefined, title: string, body: string, data: {route:string,user:any}): Promise<void> => {
  if (to) {
    const message = {to,sound: 'default',title,body,data,priority: 'high'};
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send?useFcmV1:true', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      //console.log(JSON.stringify(response?._bodyBlob?._data))
    } catch (error) {
      console.log(error, 'error guys')
    }
  }
};

export const getDistance = (lat1: number, lon1: number, lat2: number | any, lon2: number | any): number => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const radLat1 = toRad(lat1);
    const radLat2 = toRad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
};

const toRad = (value: number): number => {
    return value * Math.PI / 180;
};
export const takePicture = async (type:string) => {
  try {
      // const permissionRes = await ImagePicker.requestCameraPermissionsAsync();
      // const { granted } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY)
      // if(granted || permissionRes.granted){
      //     let result = await ImagePicker.launchCameraAsync({
      //         allowsEditing: true,
      //         base64:false,
      //         aspect: type === "avatar" ? [1, 1] : undefined,
      //         quality: 0.5,
      //     });
      //     if (!result.canceled) {
      //       return result.assets
      //     }
      // }
  } catch (error) {
      alert(JSON.stringify(error))
  }
}
export const currencyFormatter = (amount:any) => `ZAR ${parseFloat(amount).toFixed(2)}`

// Format date from timestamp to readable format
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
export const pickImage = async (type:string) => {
  try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if(permissionResult.granted){
          let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: (type === 'posts' ? ImagePicker.MediaTypeOptions.All : ImagePicker.MediaTypeOptions.Images),
              allowsEditing: true,
              base64:false,
              aspect: type === "avatar" ? [1, 1] : undefined,
              quality: 1,
          });
          if (!result.canceled) {
            return result.assets
          }
      }
  } catch (error) {
    showToast('Something went wrong')
  }
};

export const registerForPushNotificationsAsync = async(clientId:any)=> {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
    await Notifications.getExpoPushTokenAsync().then((res) => {
      const notificationToken = res.data;
      if(clientId){
        console.log('Found it ',notificationToken)
        updateData("users",clientId,{value:notificationToken,field:'notificationToken'})
      }
    })
  }
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}
export const PREVIEW_SIZE = 300;
const { height, width } = Dimensions.get('screen');
export const PREVIEW_RECT = {
  minX: (width - PREVIEW_SIZE) / 2,
  minY: 50,
  width: PREVIEW_SIZE,
  height: PREVIEW_SIZE,
};

export const detectFaces = (result: any,detections:any[],currentIndexRef:any, instructions:any, setInstructions:any, handleIndex:any) => {
  const currentDetection = detections[currentIndexRef.current < 5 ? currentIndexRef.current : 4];
  if (result.faces.length !== 1) {
    currentIndexRef.current = 0;
    setInstructions({ status: false, text: 'Position your face in the circle and then' })
    return;
  }

  const face = result.faces[0];
  const faceRect = {
    minX: face.bounds.origin.x,
    minY: face.bounds.origin.y,
    width: face.bounds.size.width,
    height: face.bounds.size.height,
  };
  const edgeOffset = 50;
  const faceRectSmaller = {
    width: faceRect.width - edgeOffset,
    height: faceRect.height - edgeOffset,
    minY: faceRect.minY + edgeOffset / 2,
    minX: faceRect.minX + edgeOffset / 2,
  };
  const previewContainsFace = contains({ outside: PREVIEW_RECT, inside: faceRectSmaller });

  if (!previewContainsFace) {
    setInstructions({ status: false, text: 'Position your face in the circle and then' })
    return;
  }

  const faceMaxSize = PREVIEW_SIZE - 90;

  if (faceRect.width >= faceMaxSize && faceRect.height >= faceMaxSize) {
    setInstructions({ status: false, text: "You're too close. Hold the device further and then" })
    return;
  }

  if (previewContainsFace && !(faceRect.width >= faceMaxSize && faceRect.height >= faceMaxSize)) {
    if (!instructions.status) {
      setInstructions({ status: true, text: 'Keep the device still and perform the following actions:' });
    }
  }


  if (currentDetection.type === 'BLINK') {
    const leftEyeClosed = face.leftEyeOpenProbability <= currentDetection.minProbability;
    const rightEyeClosed = face.rightEyeOpenProbability <= currentDetection.minProbability;
    if (leftEyeClosed && rightEyeClosed) {
      handleIndex(1);
    }
  }
  if (currentDetection.type === 'BLINK_RIGHT_EYE') {
    console.log(face.leftEyeOpenProbability , currentDetection.minProbability)
    const leftEyeClosed = face.leftEyeOpenProbability <= currentDetection.minProbability;
    const rightEyeClosed = face.rightEyeOpenProbability <= currentDetection.minProbability;
    if (leftEyeClosed && !rightEyeClosed) {
      handleIndex(2);
    }
  }

  if (currentDetection.type === 'TURN_HEAD_RIGHT') {
    if (face.yawAngle < 60) {
      handleIndex(4);
    }
  }

  if (currentDetection.type === 'TURN_HEAD_LEFT') {
    if (face.yawAngle >= 150) {
      handleIndex(3);
    }
  }

  if (currentDetection.type === 'SMILE') {
    if (face.smilingProbability > 0.5) {
      handleIndex(5);
    }
  }
};
export function contains({ outside, inside }: { outside: any; inside: any }): boolean {
  const outsideMaxX = outside.minX + outside.width;
  const insideMaxX = inside.minX + inside.width;

  const outsideMaxY = outside.minY + outside.height;
  const insideMaxY = inside.minY + inside.height;

  if (inside.minX < outside.minX) {
    return false;
  }
  if (insideMaxX > outsideMaxX) {
    return false;
  }
  if (inside.minY < outside.minY) {
    return false;
  }
  if (insideMaxY > outsideMaxY) {
    return false;
  }

  return true;
}
export const convertToMusicListFormat = (tracks: LocalTrack[]): Song[] => {
    return tracks.map(track => ({
      id: track.id || Math.random().toString(36).substring(2, 15),
      title: track.title,
      artist: track.artist,
      albumArt: track.albumArt || 'https://i.imgur.com/JscER15.png',
      url: track.localUri || '',
      duration: track.duration || 0,
      active: true,
      isLocal: true,
      uploadProgress: track.uploadProgress,
      uploadStatus: track.uploadStatus
    }));
};