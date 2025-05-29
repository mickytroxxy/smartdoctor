import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { setIsFetching } from '../state/slices/modalState';
const useLoader = () => {
    const { isFetching } = useSelector((state: RootState) => state.modalState);
    const dispatch = useDispatch();
    const updateLoadingState = (state:boolean,text:string) => {
        dispatch(setIsFetching({state,text}));
        if(state){
            setTimeout(() => {
                dispatch(setIsFetching({state:false,text:''}));
            }, 1000 * 60);
        }
    }
    return {updateLoadingState,isFetching};
};

export default useLoader;
