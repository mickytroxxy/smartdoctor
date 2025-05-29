import { ConfirmDialogType } from '@/constants/Types';
import { createSlice } from '@reduxjs/toolkit'
const initialState : ConfirmDialogType = {
    isVisible: false,
    text: 'Would you like to come today for a fist?',
    okayBtn: 'VERIFY',
    cancelBtn: 'CANCEL',
    hasHideModal:false,
    isSuccess: false,
    response:null
}
export const confirmDialog = createSlice({
    name: 'confirmDialog',
    initialState,
    reducers: {
        setConfirmDialog: (state,action) => {
            return {...state,...action.payload};
        },
    },
})
export const { setConfirmDialog } = confirmDialog.actions

export default confirmDialog.reducer