import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { LinearButton } from '../ui/Button';
import { colors } from '@/constants/Colors';
import TextArea from '../ui/TextArea';
import { useDispatch } from 'react-redux';
import { setModalState } from '@/src/state/slices/modalState';
import { showToast } from '@/src/helpers/methods';
import Icon from '@/components/ui/Icon';

interface TopUpProps {
    attr:{
        handleChange:(value:string,type:string) => void
    }
}

export default function TopUp({ attr:{handleChange} }: TopUpProps) {
    const dispatch = useDispatch();
    const [value, setValue] = useState('');
    const [useToken, setUseToken] = useState(false);

    const handleTopUp = async () => {
        if(value.length > 0){
            handleChange(value, useToken ? 'token' : 'amount');
            dispatch(setModalState({ isVisible: false }));
        }else{
            showToast(useToken ? 'Please enter your token code' : 'Please enter the amount you want to add to your balance');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Top Up Balance</Text>
            <Text style={styles.subtitle}>{useToken ? 'Enter your token code' : 'Enter the amount you want to add to your balance'}</Text>

            <TextArea
                attr={{
                    field: 'token',
                    value: value,
                    icon: { name: `${useToken ? 'key' : 'plus-circle'}`, type: 'Feather', color: colors.orange },
                    keyboardType: 'default',
                    placeholder: `${useToken ? 'Enter token code' : 'Enter amount in ZAR'}`,
                    color: colors.primary,
                    handleChange: (field, value) => setValue(value)
                }}
            />

            <View style={styles.buttonContainer}>
                <LinearButton
                    textInfo={{ text: 'CANCEL', color: colors.primary }}
                    iconInfo={{ name: 'x', type: 'Feather', color: colors.white, size: 20 }}
                    handleBtnClick={() => dispatch(setModalState({ isVisible: false }))}
                    style={styles.cancelButton}
                />
                <LinearButton
                    textInfo={{ text: 'TOP UP', color: colors.primary }}
                    iconInfo={{ name: 'check', type: 'Feather', color: colors.white, size: 20 }}
                    handleBtnClick={handleTopUp}
                    style={styles.topUpButton}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: 'fontBold',
        color: colors.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'fontLight',
        color: colors.grey,
        marginBottom: 20,
        textAlign: 'center',
    },
    paymentMethodContainer: {
        marginBottom: 20,
    },
    paymentMethodLabel: {
        fontSize: 14,
        fontFamily: 'fontBold',
        color: colors.primary,
        marginBottom: 10,
    },
    paymentMethodOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    paymentOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        backgroundColor: colors.faintGray,
        gap: 8,
    },
    selectedOption: {
        backgroundColor: colors.primary,
    },
    paymentOptionText: {
        fontSize: 14,
        fontFamily: 'fontBold',
        color: colors.grey,
    },
    selectedText: {
        color: colors.white,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: colors.faintGray,
    },
    topUpButton: {
        flex: 1,
        marginLeft: 10,
    },
}); 