import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import useGames from '../hooks/useGames';
import useUsers from '@/hooks/useUsers';
import { getUserById, updateData } from '@/helpers/api';
import { UserProfile } from 'firebase/auth';
import useUpdates from '@/hooks/useUpdates';

export const AppContext = React.createContext<any>(null);

export const AppProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const { accountInfo } = useUsers();
    const {bettingAmount,mainBalance,gamblingItems,gameTypes,gameStarted} = useSelector((state: RootState) => state.game);
    const {flipCard,isGameOver,getGamblingItems} = useGames();
    const {updateAppBalance} = useUpdates();
    const [balance,setBalance] = useState<number>(0)

    const handleTransactions = async (amount: number, userId: string, isFromAd: boolean) => {
        if (!isFromAd) {
            setBalance((prevBalance) => {
                const newBalance = prevBalance - amount;
                console.log('New balance updated', newBalance);
                updateData("users", accountInfo?.clientId || '', { field: 'balance', value: newBalance });
                return newBalance;
            });
        }
        const receiverInfo: UserProfile[] = await getUserById(userId);
        if (receiverInfo?.length > 0) {
            const commission = 0.5 * amount;
            const receiverBalance = receiverInfo?.[0]?.balance;
            const receiverNewBalance = receiverBalance as number + commission;
            await updateData("users", userId, { field: 'balance', value: receiverNewBalance });
            if(!isFromAd){
                updateAppBalance(commission);
            }
        }
    };
    useEffect(() => {
        setBalance(accountInfo?.balance)
    }, []);

    const appState = {bettingAmount,getGamblingItems,mainBalance,gamblingItems,flipCard,gameTypes,gameStarted,isGameOver, balance, handleTransactions};
    return (
        <AppContext.Provider value={{ appState }}>
            {children}
        </AppContext.Provider>
    );
};
