// src/store/cameraSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CameraState {
    callback?: (...args: any) => void;
}

const initialState: CameraState = {};

const cameraSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        setCallback(state, action: PayloadAction<(...args: any) => void>) {
            state.callback = action.payload;
        },
        clearCallback(state) {
            state.callback = undefined;
        }
    }
});

export const { setCallback, clearCallback } = cameraSlice.actions;
export default cameraSlice.reducer;
