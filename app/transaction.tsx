import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { colors } from "@/constants/Colors";
import { currencyFormatter, showToast } from "@/src/helpers/methods";
import Icon from "@/components/ui/Icon";
import useAuth from "@/src/hooks/useAuth";
import { useEffect, useState } from "react";
import { router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {getTransactions } from "@/src/helpers/api";
import useUpdates from "@/src/hooks/useUpdates";

export interface Transaction {
    transactionId: string;
    type: 'load' | 'withdraw' | 'transfer';
    amount: number;
    description: string;
    date: string;
    participants: string[];
    receiver: string;
    sender:string
}

export default function TransactionScreen() {
    const { accountInfo } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { handleWithdraw, handleTopUp } = useUpdates();

    useEffect(() => {
        const fetchTransactions = async () => {
            const transactions = await getTransactions(accountInfo?.userId || '');
            setTransactions(transactions);
        };
        fetchTransactions();
    }, []);

    return (
        <LinearGradient colors={[colors.primary, '#3a3a6a', colors.tertiary]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.6 }} style={styles.container}>
            <Stack.Screen options={{
                headerTitle: 'Transactions',
            }} />
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>{currencyFormatter(accountInfo?.balance || 0)}</Text>
                <View style={styles.actionButtons}>
                    <View style={{flex:1}}>
                    <TouchableOpacity style={[styles.actionButton, {backgroundColor:colors.tertiary,alignSelf:'flex-start'}]} onPress={handleTopUp}>
                        <Icon name="plus-circle" type="Feather" size={24} color={colors.white} />
                        <Text style={styles.actionButtonText}>Top Up</Text>
                    </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.actionButton, {backgroundColor:colors.orange,alignSelf:'flex-end'}]} onPress={handleWithdraw}>
                        <Icon name="arrow-up-circle" type="Feather" size={24} color={colors.white} />
                        <Text style={styles.actionButtonText}>Withdraw</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.transactionsContainer}>
                <Text style={styles.transactionsTitle}>Recent Transactions</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.transactionsList}>
                    {transactions.map((transaction) => {
                        return (
                            <View key={transaction.transactionId} style={styles.transactionItem}>
                                <View style={styles.transactionIcon}>
                                    <Icon 
                                        name={transaction.receiver === accountInfo?.userId ? 'arrow-down-circle' : 'arrow-up-circle'} 
                                        type="Feather" 
                                        size={24} 
                                        color={transaction.receiver === accountInfo?.userId ? colors.green : colors.tomato} 
                                    />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                                </View>
                                <Text style={[
                                    styles.transactionAmount,
                                    { color: transaction.receiver === accountInfo?.userId ? colors.green : colors.tomato }
                                ]}>
                                    {transaction.receiver === accountInfo?.userId ? '+' : '-'}ZAR {transaction.amount.toFixed(2)}
                                </Text>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        paddingTop: 50,
    },
    headerTitle: {
        color: colors.white,
        fontSize: 18,
        fontFamily: 'fontBold',
    },
    balanceCard: {
        backgroundColor: colors.primary,
        padding: 20,
        borderRadius: 15,
        margin: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    balanceLabel: {
        color: colors.white,
        fontSize: 16,
        fontFamily: 'fontLight',
        marginBottom: 5,
    },
    balanceAmount: {
        color: colors.white,
        fontSize: 24,
        fontFamily: 'fontBold',
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    actionButtonText: {
        color: colors.white,
        marginLeft: 8,
        fontSize: 12,
        fontFamily: 'fontBold',
    },
    transactionsContainer: {
        flex: 1,
        margin: 15,
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15,
    },
    transactionsTitle: {
        fontSize: 14,
        fontFamily: 'fontBold',
        color: colors.primary,
        marginBottom: 15,
    },
    transactionsList: {
        flex: 1,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        borderWidth: 1,
        borderColor: colors.faintGray,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.faintGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 12,
        fontFamily: 'fontBold',
        color: colors.primary,
        marginBottom: 5,
    },
    transactionDate: {
        fontSize: 12,
        fontFamily: 'fontLight',
        color: colors.grey,
    },
    transactionAmount: {
        fontSize: 14,
        fontFamily: 'fontBold',
    },
}); 