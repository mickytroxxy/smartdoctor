import { colors } from "@/constants/Colors";
import { showToast } from "@/src/helpers/methods";
import useAuth from "@/src/hooks/useAuth";
import { Call, CallContent, CallingState, IncomingCall, StreamCall, StreamVideo, StreamVideoClient } from "@stream-io/video-react-native-sdk";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";

export default function DoctorCall() {
    const router = useRouter();
    const dispatch = useDispatch();
    const {accountInfo, activeUser} = useAuth();

    // Generate a consistent call ID based on the two users' IDs
    // Sort the IDs to ensure the same call ID regardless of who initiates
    const callId = useMemo(() => {
      if (!accountInfo?.userId || !activeUser?.userId) {
        return null;
      }

      const ids = [accountInfo.userId, activeUser.userId].sort();
      return `${ids[0]}_${ids[1]}`;
    }, [accountInfo?.userId, activeUser?.userId]);

    const token = accountInfo?.token;

    const user = {
      id: accountInfo?.userId || '',
      name: accountInfo?.fname || '',
      image: accountInfo?.avatar || ''
    };

    const client = useMemo(() =>
      StreamVideoClient.getOrCreateInstance({
        apiKey: accountInfo?.apiKey || '',
        user,
        token: token || ''
      }),
    [user, token, accountInfo?.apiKey]);

    const [call, setCall] = useState<Call | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const joinCall = useCallback(async () => {
        if (!callId) {
          setErrorMessage('Cannot establish call: missing user information');
          showToast('Cannot establish call: missing user information');
          router.back();
          return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
          // Create the call with both users as members
          const members: { user_id: string; role: string }[] = [];

          // Add both users as members if we have their IDs
          if (accountInfo?.userId) {
            members.push({
              user_id: accountInfo.userId,
              role: 'call_member'
            });
          }

          if (activeUser?.userId) {
            members.push({
              user_id: activeUser.userId,
              role: 'call_member'
            });
          }

          // According to Stream's documentation, we need to:
          // 1. Create a call with members
          // 2. Join the call

          try {
            // Get the call object
            const myCall = client.call('default', callId);

            // First, create the call with both users as members
            await myCall.getOrCreate({
              data: {
                // Custom data can include members
                custom: {
                  members: members.map(m => m.user_id)
                }
              },
              ring: false // Don't ring yet
            });

            console.log('Call created successfully with ID:', callId);

            // Set the call in state
            setCall(myCall);

            // Now join the call
            await myCall.join();

            console.log('Successfully joined call:', callId);

            // After joining, we can ring the participants
            if (accountInfo?.userId !== activeUser?.userId) {
              try {
                await myCall.ring();
                console.log('Ringing participants');
              } catch (ringError) {
                console.error('Error ringing participants:', ringError);
              }
            }
          } catch (callError) {
            console.error('Error in call creation/joining:', callError);
            throw callError; // Re-throw to be caught by the outer try/catch
          }

          setIsLoading(false);
        } catch (error: any) {
          // Extract detailed error information
          let errorMsg = 'Unknown error';

          if (error?.message) {
            errorMsg = error.message;
          } else if (typeof error === 'string') {
            errorMsg = error;
          }

          // Log detailed error for debugging
          console.error('Error joining call:', {
            error,
            errorMsg,
            callId,
            accountId: accountInfo?.userId,
            activeUserId: activeUser?.userId
          });

          // Set error state
          setErrorMessage(errorMsg);

          // Show user-friendly message
          showToast(`Failed to join call: ${errorMsg.substring(0, 100)}`);
          setIsLoading(false);

          // Only navigate back for certain errors
          if (errorMsg.includes('Only members can reject or accept a call')) {
            // This is likely a temporary error, don't navigate back
            console.log('Temporary error, not navigating back');
          } else {
            router.back();
          }
        }
    },[callId, client, router, accountInfo?.userId, activeUser?.userId]);

    const onHangupCallHandler = useCallback(() => {
        if (call) {
            console.log('Hanging up call, current state:', call.state?.callingState);

            // First try to end the call
            try {
                // Only try to leave if not already left
                if (call.state?.callingState !== CallingState.LEFT) {
                    console.log('Leaving call...');
                    call.leave()
                        .then(() => console.log('Successfully left call'))
                        .catch(err => console.log('Note: Error leaving call (can be ignored):', err.message));
                }

                // End the call for all participants
                console.log('Ending call...');
                call.endCall()
                    .then(() => console.log('Successfully ended call'))
                    .catch(err => console.log('Note: Error ending call (can be ignored):', err.message));

                // Clear the call state
                setCall(null);
            } catch (err) {
                console.log('Error during hangup:', err);
            }
        }

        // Navigate back regardless of call state
        router.back();
    }, [call, router]);
    useEffect(() => {
        // Initialize call when component mounts
        if (!call) {
            joinCall().catch(err => {
                console.error('Failed to join call in useEffect:', err);
                showToast('Failed to establish call connection');
                router.back();
            });
        }

        // Cleanup function
        return () => {
            if (call) {
                console.log('Cleaning up call on unmount, state:', call.state?.callingState);

                // Only try to leave if the call is in a state where leaving makes sense
                // Check if the call is not already in a terminal state
                // The CallingState enum in Stream SDK has LIMITED states, so we need to check what's available
                console.log('Available calling states:', Object.values(CallingState));

                // Check if the call is not already LEFT
                if (call.state?.callingState && call.state.callingState !== CallingState.LEFT) {

                    console.log('Attempting to leave call');
                    call.leave()
                        .then(() => console.log('Successfully left call during cleanup'))
                        .catch(err => {
                            // Just log the error but don't throw - this is cleanup code
                            console.log('Note: Error during call cleanup (can be ignored):', err.message);
                        });
                } else {
                    console.log('Call already left or disconnected, skipping leave() call');
                }
            }
        };
    }, [call, joinCall, router]);

    // We don't need a separate ringing effect anymore since we handle ringing in the joinCall function
    // This effect is just for monitoring call state changes
    useEffect(() => {
        if (call) {
            // Log call state changes for debugging
            const unsubscribe = call.on('call.updated', () => {
                console.log('Call state updated:', call.state.callingState);
            });

            return () => {
                unsubscribe();
            };
        }
    }, [call]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen options={{headerShown:false}} />
            <StreamVideo client={client}>
                {/* Show call UI when call is established */}
                {call && (
                    <StreamCall call={call}>
                        <CallContent onHangupCallHandler={onHangupCallHandler}/>
                    </StreamCall>
                )}

                {/* Show loading or error state when no call */}
                {!call && (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colors.primary,
                        padding: 20
                    }}>
                        {isLoading ? (
                            <>
                                <Text style={{
                                    color: colors.white,
                                    fontFamily: 'fontBold',
                                    fontSize: 18,
                                    marginBottom: 20,
                                    textAlign: 'center'
                                }}>
                                    Connecting to call...
                                </Text>
                                <Text style={{
                                    color: colors.white,
                                    fontFamily: 'fontLight',
                                    fontSize: 14,
                                    marginBottom: 10,
                                    textAlign: 'center'
                                }}>
                                    Please wait while we establish a secure connection
                                </Text>
                                <ActivityIndicator size="large" color={colors.white} style={{ marginTop: 20 }} />
                            </>
                        ) : errorMessage ? (
                            <>
                                <Text style={{
                                    color: colors.tomato,
                                    fontFamily: 'fontBold',
                                    fontSize: 18,
                                    marginBottom: 20,
                                    textAlign: 'center'
                                }}>
                                    Connection Error
                                </Text>
                                <Text style={{
                                    color: colors.white,
                                    fontFamily: 'fontLight',
                                    fontSize: 14,
                                    marginBottom: 20,
                                    textAlign: 'center'
                                }}>
                                    {errorMessage}
                                </Text>
                                <TouchableOpacity
                                    onPress={joinCall}
                                    style={{
                                        backgroundColor: colors.white,
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderRadius: 8
                                    }}
                                >
                                    <Text style={{
                                        color: colors.primary,
                                        fontFamily: 'fontBold',
                                        fontSize: 16
                                    }}>
                                        Retry Connection
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={{
                                color: colors.white,
                                fontFamily: 'fontBold',
                                fontSize: 18,
                                textAlign: 'center'
                            }}>
                                Initializing call....
                            </Text>
                        )}
                    </View>
                )}
            </StreamVideo>
        </GestureHandlerRootView>
    );
}