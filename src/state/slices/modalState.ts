import { createSlice, PayloadAction } from '@reduxjs/toolkit'
const initialState = {
    isVisible: false,
    attr: { headerText: 'HEADER TEXT' },
    isFetching:{state:false,text:''}
}
export const modalState = createSlice({
    name: 'modalState',
    initialState,
    reducers: {
        setModalState: (state,action) => {
            return {...state,...action.payload};
        },
        setIsFetching: (state, action: PayloadAction<{state:boolean,text:string}>) => {
            state.isFetching = action.payload;
        }
    }
})
export const { setModalState, setIsFetching } = modalState.actions
export default modalState.reducer