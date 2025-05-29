import React, { memo, useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { FontAwesome, Feather, AntDesign } from "@expo/vector-icons";
import TextArea from '../ui/TextArea';
import { useDispatch } from 'react-redux';

import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/Colors';
import { BusinessServicesType } from '@/constants/Types';
import useAuth from '@/src/hooks/useAuth';
import { useSecrets } from '@/src/hooks/useSecrets';
import { setModalState } from '@/src/state/slices/modalState';
import { showToast } from '@/src/helpers/methods';

interface InputProps {
    attr: {
        handleChange: (field: any, value: string | number) => void;
        field?: string;
        placeholder: string;
        hint?: string;
        isNumeric?: boolean;
        headerText: string;
        value?: any;
        multiline?: boolean;
    };
}

const Input = memo((props: InputProps) => {
    const { handleChange, multiline, field, placeholder, hint, isNumeric, headerText, value: val } = props.attr;
    const { accountInfo } = useAuth();
    const { secrets } = useSecrets();
    
    const bankDetails = [
        { type: "BANK NAME", value: "FNB" },
        { type: "ACCOUNT NUMBER", value: "62849814638" },
        { type: "ACCOUNT HOLDER", value: "EMPIRE DIGITALS" },
        { type: "REFERENCE", value: accountInfo?.clientId }
    ];
    const [businessServices,setBusinessServices] = useState<BusinessServicesType[]>([
        {type:'MASSAGE',selected:false},
        {type:'PRIVATE SESSION',selected:false},
        {type:'DINNER MATE',selected:false},
        {type:'DRINK MATE',selected:false},
        {type:'FAKE PARTNER',selected:false},
        {type:'DANCER',selected:false}
    ]);
    const dispatch = useDispatch();
    const [value, setValue] = useState<string>('');
    
    useEffect(() => {
        if (val) {
            setValue(val);
        }
    }, []);
    const filteredServices = businessServices.filter(
        (item) => !accountInfo?.services?.includes(item.type)
    );
    return (
        <View>
            <View style={{ padding: 10 }}>
                {hint && <Text style={{ fontFamily: 'fontLight' }}>{hint}</Text>}
                
                {headerText === "ENTER AMOUNT" && (
                    <View>
                        <Text style={{ fontFamily: 'fontLight', marginBottom: 10 }}>
                            You can transfer funds directly to the account below. Once completed, please send your proof of payment to thesocial@empiredigitals.org or via WhatsApp at {secrets?.WHATSAPP}.
                        </Text>
                        {bankDetails.map((item, i) => (
                            <View key={item.type + i} style={{ flexDirection: 'row', borderColor: '#f2eae9', borderBottomWidth: 0.8, paddingBottom: 5, marginBottom: 5 }}>
                                <View style={{ width: 30 }}>
                                    <AntDesign name="Safety" size={20} color="#0e75b4" />
                                </View>
                                <View style={{ justifyContent: 'center', flex: 1 }}>
                                    <Text style={{ color: '#2a2828', fontFamily: 'fontBold', fontSize: 12, paddingLeft: 15 }}>{item.type}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#2a2828', fontFamily: 'fontLight', fontSize: 11, paddingLeft: 15 }}>{item.value}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                
                <TextArea 
                    attr={{
                        field: 'value',
                        value,
                        icon: { name: 'list', type: 'MaterialIcons', min: 5, color: '#5586cc' },
                        keyboardType: isNumeric ? 'numeric' : 'default',
                        multiline,
                        placeholder,
                        color: '#009387',
                        handleChange: (field, val) => { setValue(val) }
                    }} 
                />
                {headerText === "SERVICE NAME" && 
                    <View style={{marginTop:15}}>
                        <Text style={{fontFamily:'fontBold',color:'#757575'}}>Or simply pick from the below</Text>
                        <View style={{marginTop:15,flexDirection:'row',display: 'flex',flexWrap: 'wrap'}}>
                            {businessServices?.map((item,i) => {
                                const myServices = accountInfo?.services?.filter((i:any) => i.type === item.type)
                                if(item.type !== "ANY"){
                                    if(myServices.length === 0){
                                        return(
                                            <TouchableOpacity onPress={() => {
                                                setBusinessServices(businessServices?.map(x => x.type === item.type ? {...x,selected:true} : {...x,selected:false}));
                                                setValue(item.type)
                                            }} key={item.type + i} style={{flexDirection:'row',padding:6,borderRadius:10,borderWidth:1,borderColor:item.fees ? "green" : "#757575",justifyContent:'center',alignItems:'center',margin:10}}>
                                                <Text style={{fontFamily:'fontLight',fontSize:11,marginRight:5}}>{item.type}</Text>
                                                {item.selected ? <AntDesign name='checkcircleo' color="green" size={20} /> : <AntDesign name='closecircleo' color="tomato" size={20} />}
                                            </TouchableOpacity>
                                        )
                                    }
                                }
                            })}
                        </View>
                    </View>
                }
                {headerText === "ENTER AMOUNT" && 
                    <Text style={{ fontFamily: 'fontLight', marginBottom: 10 }}>
                        You can also load your account using PayFast, a secure payment gateway. Please enter the amount above to proceed.
                    </Text>
                }
                
                
                <View style={{ alignItems: 'center', marginTop: 30 }}>

                    <LinearGradient colors={["#e44528","#63acfa","#f3bf4f"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={{padding:1.2,borderRadius:10,width:'90%'}}>  
                        <TouchableOpacity onPress={() => {
                            if (value !== "") {
                                dispatch(setModalState({ isVisible: false }));
                                handleChange(field, value);
                            } else {
                                showToast("Please carefully fill in the required information!");
                            }
                        }} style={{alignItems:'center',justifyContent:'center',backgroundColor:'#fff',borderRadius:10,display:'flex',flexDirection:'row',paddingVertical:14}}>
                            <Text style={{fontFamily:'fontBold',color : colors.green,fontSize:12,marginRight:12}}>{headerText === "ENTER AMOUNT" ? "USE PAYFAST" : "PROCEED"}</Text>
                            <FontAwesome name="check-circle" size={18} color={colors.green} />
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>
        </View>
    );
});

export default Input;