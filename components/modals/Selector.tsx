import React, { memo, useContext, useState } from 'react'
import { View, TouchableOpacity, Text, Image, Platform, ActivityIndicator } from 'react-native'
import { AntDesign, Ionicons, FontAwesome, EvilIcons} from "@expo/vector-icons";
import { useDispatch } from 'react-redux';
import { setModalState } from '@/src/state/slices/modalState';
interface SelectorProps {
    attr:{
        handleChange:(field:any,value:any) => void;
        field?:string;
        headerText?:string;
        items?:any;
    }
}
const Selector = memo((props:SelectorProps) => {
    const {items,handleChange,field} = props.attr;
    const dispatch = useDispatch();
    return (
        <View style={{padding:10}}>
            {items.map((value:string,i:number) => 
                <TouchableOpacity onPress={() => {
                    dispatch(setModalState({isVisible:false}));
                    handleChange(field,value);
                }} key={i} style={{flexDirection:'row',padding:5,borderBottomColor:'#D5E4F7',borderBottomWidth:0.7}}>
                    <Ionicons name='list' size={24} color='#5586cc' />
                    <Text style={{fontFamily:'fontLight',marginLeft:10,marginTop:5}}>{value}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
})

export default Selector