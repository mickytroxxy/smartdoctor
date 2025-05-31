import { SecretsType } from "@/constants/Types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: {secrets:SecretsType} = {
  secrets:{
    OPENAI_API:'',
    appleApproved:false,
    WHATSAPP:'',
    baseUrl:'',
    SMS_AUTH:'',
    SMS_KEY:"",
    googleApiKey:'',
    payFastMerchantId:'15759218',
    googleApiKeyActive:true,
    deliveryFee:200,
    appAccountId:'KH56461866',
    vatFee:0,
    canSendSms:false,
    commissionFee:15,
    website:''
  }
};

const globalVariables = createSlice({
  name: "globalVariables",
  initialState,
  reducers: {
    setSecrets: (state, action: PayloadAction<SecretsType>) => {
      state.secrets = action.payload;
    },
  },
});

export const { setSecrets } = globalVariables.actions;
export default globalVariables.reducer;
