import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Asset, getAlbumsAsync, getAssetsAsync } from "expo-media-library";
import * as Animatable from 'react-native-animatable';
import { View, Text, ActivityIndicator, StyleSheet, Pressable, Image, TouchableOpacity, Dimensions, FlatList, Platform } from 'react-native';
import { useCameraPermission, useMicrophonePermission, useCameraDevice, TakePhotoOptions, VideoFile, useFrameProcessor, Frame, Camera, useCodeScanner } from 'react-native-vision-camera';
import { useFocusEffect } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/Colors';
import TextArea from '@/components/ui/TextArea';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Image as EImage } from "expo-image";
import { Face, Camera as VisionCamera, FaceDetectionOptions } from 'react-native-vision-camera-face-detector';
import * as MediaLibrary from 'expo-media-library';
import { useDispatch, useSelector } from 'react-redux';

import { Defs, Mask, Rect, Svg } from 'react-native-svg';
import { RootState } from '@/src/state/store';
import { clearCallback } from '@/src/state/slices/camera';
import { contains, pickImage, showToast } from '@/src/helpers/methods';
const { height, width } = Dimensions.get('screen');

const PREVIEW_SIZE = width > 380 ? 360 : 340;
const PREVIEW_RECT = {
  minX: (width - PREVIEW_SIZE) / 2,
  minY: 65,
  width: PREVIEW_SIZE,
  height: PREVIEW_SIZE,
};

