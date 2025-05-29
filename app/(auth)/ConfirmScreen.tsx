import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';


import { FontAwesome } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import useAuth from "@/src/hooks/useAuth";
import { useSecrets } from "@/src/hooks/useSecrets";
import TextArea from "@/components/ui/TextArea";
import { colors } from "@/constants/Colors";

const ConfirmScreenComponent = () => {
    const {confirmCode,confirmationCode,setConfirmationCode} = useAuth()
    const obj: any = useLocalSearchParams();
    const {secrets} = useSecrets();
    const {accountType, email} = obj;
    
    useEffect(() => {
      if(!secrets.canSendSms){
        setTimeout(() => {
          setConfirmationCode(obj?.code || 0);
        }, 3000);
      }
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
              headerTitle: 'Confirm Code',
            }} />
            <LinearGradient colors={["#fff", "#fff", "#fff", "#f1f7fa"]} style={styles.gradientContainer}>
                <Text style={styles.text}> We have sent the confirmation code to {accountType === 'INDIVIDUAL' ? obj.phoneNumber : email}!</Text>
                <TextArea attr={{field: "search",value: confirmationCode.toString(),icon: {name: "list",type: "Ionicons",min: 5,color: "#5586cc"},keyboardType: 'number-pad',placeholder: "Enter Confirmation Code",color: "#009387",handleChange: (field, value) => setConfirmationCode(value)}}/>
                <View style={{padding:30,paddingVertical:20,marginTop:30}}>
                  <LinearGradient colors={["#e44528","#63acfa","#f3bf4f"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={{padding:1.2,borderRadius:10}}>  
                      <TouchableOpacity onPress={() => confirmCode(obj)} style={{alignItems:'center',justifyContent:'center',backgroundColor:'#fff',borderRadius:10,display:'flex',flexDirection:'row',paddingVertical:14}}>
                          <Text style={{fontFamily:'fontBold',color : colors.green,fontSize:12,marginRight:12}}>CONFIRM CODE</Text>
                          <FontAwesome name="check-circle" size={18} color={colors.green} />
                      </TouchableOpacity>
                  </LinearGradient>
                </View>
            </LinearGradient>
        </View>
    );
};

export default ConfirmScreenComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "blue",
    marginTop: 5,
    borderRadius: 10,
    elevation: 5,
  },
  gradientContainer: {
    flex: 1,
    paddingTop: 10,
    borderRadius: 10,
    alignContent: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    fontFamily: "fontLight",
    marginBottom: 15,
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 15,
  },
  searchInputContainer: {
    height: 40,
    borderRadius: 10,
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: "#a8a6a5",
  },
  myBubble: {
    backgroundColor: "#7ab6e6",
    padding: 5,
    minWidth: 100,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
