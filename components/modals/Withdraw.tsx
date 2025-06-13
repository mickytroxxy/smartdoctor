import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearButton } from '../ui/Button';
import { colors } from '@/constants/Colors';
import TextArea from '../ui/TextArea';
import { useDispatch } from 'react-redux';
import { setModalState } from '@/src/state/slices/modalState';
import { showToast } from '@/src/helpers/methods';
import { Dropdown } from '../ui/Dropdown';

interface WithdrawProps {
    attr: {
        handleChange: (amount: string, bank: string, accountType: string, accountNumber: string, accountHolder: string) => void;
    };
}

const banks = [
    { id: 'absa', label: 'ABSA', selected: false },
    { id: 'fnb', label: 'First National Bank', selected: false },
    { id: 'nedbank', label: 'Nedbank', selected: false },
    { id: 'standard', label: 'Standard Bank', selected: false },
    { id: 'capitec', label: 'Capitec', selected: false }
];

const accountTypes = [
    { id: 'cheque', label: 'Cheque Account', selected: false },
    { id: 'savings', label: 'Savings Account', selected: false },
    { id: 'transmission', label: 'Transmission Account', selected: false }
];

export default function Withdraw({ attr }: WithdrawProps) {
    const dispatch = useDispatch();
    const [amount, setAmount] = useState('');
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [selectedAccountType, setSelectedAccountType] = useState<any>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    const handleWithdraw = () => {
        if (!amount) {
            showToast('Please enter amount');
            return;
        }

        if (!selectedBank) {
            showToast('Please select a bank');
            return;
        }

        if (!selectedAccountType) {
            showToast('Please select an account type');
            return;
        }

        if (!accountNumber) {
            showToast('Please enter your account number');
            return;
        }

        if (!accountHolder) {
            showToast('Please enter account holder name');
            return;
        }

        attr.handleChange(
            amount,
            selectedBank.label,
            selectedAccountType.label,
            accountNumber,
            accountHolder
        );
        dispatch(setModalState({ isVisible: false }));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Withdraw Funds</Text>
            <Text style={styles.subtitle}>Enter your withdrawal details</Text>
            
            <TextArea
                attr={{
                    field: 'amount',
                    value: amount,
                    icon: { name: 'money', type: 'FontAwesome', color: colors.orange },
                    keyboardType: 'numeric',
                    placeholder: 'Enter amount in ZAR',
                    color: colors.primary,
                    handleChange: (field, value) => setAmount(value)
                }}
            />

            <View style={{marginTop:12}}>
            <Dropdown
                onChange={(item) => setSelectedBank(item)}
                itemList={banks}
                placeholder="Select Bank"
            />
            </View>

            <View style={{marginVertical:12,zIndex:-2}}>
                <Dropdown
                    onChange={(item) => setSelectedAccountType(item)}
                    itemList={accountTypes}
                    placeholder="Select Account Type"
                />
            </View>

            <View style={{zIndex:-3}}>
                <TextArea
                    attr={{
                        field: 'accountNumber',
                        value: accountNumber,
                        icon: { name: 'credit-card', type: 'FontAwesome', color: colors.orange },
                        keyboardType: 'numeric',
                        placeholder: 'Enter account number',
                        color: colors.primary,
                        handleChange: (field, value) => setAccountNumber(value)
                    }}
                />

                <TextArea
                    attr={{
                        field: 'accountHolder',
                        value: accountHolder,
                        icon: { name: 'user', type: 'FontAwesome', color: colors.orange },
                        keyboardType: 'default',
                        placeholder: 'Enter account holder name',
                        color: colors.primary,
                        handleChange: (field, value) => setAccountHolder(value)
                    }}
                />

                <View style={styles.buttonContainer}>
                    <LinearButton
                        textInfo={{ text: 'CANCEL', color: colors.primary }}
                        iconInfo={{ name: 'x', type: 'Feather', color: colors.primary, size: 20 }}
                        handleBtnClick={() => dispatch(setModalState({ isVisible: false }))}
                        style={styles.cancelButton}
                    />
                    <LinearButton
                        textInfo={{ text: 'WITHDRAW', color: colors.primary }}
                        iconInfo={{ name: 'check', type: 'Feather', color: colors.primary, size: 20 }}
                        handleBtnClick={handleWithdraw}
                        style={styles.withdrawButton}
                    />
                </View>
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
    withdrawButton: {
        flex: 1,
        marginLeft: 10,
    },
}); 