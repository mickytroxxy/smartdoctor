import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";

import { setCallback } from "../state/slices/camera";
import useLoader from "./useLoader";
import useAuth from "./useAuth";
import { updateData, uploadFile } from "../helpers/api";
import { setAccountInfo, setActiveUser } from "../state/slices/accountInfo";
import { showToast } from "../helpers/methods";
import { useUpdates } from "@/hooks/useUpdates";

export const usePhotos = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const {updateLoadingState} = useLoader();
    const {accountInfo,activeUser} = useAuth();

    const handleChange = (field: string, value: string | any) => {
        const data = activeUser ? activeUser : accountInfo;
        const updatedUser = { ...data, [field]: value };
        dispatch(setAccountInfo(updatedUser as any));

        if (data?.userId) {
            updateData("users", data.userId, { field, value });
        }
    };

    const uploadPhotos = async ({fileUrl,field}:{fileUrl:any,field:string}) => {
        updateLoadingState  (true,'Uploading your file, please wait...')
        let location = `${field}/${accountInfo?.userId || ''}`;
        if(field === "photos"){
            location = `${field}/${accountInfo?.userId}/${(Date.now() +  Math.floor(Math.random()*89999+10000)).toString()}`;
        }
        const url = await uploadFile(fileUrl,location)
        const photoId = (Date.now() + Math.floor(Math.random() * 899 + 1000)).toString()
        const value = [...accountInfo?.photos || [],{photoId,url}]
        const response = await updateData("users",accountInfo?.userId || '',{field,value:field === 'photos' ? value : url})
        
        if(response){
            const updatedData = {...accountInfo,[field] : field === 'photos' ? value : url}
            dispatch(setAccountInfo(updatedData))
            dispatch(setActiveUser(updatedData))
            showToast("Your "+field+" has Been Successfully Changed!");
            updateLoadingState(false,'')
        }
    }
    const handleOtherPhotos = (field:'idPhoto' | 'avatar' | 'photos') => {
        dispatch(setCallback(uploadPhotos));
        router.push({pathname:'/CameraScreen',params:{type:field,action:'profile',data:''}})
    }
    const handleGetPhotos = (getPhotos:(path:any) => any) => {
        dispatch(setCallback(getPhotos));
        router.push({pathname:'/CameraScreen',params:{type:'photos',action:'profile',data:''}})
    }
    return {handleGetPhotos, handleOtherPhotos, handleChange}
}