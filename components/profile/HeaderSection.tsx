import { colors } from "@/constants/Colors";
import useAuth from "@/src/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import Icon from "../ui/Icon";
import { showToast } from "@/src/helpers/methods";
import { useCameraPermission, useMicrophonePermission } from "react-native-vision-camera";
import { useCallback } from "react";
import { usePhotos } from "@/src/hooks/usePhotos";
const {width} = Dimensions.get("screen");
export default function HeaderSection() {
    const {activeUser, profileOwner} = useAuth();
    const avatar = activeUser?.avatar
    const fname = activeUser?.fname;
    const isVerified = true;
    const {handleOtherPhotos} = usePhotos();
    const { hasPermission, requestPermission } = useCameraPermission();
    const { hasPermission: microphonePermission, requestPermission: requestMicrophonePermission } = useMicrophonePermission();

    const navigate = () => {
        if(hasPermission){
        handleOtherPhotos('avatar');
        }
    }
    const handleCameraNav = useCallback(async () => {
        if(hasPermission){
        navigate();
        }else{
        await requestPermission();
        if (!microphonePermission) {await requestMicrophonePermission(); }
        navigate()
        }
    },[hasPermission,microphonePermission]);
    return (
        <LinearGradient
            colors={[colors.primary, '#3a3a6a', '#222240']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.6 }}
            style={{flex:1}}
        >
            <Animatable.Image animation="slideInDown" duration={1500} useNativeDriver={true} source={{uri : avatar !== "" ? avatar : 'https://picsum.photos/400/400'}} style={{width: width,minHeight: width}} resizeMode="stretch"></Animatable.Image>
            
            <View style={{position:'absolute',bottom:60,flexDirection:'row'}}>
                <View style={styles.usernameView}><Text style={{color:'#fff',fontSize:12,fontFamily:'fontBold'}}>{fname}</Text></View>
                    <View style={{marginLeft:30}}>
                        {profileOwner ? (
                            <TouchableOpacity onPress={() =>handleCameraNav()} style={{backgroundColor:colors.green,padding:5,borderRadius:100,height:48,width:48,alignItems:'center',justifyContent:'center'}}>
                                <Icon type='AntDesign' name="camerao" size={30} color={colors.white} />
                            </TouchableOpacity>
                        ):(
                            <View>
                                <TouchableOpacity onPress={()=>{
                                    if(isVerified){
                                        showToast(fname +" has been verified!")
                                    }else{
                                        showToast(fname +" is not verified yet!")
                                    }
                                }}>
                                    {isVerified ? (
                                        <Icon type='Ionicons' name="shield-checkmark" size={44} color="green" />
                                    ):(
                                        <Icon type='Feather' name="shield-off" size={44} color="tomato" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            
                        )}
                </View>
            </View>
        </LinearGradient>
    );
}   

export const styles = StyleSheet.create({
    usernameView:{
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      height: 50, 
      alignContent:"center", 
      alignItems:"center",
      borderTopRightRadius:50,
      borderBottomRightRadius:700,
      justifyContent:'center',
      marginLeft:5,
      borderTopLeftRadius:700,
      flex:1
    },  
  });