import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { useRouter } from "expo-router";
import useAuth from "./useAuth";
import { useCallback, useEffect, useMemo } from "react";
import { CallingState, StreamVideoClient } from "@stream-io/video-react-native-sdk";
import { setCall } from "../state/slices/callSlice";
import { showToast } from "../helpers/methods";

export const useDoctorCalls = () => {
    const { call, callId } = useSelector((state: RootState) => state.callSlice);
    const router = useRouter();
    const dispatch = useDispatch();
    const {accountInfo, activeUser} = useAuth();
    //const callId = !activeUser?.isDoctor ? `${accountInfo?.userId}_${activeUser?.userId}` : `${activeUser?.userId}_${accountInfo?.userId}`;
    const token = accountInfo?.token;
    const user = {
        id: accountInfo?.userId || '',
        name: accountInfo?.fname || '',
        image: accountInfo?.avatar || ''
    };
    const client = useMemo(() =>  StreamVideoClient.getOrCreateInstance({ apiKey:accountInfo?.apiKey || '', user, token }), [user, token,callId]);

    const joinCall = useCallback(() => {
        if(!call){
            try {
                const myCall = client.call('default', callId);
                dispatch(setCall(myCall));
                myCall.join({ create: true });
            } catch (error) {
                showToast(`Something went wrong whilej trying to join call!`);
                router.back();
            }
        }
    },[]);
    const onHangupCallHandler = () => {
        router.back();
    }

    useEffect(() => {
        if (call && accountInfo?.userId && activeUser?.userId && accountInfo.userId !== activeUser.userId) {
            call.ring()
                .catch(() => showToast('Failed to ring the recipient.'));
        }
        return () => {
          if(call?.state?.callingState !== CallingState.LEFT){
            call?.leave();
          }
        }
    },[call, accountInfo?.userId, activeUser?.userId])

    return {
        joinCall,
        onHangupCallHandler,
        call,
        callId,
        client
    }
}