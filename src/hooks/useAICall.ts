import { Call, StreamVideoClient } from "@stream-io/video-react-native-sdk";
import { useSecrets } from "./useSecrets";

interface CallCredentials {
  apiKey: string;
  token: string;
  callType: string;
  callId: string;
  userId: string;
}
export const useAICall = () => {
    const {secrets} = useSecrets();
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
        const res = await fetch(`${secrets?.baseUrl}/${call.type}/${call.id}/${secrets.OPENAI_API}/connect`, {
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