import { useEffect } from 'react';
import axios from 'axios';
import { OneSignal } from 'react-native-onesignal';
import useAuth from './useAuth';
import { updateData } from '../helpers/api';

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
            app_id: "e3e3f8d4-32c6-42dd-bc27-3145aad1017d",
            name: { en: "My notification Name" },
            contents: { en: body },
            headings: { en: title },
            include_subscription_ids: to,
            data,
            small_icon: "notification"
        },{
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Basic os_v2_app_4pr7rvbsyzbn3pbhgfc2vuibpxhurzvha7nuzduo3iboh5jt3fy7vpaoljjsvp6fx5n37i5wz5xenymdwcl3v43zivzsnozihpg3uca', // Replace with your REST API Key
            },
        });
        console.log('Notification sent successfullyl:', response.data);
    } catch (error) {
        console.error('Error sending notification:',error);
    }
};
export const useOnesignal = () => {
    const { accountInfo } = useAuth();
    const oneSignalInit = async () => {
        const token = await OneSignal.User.pushSubscription.getIdAsync();
        console.log(token)
        sendNotification([token || ''],'Just a test','Wow there noti',{})
        if (token) {
            updateData("users", accountInfo?.userId as any, { value: token, field: 'notificationToken' });
        }
    }
    
    useEffect(() => {
        OneSignal.initialize("99a54984-3b0e-4897-9b70-8ce6303260fc");
        OneSignal.Notifications.requestPermission(true);
        oneSignalInit();
    },[])
    return {};
};
