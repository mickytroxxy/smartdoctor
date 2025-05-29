import 'react-native-gesture-handler';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from "react-redux";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setModalState } from '@/src/state/slices/modalState';
import useAuth from '@/src/hooks/useAuth';
import { currencyFormatter } from '@/src/helpers/methods';
import useLoader from '@/src/hooks/useLoader';
import { RootState } from '@/src/state/store';
import { clearCallback } from '@/src/state/slices/camera';
import useUpdates from '@/src/hooks/useUpdates';
import { useSecrets } from '@/src/hooks/useSecrets';

const WebBrowser = () =>{
    const dispatch = useDispatch();
    const {secrets} = useSecrets();
    const router = useRouter();
    const { amount, type} = useLocalSearchParams();
    const {handleTransaction} = useUpdates();
    const {updateLoadingState} = useLoader();
    const {accountInfo} = useAuth();
    const return_url = 'https://lifestyle.empiredigitals.org/';
    const cancel_url = 'https://fervent-almeida-f775d3.netlify.app/';
    let baseUrl = "https://www.payfast.co.za/eng/process?cmd=_paynow&receiver="+secrets?.payFastMerchantId+"&item_name=token purchase&item_description=token purchase&amount="+amount+"&return_url="+return_url+"&cancel_url="+cancel_url+"";
    const webViewSource: any = baseUrl ? { uri: baseUrl } : { uri: "" };
    const { callback } = useSelector((state: RootState) => state.camera);

    const loadAccount = async () => {
        updateLoadingState(true,type === 'book' ? 'Booking appointment...' : 'Loading account...');

        const success = await handleTransaction({amount:parseFloat(amount as string),receiver:accountInfo?.userId || '', sender:accountInfo?.userId || '', msg:`You have successfully loaded your account`, type:'load',description:`Payfast Top Up`});
        if(type !== 'book'){
            if(success){
                dispatch(setModalState({isVisible:true,attr:{headerText:'SUCCESS STATUS',message:'You have successfully loaded your account with '+currencyFormatter(parseFloat(amount as string))+' credits',status:true}}));
            }else{
                dispatch(setModalState({isVisible:true,attr:{headerText:'SUCCESS STATUS',message:'Your transaction did not go well, please make sure your card is valid and has sufficient funds',status:false}}));
            }
            router.back();
        }else{
            setTimeout(async() => {
                if(callback){
                    callback();
                }
                dispatch(clearCallback());
                router.back();
            }, 500);
        }
        updateLoadingState(false,``);
    }
    
    return(
        <GestureHandlerRootView style={{flex:1}}>
            <Stack.Screen options={{
                headerShown:false
            }} />
            <WebView
                source={webViewSource}
                showsVerticalScrollIndicator={false}
                startInLoadingState
                onLoadStart={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    if (nativeEvent.url.includes("fervent-almeida")) {
                        // dispatch(setModalState({isVisible:true,attr:{headerText:'SUCCESS STATUS',message:'Your transaction did not go well, please make sure your card is valid and has sufficient funds',status:false}}))
                        // router.back();
                        loadAccount();
                    }else if (nativeEvent.url.includes("lifestyle") && (!nativeEvent.url.includes("www.payfast.co.za"))) {
                        loadAccount();
                    }
                }}
            />
        </GestureHandlerRootView>
    )
}
export default WebBrowser;