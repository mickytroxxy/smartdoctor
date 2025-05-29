import { colors } from '@/constants/Colors';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

const Loader = memo((props:{text?:string}) => {
  return(
    <View style={{backgroundColor:'rgba(0, 0, 0, 0.7)',flex:1,position:'absolute',width:'100%',height:'100%',justifyContent:'center',alignItems:'center',zIndex:10000}}>
        <ActivityIndicator color={colors.header} size={48} />
        <Text style={{fontFamily:'fontLight',color:colors.white,marginTop:24}}>{props?.text}</Text>
    </View>
  )
});

export default Loader;
