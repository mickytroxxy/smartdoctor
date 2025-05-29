import { Call, StreamVideoClient } from "@stream-io/video-react-native-sdk";
import { useEffect } from "react";
import useAuth from "./useAuth";
import useFetch from "./useFetch";

interface CallCredentials {
  apiKey: string;
  token: string;
  callType: string;
  callId: string;
  userId: string;
}
const baseUrl = "http://192.168.18.229:3000";
export const useAICall = () => {
    async function joinCall(credentials: CallCredentials): Promise<[client: StreamVideoClient, call: Call]> {
        const client = new StreamVideoClient({
            apiKey: credentials.apiKey,
            user: { id: credentials.userId },
            token: credentials.token,
        });
        
        const call = client.call(credentials.callType, credentials.callId);
        await call.camera.disable();
        try {
            await Promise.all([connectAgent(call), call.join({ create: true })]);
        } catch (err) {
            await call.leave();
            await client.disconnectUser();
            throw err;
        }
        
        return [client, call];
    }
    
    async function connectAgent(call: Call) {
        const res = await fetch(`${baseUrl}/${call.type}/${call.id}/connect`, {
            method: "POST",
        });
        
        if (res.status !== 200) {
            throw new Error("Could not connect agent");
        }
    }
    return {
        joinCall
    }
}