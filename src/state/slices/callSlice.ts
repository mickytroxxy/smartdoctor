// src/store/cameraSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Call } from '@stream-io/video-react-native-sdk';

interface CallState {
    callId: string;
    call: Call | null
}

const initialState: CallState = {
    callId:'1234512340099bb',
    call: null
};

const callSlice = createSlice({
    name: 'call',
    initialState,
    reducers: {
        setCallId: (state, action: PayloadAction<string>) => {
            state.callId = action.payload;
        },
        setCall: (state, action: PayloadAction<any>) => {
            state.call = action.payload;
        }
    }
});

export const { setCallId, setCall } = callSlice.actions;
export default callSlice.reducer;