const CameraScreen = () => {
  const { callback } = useSelector((state: RootState) => state.camera);
  const { action, data, type } = useLocalSearchParams();
  const [cameraType, setCameraType] = useState<'back' | 'front'>(type === 'scanner' ? 'back' : 'front');
  const device = useCameraDevice(cameraType, { physicalDevices: ['telephoto-camera'] });
  const { hasPermission, requestPermission } = useCameraPermission();
  const { hasPermission: microphonePermission, requestPermission: requestMicrophonePermission } = useMicrophonePermission();
  const [permissionResponse, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isActive, setIsActive] = useState(false);
  const [flash, setFlash] = useState<TakePhotoOptions['flash']>('off');
  const [fileType, setFileType] = useState<'VIDEO' | 'IMAGE'>('IMAGE');
  const [isRecording, setIsRecording] = useState(false);
  const [photo, setPhoto] = useState<string | null>('');
  const [video, setVideo] = useState<VideoFile | any>();
  const camera = useRef<Camera>(null);
  const [mode, setMode] = useState('camera');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [caption, setCaption] = useState('');
  const [currentIndexRef, setCurrentIndexRef] = useState(0);
  const dispatch = useDispatch();
  const [detections, setDetections] = useState<any[]>([
    { type: 'BLINK', instruction: 'Blink both eyes', minProbability: 0.5, completed: false },
    { type: 'BLINK_RIGHT_EYE', instruction: 'Close right eye', minProbability: 0.5, completed: false },
    { type: 'TURN_HEAD_LEFT', instruction: 'Turn head left', maxAngle: 20, completed: false },
    { type: 'TURN_HEAD_RIGHT', instruction: 'Turn head right', minAngle: -2, completed: false },
    { type: 'SMILE', instruction: 'Smile', minProbability: 0.7, completed: false },
  ]);
  const [instructions, setInstructions] = useState<{ status: boolean; text: string }>({ status: false, text: 'Position your face in the circle and then' });

  const currentDetection = useMemo(() => detections[currentIndexRef < 5 ? currentIndexRef : 4], [currentIndexRef, detections]);
  const progress = useMemo(() => currentIndexRef * 20, [currentIndexRef]);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
      };
    }, [])
  );

  useEffect(() => {
    if (!hasPermission) { requestPermission(); }
    if (!microphonePermission) { requestMicrophonePermission(); }
    if(hasPermission){
      getAlbums();
    }
  }, [hasPermission, microphonePermission]);

  const onTakePicturePressed = useCallback(async () => {
    setFileType('IMAGE');
    if (isRecording) {
      camera.current?.stopRecording();
      return;
    }
    const photo = await camera.current?.takePhoto({ flash });
    if (type === 'selfie') {
      handlePhotoCB({fileUrl:`file://${photo?.path}`,type:action,obj:data})
    } else {
      setPhoto(`file://${photo?.path}` || '');
    }
  }, [action, data, flash, isRecording, type]);

  const onStartRecording = useCallback(async () => {
    if (!camera.current) {
      return;
    }
    setIsRecording(true);
    camera.current.startRecording({
      flash: flash === 'on' ? 'on' : 'off',
      onRecordingFinished: (video) => {
        setIsRecording(false);
        setVideo(`file://${video?.path}`);
        setFileType('VIDEO');
      },
      onRecordingError: (error) => {
        console.error(error);
        setIsRecording(false);
      },
    });
  }, [flash, fileType, isRecording]);
  const uploadPhoto = useCallback(async () => {
    if (photo === '' && video === '') {
      return;
    }
    if(type === 'posts'){
      handlePhotoCB({file:fileType === 'IMAGE' ? photo : video, postType:fileType, body:caption})
    }else{
      handlePhotoCB({fileUrl:photo, field:type})
    }
    setPhoto(null);
  }, [caption, fileType, callback, photo, video, isRecording]);

  const handlePhotoCB = (data:any) => {
    if (callback) {
      callback(data);
      router.back();
    }
    dispatch(clearCallback());
  }
  const getAlbums = useCallback(async () => {
    if (permissionResponse?.status !== 'granted') {
      await requestMediaPermission();
    }
    const fetchedAlbums = await getAlbumsAsync();
    const albumAssets = await getAssetsAsync({
      album: fetchedAlbums.find((album) => album.title === "Recents"),
      mediaType: "photo",
      sortBy: "creationTime",
      first: 15,
    });
    setAssets(albumAssets.assets);
  }, [hasPermission]);

  const selectImage = useCallback(async () => {
    const assets = await pickImage(type as any);
    const response = assets?.[0]?.type;
    if(response === 'image'){
      setPhoto(assets?.[0]?.uri || '');
      setFileType('IMAGE');
    }else{
      setVideo(assets?.[0]?.uri || '');
      setFileType('VIDEO');
    }
  }, [type]);

  const handleIndex = useCallback((index: number) => {
    setCurrentIndexRef(index);
    if (index === 5) {
      onTakePicturePressed();
    }
  }, [onTakePicturePressed]);

  const faceDetectionOptions = useRef<FaceDetectionOptions>({ landmarkMode: 'all', classificationMode: 'all' }).current;

  const handleFacesDetection = useCallback((faces: Face[]) => {
    const currentDetection = detections[currentIndexRef < 5 ? currentIndexRef : 4];

    if (faces.length !== 1) {
      setCurrentIndexRef(0);
      setInstructions({ status: false, text: 'Position your face in the circle and then' });
      return;
    }
    const face = faces[0];
    const faceRect = { minX: face.bounds.x, minY: face.bounds.y, width: face.bounds.width, height: face.bounds.height };
    const edgeOffset = 65;
    const faceRectSmaller = {
      width: faceRect.width - edgeOffset,
      height: faceRect.height - edgeOffset,
      minY: faceRect.minY + edgeOffset / 2,
      minX: faceRect.minX + edgeOffset / 2,
    };
    const previewContainsFace = contains({ outside: PREVIEW_RECT, inside: faceRectSmaller });

    if (!previewContainsFace && Platform.OS === 'android') {
      setInstructions({ status: false, text: 'Position your face in the circle and then' });
      return;
    }

    const faceMaxSize = PREVIEW_SIZE - 120;

    if (faceRect.width >= faceMaxSize && faceRect.height >= faceMaxSize && Platform.OS === 'android') {
      setInstructions({ status: false, text: "You're too close. Hold the device further and then" });
      return;
    }
    const yawAngle = Platform.OS === 'ios' ? -face.yawAngle : face.yawAngle;
    if (previewContainsFace && !(faceRect.width >= faceMaxSize && faceRect.height >= faceMaxSize)) {
      if (!instructions.status) {
        setInstructions({ status: true, text: 'Keep the device still and perform the following actions:' });
      }
    }
    if (currentDetection.type === 'BLINK') {
      const leftEyeClosed = face.leftEyeOpenProbability <= (0.5);
      const rightEyeClosed = face.rightEyeOpenProbability <= (0.5);
      if (leftEyeClosed && rightEyeClosed) {
        handleIndex(1);
      }
    }
    if (currentDetection.type === 'BLINK_RIGHT_EYE') {
      const leftEyeClosed = (Platform.OS === 'android' ? face.leftEyeOpenProbability : face.rightEyeOpenProbability) <= currentDetection?.minProbability;
      const rightEyeClosed = (Platform.OS === 'android' ? face.rightEyeOpenProbability : face.leftEyeOpenProbability) <= currentDetection?.minProbability;
      if (leftEyeClosed && !rightEyeClosed) {
        handleIndex(2);
      }
    }
    if (currentDetection.type === 'TURN_HEAD_RIGHT') {
      if (yawAngle < -10) {
        handleIndex(4);
      }
    }
  
    if (currentDetection.type === 'TURN_HEAD_LEFT') {
      if (yawAngle >= 10) {
        handleIndex(3);
      }
    }
    if (currentDetection.type === 'SMILE') {
      if (face.smilingProbability > 0.5) {
        handleIndex(5);
      }
    }
  }, [currentIndexRef, detections, handleIndex, instructions.status]);

  if (!hasPermission || !microphonePermission) {
    return <ActivityIndicator />;
  }

  if (!device) {
    return <Text>Camera device not found</Text>;
  }
  const [isScanned,setIsScanned] = useState(false)
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if(hasPermission){
        if(!isScanned){
          handlePhotoCB({documentId:codes?.[0].value});
          setIsScanned(true)
        }
      }
    }
  })
  // useEffect(() => {
  //   setTimeout(() => {
  //     if(type === 'scanner'){
  //       handlePhotoCB({documentId:'1234567890'});
  //       setIsScanned(true)
  //     }
  //   }, 3000);
  // },[type])
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      {type === `scanner` && renderScannerView()}

      {type !== "scanner" &&
        <VisionCamera
          faceDetectionCallback={type === 'selfie' ? handleFacesDetection : () => { }}
          faceDetectionOptions={faceDetectionOptions}
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          enableLocation
          enableZoomGesture
          isActive={isActive && !photo && !video && mode === 'camera'}
          photo
          video
          audio
        />
      }
      {type === "scanner" &&
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          enableLocation
          enableZoomGesture
          codeScanner={codeScanner}
          isActive={isActive && !photo && !video && mode === 'camera'}
        />
      }

      {(photo || video) && (
        <View style={{backgroundColor:'#000',position:'absolute',width:'100%',height:'100%'}}>
          {photo && <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} />}
          <FontAwesome5 onPress={() => setPhoto(null)} name="arrow-left" size={25} color="white" style={{ position: 'absolute', top: 50, left: 30 }} />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.40)' }}>
            <View style={{ padding: 5, flexDirection: 'row', }}>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <TextArea attr={{ field: 'comment', value: caption, icon: { name: 'commenting-o', type: 'FontAwesome', min: 5, color: colors.green }, keyboardType: 'default', placeholder: 'Your comment...', color: '#009387', isSendInput: true, onSendClicked: () => uploadPhoto(), handleChange: (field: string, value: string) => { setCaption(value) } }} />
              </View>
              {caption?.length < 2 && <Animatable.View animation="fadeInRightBig" duration={1000} useNativeDriver={true} style={{ justifyContent: 'center', marginLeft: 6, backgroundColor: colors.green, height: 55, width: 55, alignItems: 'center', marginTop: 10, borderRadius: 10 }}><TouchableOpacity onPress={uploadPhoto} style={{ justifyContent: 'center' }}><Icon type='Feather' size={30} color={colors.white} name='upload' /></TouchableOpacity></Animatable.View>}
            </View>
          </View>
        </View>
      )}

      {!photo && !video && (
        <>
          <View style={{ position: 'absolute', zIndex: 20, right: 10, top: 50, padding: 10, borderRadius: 5, backgroundColor: 'rgba(0, 0, 0, 0.40)', gap: 30 }}>
            <TouchableOpacity onPress={() => setFlash((curValue) => (curValue === 'off' ? 'on' : 'off'))}>
              <Icon name={flash === 'off' ? 'flash-off-outline' : 'flash'} type='Ionicons' size={30} color={colors.white} />
            </TouchableOpacity>
          </View>
          {(type !== 'selfie' && type !== 'scanner') &&
            <View style={{ position: 'absolute', bottom: 50, width: '100%' }}>
              <View style={{ marginBottom: 24 }}>
                <FlatList data={assets} showsHorizontalScrollIndicator={false} horizontal contentContainerStyle={{ gap: 6 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setPhoto(item.uri)}>
                      <EImage
                        key={item.id}
                        source={item.uri}
                        style={{
                          height: 55,
                          width: 55,
                          borderRadius: 5,
                        }}
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '25%' }}>
                  <TouchableOpacity onPress={selectImage}><Icon name='photo-library' type='MaterialIcons' size={36} color={colors.white} /></TouchableOpacity>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Pressable onPress={onTakePicturePressed} onLongPress={() => {
                    if(type === 'posts'){
                      onStartRecording()
                    }else{
                      showToast('You can only upload videos to your post');
                    }
                  }} style={{ width: 75, height: 75, backgroundColor: isRecording ? 'red' : 'white', borderRadius: 75 }} />
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '25%' }}>
                  <TouchableOpacity onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}><Icon name={cameraType === 'back' ? 'camera-flip' : 'camera-flip-outline'} type='MaterialCommunityIcons' size={36} color={colors.white} /></TouchableOpacity>
                </View>
              </View>
            </View>
          }
        </>
      )}
      {type === 'selfie' &&
        <View style={{ justifyContent: 'center', position: 'absolute', width: '100%', alignItems: 'center', height: '100%', zIndex: 100 }}>
          <View style={{ height: PREVIEW_SIZE, width: PREVIEW_SIZE, borderRadius: 200, overflow: 'hidden', }}>
            <AnimatedCircularProgress size={PREVIEW_SIZE} width={5} backgroundWidth={7} fill={progress} tintColor="green" backgroundColor="#e8e8e8" />
          </View>
          <View style={{ marginTop: 30, backgroundColor: colors.white, padding: 15, borderRadius: 20, borderBottomRightRadius: 0, borderTopLeftRadius: 0 }}>
            <Text style={{ fontFamily: 'fontLight', textAlign: 'center' }}>{instructions.text}</Text>
            <Text style={{ fontFamily: 'fontBold', marginTop: 20, textAlign: 'center' }}>{currentDetection.instruction}</Text>
          </View>
        </View>
      }
    </View>
  );
};
const renderScannerView = () => {
  return(
    <View style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 10 }}>
      <View style={{position:'absolute',marginTop:248,width:'100%',alignItems:'center',zIndex:10}}>
      <Text style={{fontFamily:'fontBold',color:colors.white,fontSize:12}}>PLAYMYJAM SCANNER</Text>
      </View>
      <Svg width={'100%'} height={'100%'}>
        <Mask id="mask" x={'0'} y={'0'} height={'100%'} width={'100%'}>
          <Rect height={'100%'} width={'100%'} fill={'#fff'} />
          <Rect
            x={(Dimensions.get('window').width - 256) / 2}
            y={(Dimensions.get('window').height - 200) / 2}
            width={256}
            height={248}
            rx={16}
            ry={16}
          />
        </Mask>

        <Rect
          x={(Dimensions.get('window').width - 256) / 2} 
          y={(Dimensions.get('window').height - 200) / 2} 
          width={256}
          height={200}
          fill={'transparent'}
          rx={16}
          ry={16}
        />
        {/* This is the overlay with the hole */}
        <Rect height={'100%'} width={'100%'} fill={'rgba(0,0,0,0.7)'} mask="url(#mask)" />
      </Svg>
    </View>
  )
}
export default CameraScreen;
