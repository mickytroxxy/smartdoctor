import { colors } from "@/constants/Colors";
import { currencyFormatter, showToast } from "@/src/helpers/methods";
import useAuth from "@/src/hooks/useAuth";
import {Text, TouchableOpacity, View, Linking } from "react-native";
import { router } from "expo-router";
import Icon from "@/components/ui/Icon";
import { useDispatch } from "react-redux";
import { setConfirmDialog } from "@/src/state/slices/ConfirmDialog";
import { updateData } from "@/src/helpers/api";
import useDoctor from "@/src/hooks/useDoctor";

export default function Stats() {
    const {accountInfo,activeUser,profileOwner} = useAuth();
    const dispatch = useDispatch();
    const {handleChatWithDoctor} = useDoctor(activeUser?.userId || '');
    return (
        <View style={{flexDirection:'row',borderBottomWidth:0.8,borderBottomColor:colors.faintGray,paddingBottom:12}}>
            <View style={{flex:1,alignItems:'flex-start',justifyContent:'center'}}>
                <TouchableOpacity onPress={() => {
                    router.push('/appointments')
                }} style={{alignItems:'center',justifyContent:'center',gap:3}}>
                    <Icon name="calendar" color={colors.primary} type="Ionicons" size={24}/>
                    <Text style={{fontFamily:'fontBold',fontSize:12}}>Appointments</Text>
                </TouchableOpacity>
            </View>
            <View style={{flex:1,justifyContent:'center',alignItems:'center',borderLeftWidth:0.8,borderLeftColor:colors.faintGray,borderRightWidth:0.8,borderRightColor:colors.faintGray}}>
                {profileOwner && <TouchableOpacity
                    style={{alignItems:'center',justifyContent:'center',gap:3}}
                    onPress={() => router.push('/transaction')}
                >
                    <Text style={{fontFamily:'fontLight',fontSize:12}}>Balance</Text>
                    <Text style={{fontFamily:'fontBold',fontSize:12}}>{currencyFormatter(accountInfo?.balance || 0)}</Text>
                </TouchableOpacity>}

                {!profileOwner &&
                    <TouchableOpacity
                        style={{alignItems:'center',justifyContent:'center',gap:3}}
                        onPress={() => handleChatWithDoctor(activeUser as any)}
                    >
                        <Icon name="chat" color={colors.orange} type="MaterialCommunityIcons" size={24}/>
                        <Text style={{fontFamily:'fontBold',fontSize:12}}>Chat</Text>
                    </TouchableOpacity>
                }
            </View>
            <View style={{flex:1,alignItems:'flex-end',justifyContent:'center'}}>
                <TouchableOpacity onPress={() => {
                    router.push('/prescriptions')
                }} style={{alignItems:'center',justifyContent:'center',gap:3}}>
                    <Icon name="medical" color={colors.green} type="Ionicons" size={24}/>
                    <Text style={{fontFamily:'fontBold',fontSize:12}}>Prescriptions</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}