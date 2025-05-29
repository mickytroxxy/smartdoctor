import React, { memo, useContext, useState } from 'react'
import { View, TouchableOpacity, Text, Dimensions, ScrollView, Image, Modal, StyleSheet } from 'react-native'
import { MaterialIcons,FontAwesome } from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useDispatch } from 'react-redux';
import { usePhotos } from '@/src/hooks/usePhotos';
import useAuth from '@/src/hooks/useAuth';
import { setConfirmDialog } from '@/src/state/slices/ConfirmDialog';
import { showToast } from '@/src/helpers/methods';
import { colors } from '@/constants/Colors';
import Icon from '@/components/ui/Icon';


interface PhotoProps {
    
}
const {width} = Dimensions.get("screen");

const Photos: React.FC<PhotoProps> = memo((props) => {
    const {profileOwner,activeUser:activeProfile,accountInfo} = useAuth();
    const {handleOtherPhotos} = usePhotos();

    let photosArray = [...activeProfile?.photos || []];
    const [photoBrowserVisible, setPhotoBrowserVisible] = useState(false);
    return (
        <Animatable.View animation="bounceIn" duration={1000} useNativeDriver={true}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {photosArray.length > 0 && photosArray.map((item, i) => (
                    <TouchableOpacity key={i} onPress={()=>{
                        photosArray.unshift(photosArray.splice(i, 1)[0]);
                        setPhotoBrowserVisible(true)
                    }}>
                        <View style={styles.mediaImageContainer}>
                            <Animatable.Image animation="zoomInDown" duration={2000} useNativeDriver={true} source={{uri:item.url}} style={styles.image} resizeMode="cover"></Animatable.Image>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {(profileOwner && photosArray.length > 0) &&
                <LinearGradient colors={["#e44528","#d6a8e7","#f3bf4f"]}start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={[styles.mediaCount]}>
                    <TouchableOpacity onPress={()=>handleOtherPhotos('photos')}>
                        <MaterialIcons name="add-circle" size={30} color="#fff" alignSelf="center"></MaterialIcons>
                    </TouchableOpacity>
                </LinearGradient>
            }
            
            
            <Modal visible={photoBrowserVisible} transparent={true} animationType="fade">
                <ImageViewer 
                    imageUrls={photosArray.map(item => ({url:item.url}))} 
                    enableSwipeDown={true} 
                    onSwipeDown={()=>setPhotoBrowserVisible(false)}  
                    renderFooter={(index) => <PhotoFooter photoData={{setPhotoBrowserVisible,index,photosArray,profileOwner}}/>}
                    footerContainerStyle={{}}
                />
            </Modal>
            {(photosArray?.length === 0 && profileOwner) && (
                <View style={{flexDirection:'row',gap:10}}>
                    <View style={{flex:1,justifyContent:'center'}}><Text style={{fontSize:12,fontFamily:'fontBold'}}>Click the add icon to add photos</Text></View>
                    <View style={{justifyContent:'center',alignItems:'flex-end'}}>
                        <TouchableOpacity onPress={()=>handleOtherPhotos('photos')}>
                            <Icon type='MaterialIcons' name="add-circle" size={30} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Animatable.View>
    )
})

type PhotoData = {
  setPhotoBrowserVisible: (visible: boolean) => void;
  index: number;
  photosArray: any[];
  profileOwner: boolean | any;
};

type Props = {
  photoData: PhotoData;
};

const PhotoFooter: React.FC<Props> = memo((props) => {
    const { setPhotoBrowserVisible, index, photosArray, profileOwner } = props.photoData;
    const dispatch = useDispatch(); 
    const {handleChange} = usePhotos();
    return (
        <View style={{ flexDirection: 'row', padding: 15 }}>
        <TouchableOpacity
            style={{ marginLeft: !profileOwner ? width / 2 - 33 : 0 }}
            onPress={() => {
            setPhotoBrowserVisible(false);
            }}
        >
            <FontAwesome name="remove" color="#fff" size={48} />
        </TouchableOpacity>
        {profileOwner && (
            <TouchableOpacity
                style={{ marginLeft: width - 110 }}
                onPress={() => {
                    dispatch(setConfirmDialog({isVisible: true,text: `Are you sure you want to delete this photo? This cannot be undone!`,okayBtn: 'Cancel',cancelBtn: 'Delete',severity: true,response: (res:boolean) => {
                        if (!res) {
                            const photos = photosArray.filter((item, i) => i !== index);
                            handleChange('photos', photos);
                            showToast('Photo deleted');
                            setPhotoBrowserVisible(false);
                        }
                    }}));
                }}
            >
                <MaterialIcons name="delete-forever" color="tomato" size={48} />
            </TouchableOpacity>
        )}
        </View>
    );
});
const styles = StyleSheet.create({
    mediaImageContainer:{
        width: 150,
        height: 150,
        borderRadius: 5,
        overflow: "hidden",
        marginHorizontal: 2,
    },
    mediaCount: {
        position: "absolute",
        top: "50%",
        marginTop: -30,
        marginLeft: 30,
        width: 50,
        height: 50,
        backgroundColor:'teal',
        padding:10,
        borderRadius:100,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "rgba(0, 0, 0, 0.38)",
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        shadowOpacity: 1
    },
    image: {
        flex: 1,
        height: undefined,
        width: undefined,
    },
})
export default memo(Photos)