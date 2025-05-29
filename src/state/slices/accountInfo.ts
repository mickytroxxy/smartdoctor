import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {PlayMyJamProfile} from "@/constants/Types";

const initialState: {
  accountInfo:PlayMyJamProfile | null,
  activeUser:PlayMyJamProfile | null
} = {
  accountInfo:null,
  activeUser:null
};

const accountSlice = createSlice({
  name: "accountSlice",
  initialState,
  reducers: {
    setAccountInfo: (state, action: PayloadAction<PlayMyJamProfile | null>) => {
      state.accountInfo = action.payload;
    },
    setActiveUser: (state, action: PayloadAction<PlayMyJamProfile | null>) => {
      state.activeUser = action.payload;
    }
  },
});

export const { setAccountInfo, setActiveUser } = accountSlice.actions;
export default accountSlice.reducer;
