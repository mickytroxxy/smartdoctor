import { colors } from "@/constants/Colors";
import {StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Icon from "../ui/Icon";
import Stats from "./components/Stats";
import useAuth from "@/src/hooks/useAuth";
import { AddressButton } from "../ui/Button";
import Photos from "./components/Photos";
import { useState } from "react";
import { LocationType } from "@/constants/Types";
import { ProfileBtn } from "./components/ProfileBtn";
import { usePhotos } from "@/src/hooks/usePhotos";
import RegisterDocScreen from "./components/Register";
import { DoctorProfile } from "./components/DoctorProfile";
import useMedicalHistory from "@/src/hooks/useMedicalHistory";
import { useRouter } from "expo-router";

export default function BodySection() {
    const {handleChange} = usePhotos();
    const {accountInfo, profileOwner, activeUser} = useAuth();
    const [showEditAddress, setShowEditAddress] = useState(false);
    const [showDoctorDialog, setShowDoctorDialog] = useState(false);
    const { isHistoryComplete } = useMedicalHistory();
    const router = useRouter();
    
    return (
        <View style={{flex:1,paddingBottom:30}}>
            <View style={styles.ProfileFooterHeader}>
                <View style={{alignContent:'center',alignItems:'center'}}>
                    <Icon type="FontAwesome" name="ellipsis-h" color="#757575" size={36}/>
                </View>
            </View>

            <Stats/>

            {/* Medical History Button - Only for profile owner and non-AI users */}
            {(profileOwner && !activeUser?.isAI) && (
                <View style={{marginTop:12,gap:12}}>
                    <ProfileBtn
                        headerText="Medical History"
                        subText={isHistoryComplete ? "View and update your medical information" : "Complete your medical history for better care"}
                        onPress={() => router.push('/medical-history')}
                    />
                </View>
            )}
            <View style={{marginTop:12,gap:12}}><Photos/></View>
            {!activeUser?.isAI &&
                <View style={{marginTop:12,gap:12,flexDirection:'row'}}>
                    <View style={{justifyContent:'center'}}><Icon name='location-outline' type="Ionicons" color={colors.green} size={24} /></View>
                    <View style={{justifyContent:'center',flex:1}}><Text style={{fontFamily:'fontLight',color:colors.tertiary,fontSize:12}}>{activeUser?.address?.text || `No address, if you are the owner of this account, please update your address`}</Text></View>
                    {profileOwner && <View style={{justifyContent:'center'}}><TouchableOpacity onPress={() => setShowEditAddress(!showEditAddress)}><Icon name='edit' type="MaterialIcons" color={colors.green} size={24} /></TouchableOpacity></View>}
                </View>
            }
            {showEditAddress &&
                <AddressButton handleBtnClick={(address:LocationType) => handleChange('address',address)} />
            }
            {(profileOwner && !accountInfo?.isDoctor) &&
                <View style={{marginTop:12,gap:12}}>
                    <Text style={{fontFamily:'fontBold',color:colors.tertiary,fontSize:12}}>For Healthcare Professionals</Text>
                    <ProfileBtn headerText="Join as a Doctor" subText="Register your practice and connect with patients" onPress={() => setShowDoctorDialog(true)} />
                </View>
            }
            <RegisterDocScreen showDoctorDialog={showDoctorDialog} setShowDoctorDialog={(v) => setShowDoctorDialog(v)} />
            {(activeUser?.isDoctor && !profileOwner) && <DoctorProfile />}
        </View>
    );
}

const styles = StyleSheet.create({
    ProfileFooterHeader:{
        shadowOffset: {
            width: 0,
            height: 2,
        },
        marginTop:-15
    },
    // Tab navigation styles
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.faintGray,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontFamily: 'fontLight',
        fontSize: 14,
        color: colors.grey,
        marginLeft: 5,
    },
    activeTabText: {
        fontFamily: 'fontBold',
        color: colors.primary,
    },
    // Original styles
    clubSection: {
        marginTop: 20,
    },
    clubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    clubTitle: {
        fontFamily: 'fontBold',
        fontSize: 12,
        color: colors.primary,
    },
    addClubButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.green,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 5,
        gap: 5,
    },
    addClubText: {
        color: colors.white,
        fontFamily: 'fontBold',
        fontSize: 12,
    },
    clubList: {
        maxHeight: 300,
    },
    clubCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: colors.green,
    },
    clubImage: {
        width: 110,
        height: 110,
    },
    clubInfo: {
        flex: 1,
        padding: 12,
    },
    clubName: {
        fontFamily: 'fontBold',
        fontSize: 12,
        color: colors.primary,
        marginBottom: 4,
    },
    clubLocation: {
        fontFamily: 'fontLight',
        fontSize: 12,
        color: colors.grey,
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontFamily: 'fontBold',
        fontSize: 12,
        color: colors.orange,
    },
});