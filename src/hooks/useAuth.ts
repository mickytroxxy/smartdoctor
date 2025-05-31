import { useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { phoneNoValidation, sendSms, showToast } from '../helpers/methods';
import { createData, getGeoPoint, getUserDetailsByPhone, loginApi, updateData, updateTable } from '../helpers/api';
import { setAccountInfo } from '../state/slices/accountInfo';
import { setConfirmDialog } from '../state/slices/ConfirmDialog';
import { useRouter } from 'expo-router';
import { LocationType, PlayMyJamProfile, UserRole } from '@/constants/Types';
import useLoader from './useLoader';
import { useSecrets } from './useSecrets';
import useFetch from './useFetch';

const useAuth = () => {
    const router = useRouter();
    const {secrets} = useSecrets();
    const { countryData,locationWithText, location } = useSelector((state: RootState) => state.location);
    const {accountInfo, activeUser} = useSelector((state: RootState) => state.accountSlice);
    const [confirmationCode, setConfirmationCode] = useState<number | string>('');
    const profileOwner = accountInfo?.userId === activeUser?.userId;
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const {fetchData} = useFetch();
    const [formData,setFormData] = useState({
        phoneNumber:'',
        password:'',
        fname:'',
        djName: '',
        experience: '',
        genres: '',
        clubId: '',
        clubName: '',
        address: '',
        operatingHours: '',
        contactNumber: '',
        role: 'patron' as UserRole,
        acceptTerms: 'false' as string
    });

    const handleChange = (field:string,value:string) => setFormData(v =>({...v, [field] : value}));
    const {updateLoadingState} = useLoader();

    const login = useCallback(async() =>{
        if(formData.phoneNumber.length > 7){
            if(formData.password.length > 5){
                const phoneNumber = phoneNoValidation(formData.phoneNumber,countryData?.dialCode);
                if(phoneNumber){
                    updateLoadingState(true,'Authenticating you, please wait...')
                    const response = await loginApi(phoneNumber,formData.password);
                    //alert(JSON.stringify(response))
                    if(response.length > 0){
                        dispatch(setAccountInfo(response[0]))
                        router.push("/Home")
                    }else{
                        showToast("Invalid login details")
                    }
                    updateLoadingState(false,'')
                }
            }else{
                showToast("Your password should be at least 6 characters long!")
            }
        }else{
            showToast("Your phone number is not valid!");
        }
    },[formData])
    const logOut = () => {
        dispatch(setConfirmDialog({isVisible:true,text:`Hi ${accountInfo?.fname}, You are about t sign out, your phonenumber and password will be required to sign in again!`,okayBtn:'Cancel',severity:true,cancelBtn:'LOG_OUT',response:(res:boolean) => {
            if(!res){
                router.push("/(auth)/login")
                dispatch(setAccountInfo(null));
            }
        }}))
    }

    const register = async() => {
        if(formData.fname !== '' && formData.password.length > 5 && formData.phoneNumber.length > 7){
            const userId:string = formData.fname?.toUpperCase().slice(0, 2) + Math.floor(Math.random() * 89999999 + 10000009).toString();
            dispatch(setConfirmDialog({isVisible:true,text:`Hi ${formData.fname}, please confirm if you have entered the correct details`,okayBtn:'CONFIRM',cancelBtn:'Cancel',response:(res:boolean) => {
                const phoneNumber = phoneNoValidation(formData.phoneNumber, countryData.dialCode);
                if(phoneNumber){
                    if(res){
                        const code = Math.floor(Math.random()*89999+10000);
                        const obj = {
                            ...formData,
                            date: Date.now(),
                            phoneNumber,
                            userId,
                            code,
                            acceptTerms: formData.acceptTerms ? 'true' : 'false'
                        };
                        router.push({pathname:'/(auth)/ConfirmScreen',params:obj});
                        sendSms(phoneNumber,`Hi ${formData.fname}, your The Lifestyle confirmation code is ${code}`,secrets?.SMS_AUTH)
                    }
                }else{
                    showToast("Invalid phonenumber")
                }
            }}))
        }else{
            showToast('Please carefully fill in to proceed!')
        }
    }

    const confirmCode = async (obj:PlayMyJamProfile) => {
        if (confirmationCode.toString() === (obj.code || "").toString() || null) {
            const phoneNumber = obj.phoneNumber;
            const userId = obj?.userId || '';
            const geoHash = getGeoPoint(location.latitude,location.longitude);
            const address:LocationType = {text:'No address associated',latitude:0,longitude:0};

            const newObj:PlayMyJamProfile = {
                ...obj,
                userId,
                avatar:'',
                photos:[],
                about:'Hello there, I am on PlayMyJam',
                isVerified:false,
                deleted:false,
                address:(locationWithText || address),
                geoHash,
                balance:0,
                fname_lower:obj.fname?.toLowerCase()
            };

            updateLoadingState(true,'Creating your free account...')
            const response = await getUserDetailsByPhone(phoneNumber || "");

            if (response.length === 0) {
                const res = await createData("users", userId as any, newObj);
                if(res){
                    dispatch(setAccountInfo(newObj));
                    router.push("/Home")
                }
            }else{
                const res = response[0];
                const updatedObj: PlayMyJamProfile = {
                    ...newObj,
                    userId: res?.userId || ''
                };
                dispatch(setAccountInfo(updatedObj));
                router.push("/Home")
                await updateTable("users", res.userId.toString(), updatedObj);
            }
            updateLoadingState(false,'')
        } else {
          showToast("Invalid confirmation code!");
        }
    };

    const getUserDetails = async() => {
        if(accountInfo){
            const response = await getUserDetailsByPhone(accountInfo?.phoneNumber || "");
            if(response?.length > 0){
                const geoHash = getGeoPoint(location.latitude,location.longitude);
                const res = await fetchData({endPoint:'/credentials',method:'POST',data:{phoneNumber:accountInfo?.phoneNumber,userId:accountInfo?.userId}});
                if(res?.token){
                    await updateTable('users',accountInfo?.userId || '',{...accountInfo,callType:res?.callType,callId:res?.callId,token:res?.token,apiKey:res?.apiKey,geoHash});
                    dispatch(setAccountInfo({...response[0],callType:res?.callType,callId:res?.callId,token:res?.token,apiKey:res?.apiKey,geoHash}));
                    console.log('<=======Account info updated======>');
                }
            }
        }else{
            router.push('/(auth)/login')
        }
    }
    // Function to update account info
    const updateAccountInfo = (data: PlayMyJamProfile) => {
        dispatch(setAccountInfo(data));
    };

    return useMemo(() => ({
        countryData,
        accountInfo,
        formData,
        handleChange,
        login,
        logOut,
        register,
        confirmCode,
        setConfirmationCode,
        confirmationCode,
        activeUser,
        profileOwner,
        loading,
        getUserDetails,
        setAccountInfo: updateAccountInfo
    }), [countryData, accountInfo, formData, handleChange, login, logOut, register, confirmCode, confirmationCode, activeUser, profileOwner, loading, getUserDetails]);
};

export default useAuth;
