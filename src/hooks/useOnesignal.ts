import { useEffect } from 'react';
import axios from 'axios';
import { OneSignal } from 'react-native-onesignal';
import useAuth from './useAuth';
import { updateData } from '../helpers/api';

const oneSignalRestApi = 'os_v2_app_odec2xytqnanhboklofozdqqmgogserjghquk6uxvob2bvmcocekadwzl5wjcu7d7ggt6bsw3pwaqkooblhbsdby3jbqkton65dddni';
const oneSignalAppId = "70c82d5f-1383-40d3-85ca-5b8aec8e1061";

export const getOneSignalTokens = (users:any,clientId:string) => {
    if(users.length > 0){
        let notificationTokens = users.filter((user:any) => 
          user.clientId !== clientId && 
          user?.notificationToken && 
          !user.notificationToken.startsWith("ExponentPushToken")
        ).map((user:any) => user.notificationToken);
        return notificationTokens.filter((item:any) => !item.includes("encountered"))
    }else{
        return []
    }
}
export const sendNotification = async (to:string[],title:string,body:string,data = {}) => {
    try {
        const response = await axios.post('https://api.onesignal.com/notifications',{
            app_id: oneSignalAppId,
            name: { en: "PlayMyJam notification" },
            contents: { en: body },
            headings: { en: title },
            include_subscription_ids: to,
            data,
            small_icon: "logo"
        },{
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Basic ' + oneSignalRestApi
            },
        });
        console.log('Notification sent successfullyl:', response.data);
    } catch (error:any) {
        console.error('Error sending notification:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
            console.error('Response headers:', error.response.headers);

            // Log specific OneSignal error details
            if (error.response.data && error.response.data.errors) {
                console.error('OneSignal specific errors:', error.response.data.errors);
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }

        // Create a more descriptive error message
        const errorMessage = error.response?.data?.errors
            ? `OneSignal API Error: ${JSON.stringify(error.response.data.errors)}`
            : `Network Error: ${error.message}`;

        throw new Error(errorMessage);
    }
};
export const useOnesignal = () => {
    const { accountInfo } = useAuth();
    const oneSignalInit = async () => {
        const token = await OneSignal.User.pushSubscription.getIdAsync();
        if (token) {
            await updateData("users", accountInfo?.userId as any, { value: token, field: 'notificationToken' });
        }
    }
    
    useEffect(() => {
        OneSignal.initialize(oneSignalAppId);
        OneSignal.Notifications.requestPermission(true);
        oneSignalInit();
    },[])
    return {};
};
