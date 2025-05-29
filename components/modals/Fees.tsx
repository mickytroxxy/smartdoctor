import React, { memo, useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import TextArea from '../ui/TextArea';
import { useDispatch } from 'react-redux';

import useAuth from '@/src/hooks/useAuth';
import { useSecrets } from '@/src/hooks/useSecrets';
import { setModalState } from '@/src/state/slices/modalState';
import { showToast } from '@/src/helpers/methods';
import { LinearButton } from '../ui/Button';
import { colors } from '@/constants/Colors';
import { router } from 'expo-router';

interface InputProps {
    attr: {
        handleChange: (field: any, value: string | number) => void;
        headerText: string;
        amount?: any;
        value?: any;
        service?: 'WhatsApp' | 'Photos' | 'Instagram' | 'TikTok';
        placeholder?: string;
    };
}

const Fees = memo((props: InputProps) => {
    const { handleChange, value:val, amount:amt, service } = props.attr;
    const { accountInfo } = useAuth();
    const { secrets } = useSecrets();

    const dispatch = useDispatch();
    const [value, setValue] = useState<string>('');
    const [amount,setAmount] = useState<string>('');
    useEffect(() => {
        if (amt) {
            setAmount(amt?.toString());
        }
        if (val) {
            setValue(val);
        }
    }, []);

    return (
        <View>
            <View style={{ padding: 10 }}>
                {service !== 'Photos' ? <Text style={{ fontFamily: 'fontLight' }}>How much would you like to be paid?</Text> : <Text style={{ fontFamily: 'fontLight' }}>Enter how much you would like to be paid when someones requests your photos. Make sure you have uploaded your photos to your profile.</Text>}
                
                <TextArea 
                    attr={{
                        field: 'amount',
                        value:amount as any,
                        icon: { name: 'money', type: 'MaterialIcons', min: 5, color: '#5586cc' },
                        keyboardType: 'numeric',
                        placeholder: 'Enter amount in ZAR',
                        color: '#009387',
                        handleChange: (field, val) => { setAmount(val as any) }
                    }} 
                />
                
                {service !== 'Photos' &&
                    <>
                        <Text style={{ fontFamily: 'fontLight',marginTop:15 }}>Link or username</Text>
                        <TextArea 
                            attr={{
                                field: 'value',
                                value:value as any,
                                icon: { name: 'list', type: 'MaterialIcons', min: 5, color: '#5586cc' },
                                keyboardType: 'default',
                                placeholder: service === 'WhatsApp' ? 'Enter your WhatsApp number' : service === 'Instagram' ? 'Enter your Instagram username' : 'Enter your TikTok username',
                                color: '#009387',
                                handleChange: (field, val) => { setValue(val) }
                            }} 
                        />
                    </>
                }

                <View style={{ alignItems: 'center', marginTop: 30 }}>
                    <LinearButton 
                        textInfo={{ text: `PROCEED`, color: colors.primary }} 
                        iconInfo = {{ name: 'dashboard', type: 'FontAwesome', color: colors.primary, size: 20 }} 
                            handleBtnClick = {() => {
                                if((parseFloat(amount) > 0 && value !== '' && service !== 'Photos') || (parseFloat(amount) > 0 && service === 'Photos')){
                                    handleChange(amount, value);
                                    dispatch(setModalState({ isVisible: false }));
                                }else{
                                    showToast('Please enter a valid amount and username');
                                }
                            }}
                    />
                </View>
            </View>
        </View>
    );
});

export default Fees;