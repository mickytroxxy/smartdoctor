import { useDispatch } from "react-redux";
import { createData, getUserDetailsByUserId, updateData } from "../helpers/api";
import { setAccountInfo } from "../state/slices/accountInfo";
import moment from "moment";
import useAuth from "./useAuth";
import { showToast } from "../helpers/methods";
import { setModalState } from "../state/slices/modalState";
import useLoader from "./useLoader";
import { router } from "expo-router";
import { useSecrets } from "./useSecrets";
import { PlayMyJamProfile } from "@/constants/Types";

export const useUpdates = () => {
    const dispatch = useDispatch();
    const { activeUser, accountInfo } = useAuth();
    const {updateLoadingState} = useLoader();
    const {secrets} = useSecrets();
    const handleChange = (field: string, value: string | any) => {
        const data = activeUser ? activeUser : accountInfo;
        const updatedUser = { ...data, [field]: value };
        dispatch(setAccountInfo(updatedUser as any));

        if (data?.userId) {
            updateData("users", data.userId, { field, value });
        }
    };
    const handleTransaction = async({amount,receiver, sender, msg, type, description, createStatement = true}:{amount:number,receiver:string, sender:string, msg:string, type:'load' | 'withdraw' | 'transfer',description:string,createStatement?:boolean}) => {
        try {
            const receiverData = await getUserDetailsByUserId(receiver);
            const transactionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const date = moment().format("L");
            if(receiverData?.length > 0){
                const receiverBalance = receiverData[0]?.balance;
                const senderData = await getUserDetailsByUserId(sender);
                const senderBalance = senderData?.[0]?.balance;

                if(type === 'transfer'){
                    if((senderBalance && senderBalance) >= amount){
                        const updatedReceiverBalance = receiverBalance + amount;
                        const updatedSenderBalance = senderBalance - amount;
                        await updateData("users",receiver, {field:"balance",value:updatedReceiverBalance});
                        await updateData("users",sender, {field:"balance",value:updatedSenderBalance});
                        showToast(msg);
                        dispatch(setAccountInfo({...accountInfo,balance:updatedSenderBalance}));
                        if(createStatement){
                            await createData("transactions",transactionId,{transactionId,sender,receiver,amount,type,description,participants:[sender,receiver],date});
                        }
                        return true
                    }else{
                        showToast(`Insufficient balance ${senderBalance} ZAR`);
                        return false
                    }
                }else if(type === 'load'){
                    const updatedReceiverBalance = receiverBalance + amount;
                    await updateData("users",receiver, {field:"balance",value:updatedReceiverBalance});
                    showToast(msg);
                    dispatch(setAccountInfo({...accountInfo,balance:updatedReceiverBalance}))
                    if(createStatement){
                        await createData("transactions",transactionId,{transactionId,sender,receiver,amount,type,description,participants:[sender,receiver],date});
                    }
                    return true
                }else if(type === 'withdraw'){
                    const updatedReceiverBalance = receiverBalance - amount;
                    await updateData("users",receiver, {field:"balance",value:updatedReceiverBalance});
                    showToast(msg);
                    dispatch(setAccountInfo({...accountInfo,balance:updatedReceiverBalance}))
                    if(createStatement){
                        await createData("transactions",transactionId,{transactionId,sender,receiver,amount,type,description,participants:[sender,receiver],date});
                    }
                    return {success:true,transactionId}
                }
            }else{
                showToast(`receiver details not found!`);
                return false
            }
        } catch (error) {
            console.log(error)
            return false
        }
    }

    const updateAppBalance = async(amount: number) => {
        try {
            const appId = secrets?.appAccountId;
            const appBalanceResponse:PlayMyJamProfile[] = await getUserDetailsByUserId(appId);
            if(appBalanceResponse?.length > 0){
                const bal = appBalanceResponse?.[0].balance || 0;
                const balance = bal + amount;
                await updateData('users', appId, {field:'balance',value:balance});
                return true
            }
            return false;
        } catch (error) {
            console.error("Error updating app balance:", error);
            return false;
        }
    };
    const navigateToPayment = (amount:number,type:'load' | 'transfer') => {
        router.push({pathname:'/WebBrowser',params:{amount,type}})
    }
    const handleTopUp = () => {
        dispatch(setModalState({
            isVisible: true,
            attr:{
                headerText: 'TOP UP BALANCE',
                handleChange: async(value: number, type: string) => {
                    navigateToPayment(value,'load')
                }
            }
        }));
    };
    const handleWithdraw = () => {
        if (accountInfo?.balance && accountInfo.balance > 0) {
            dispatch(setModalState({
                isVisible: true,
                attr:{
                    headerText: 'WITHDRAW FUNDS',
                    handleChange: async(amount: string, bank: string, accountType: string, accountNumber: string, accountHolder: string) => {
                        console.log(amount, bank, accountType, accountNumber, accountHolder);
                        if(accountInfo?.balance || 0 >= parseFloat(amount)){
                            updateLoadingState(true,`Placing withdrawal request...`);
                            const response:any = await handleTransaction({amount:parseFloat(amount),receiver:accountInfo?.userId || '', sender:accountInfo?.userId || '', msg:'Your withdrawal was successful', type:'withdraw',description:`Withdrawal to ${bank}`});
                            if(response?.success){
                                dispatch(setModalState({
                                    isVisible: true,
                                    attr:{
                                        headerText: 'SUCCESS STATUS',
                                        status: response?.success,
                                        message: response?.success ? 'Your withdrawal was successful' : 'Your withdrawal failed'
                                    }
                                }));
                                const transactionId = response?.transactionId;
                                await createData('withdrawals',transactionId,{amount:parseFloat(amount),bank:bank,accountType:accountType,accountNumber:accountNumber,accountHolder:accountHolder,transactionId:transactionId,status:response?.success,description:`Withdrawal to ${bank} ${accountType}`});
                            }else{
                                showToast('Withdrawal failed');
                            }
                            updateLoadingState(false,``);
                        }else{
                            showToast('Insufficient balance for withdrawal');
                        }
                    }
                }
            }));
        } else {
            showToast('Insufficient balance for withdrawal');
        }
    };
    return { handleChange, updateAppBalance, handleTopUp, handleWithdraw, handleTransaction};
};

export default useUpdates;
