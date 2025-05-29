import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  Call,
  HangUpCallButton,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import inCallManager from "react-native-incall-manager";
import { useAICall } from "@/src/hooks/useAICall";
import { AudioVisualizer } from "@/components/ui/call/AudioVisualizer";
import { colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import useAuth from "@/src/hooks/useAuth";

function AICall() {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const {joinCall} = useAICall();
  const router = useRouter();
  const {accountInfo} = useAuth();
  const credentialsPromise = {
    apiKey: accountInfo?.apiKey || '',
    token: accountInfo?.token || '',
    callType: accountInfo?.callType || '',
    callId: accountInfo?.callId || '',
    userId: accountInfo?.userId || '',
  }
  const [status, setStatus] = useState<
    "start" | "joining" | "awaiting-agent" | "joined-with-agent" | "end"
  >("start");

  const handleJoin = async () => {
    setStatus("joining");
    try {
      const credentials = await joinCall(credentialsPromise);
      setClient(credentials[0]);
      setCall(credentials[1]);
      setStatus("joined-with-agent");
      inCallManager.setSpeakerphoneOn(true);
    } catch (error) {
      console.error("Could not join call", error);
      setStatus("start");
    }
  };

  const handleLeave = () => {
    setStatus("start");
    router.back();
  };
  useEffect(() => {
    if(status === 'start'){
        handleJoin();
    }
  },[])
  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        {(status === "joining" || status === "awaiting-agent") && (
          <View style={styles.textContainer}>
            <Text style={{fontFamily:'fontBold',color:colors.white,fontSize:12}}>Calling AI doctor...</Text>
          </View>
        )}
        {client && call && status !== "start" && (
          <View style={styles.callContainer}>
            <StreamVideo client={client}>
              <StreamCall call={call}>
                {status !== "end" ? (
                  <CallLayout
                    onAgentJoined={() => setStatus("joined-with-agent")}
                    onLeave={handleLeave}
                  />
                ) : (
                  <Text>End</Text>
                )}
              </StreamCall>
            </StreamVideo>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

function CallLayout(props: {
    onAgentJoined?: () => void;
    onLeave?: () => void;
  }) {
    const call = useCall();
    const { useDominantSpeaker } = useCallStateHooks();
    const dominantSpeaker = useDominantSpeaker();
    return (
      <>
        <AudioVisualizer
          colorScheme={dominantSpeaker?.isLocalParticipant ? "red" : "blue"}
          audioLevel={dominantSpeaker?.audioLevel || 0}
        />
        <View style={styles.callControls}>
          <HangUpCallButton
            onPressHandler={() => {
              call?.endCall();
              props.onLeave?.();
            }}
          />
        </View>
      </>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  joinContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  callContainer: {
    flex: 1,
    padding: 16,
    width: "100%",
  },
  statusText: {
    color: "white",
    fontSize: 16,
  },
  callControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});

export default AICall;