import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: { title: string} = {
  title: "",
};

const modalSlice = createSlice({
  name: "modalSlice",
  initialState,
  reducers: {
    setModalTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    }
  },
});

export const { setModalTitle } = modalSlice.actions;
export default modalSlice.reducer;
