import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import axios from 'axios';
import { useSecrets } from './useSecrets';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { createData, getAllMessages, getMessages, uploadFile, getUserById } from '../helpers/api';
import { usePhotos } from './usePhotos';
import { sendNotification } from './useOnesignal';

const useChat = () => {
  const { secrets } = useSecrets();
  const { accountInfo, activeUser } = useSelector((state: RootState) => state.accountSlice);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const connectionId = `chat-${accountInfo?.userId}-${activeUser?.userId}`;
  const reversedConnectionId = `chat-${activeUser?.userId}-${accountInfo?.userId}`;
  const {handleGetPhotos} = usePhotos();

  // Helper function to send notification to recipient
  const sendMessageNotification = useCallback(async (
    recipientId: string,
    senderName: string,
    messageText: string,
    isImage: boolean = false
  ) => {
    try {
      // Don't send notifications to AI users
      if (activeUser?.isAI) return;

      const userData = await getUserById(recipientId);
      if (userData?.notificationToken && !userData.notificationToken.startsWith("ExponentPushToken")) {
        const notificationBody = isImage
          ? `${senderName} sent you an image`
          : `${senderName}: ${messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText}`;

        await sendNotification(
          [userData.notificationToken],
          'New Message',
          notificationBody,
          {
            type: 'new_message',
            senderId: accountInfo?.userId,
            senderName: senderName,
            chatId: connectionId
          }
        );
      }
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }, [accountInfo, activeUser, connectionId]);

  const generateAiMessages = useCallback((messages: any[], cb: (response: string | boolean) => void) => {
    try {
      // First try with the API key
      const headers = {
        'Authorization': `Bearer  ${secrets.OPENAI_API}`,
        'Content-Type': 'application/json'
      };

      const data = {
        model: 'gpt-4.1-mini',
        messages
      };

      axios.post('https://api.openai.com/v1/chat/completions', data, { headers })
        .then(response => {
          cb(response.data?.choices[0]?.message.content);
        })
        .catch(error => {
          console.error('OpenAI API error:', error);
          // If API fails, use the dummy response
          cb(false);
        });
    } catch (error) {
      console.error('Error in generateAiMessages:', error);
      cb(false);
    }
  }, [secrets]);

  const sendMessage = useCallback(async(sender:string, body:string, imageUrl?:string) => {
    const messageId = Math.round(Math.random() * 1000000)?.toString();
    const messageObj: IMessage = {
      _id: messageId,
      text: body,
      ...(imageUrl && {image: imageUrl}),
      createdAt: new Date(),
      sent: true,
      received: false,
      user: {
        _id: sender,
        name: sender === accountInfo?.userId ? accountInfo?.fname : activeUser?.fname,
        avatar: sender === accountInfo?.userId ? accountInfo?.avatar : activeUser?.avatar
      },
    }
    await createData('chat',messageId,{...messageObj,participants:[connectionId,reversedConnectionId]});

    // Send notification to recipient if sender is current user
    if (sender === accountInfo?.userId && activeUser?.userId) {
      const senderName = accountInfo?.isDoctor ? `Dr. ${accountInfo.fname}` : accountInfo?.fname || 'Someone';
      await sendMessageNotification(
        activeUser.userId,
        senderName,
        body,
        !!imageUrl
      );
    }
  },[accountInfo, activeUser, connectionId, reversedConnectionId, sendMessageNotification])

  const onSend = useCallback(async(newMessages: IMessage[] = []) => {
    sendMessage(accountInfo?.userId || '', newMessages[0].text);
    if(activeUser?.isAI){
      setIsTyping(true);
      let messagesWithRoles = messages?.map(item => ({
        role: item.user._id === accountInfo?.userId ? 'user' : 'assistant',
        content: item.text
      })) || [];
      messagesWithRoles = [
        { role: "system", content: `You are a professional medical doctor, your duty is to give advice to patients. doctors, prescription recommendations. You can analyse images` },
        ...messagesWithRoles,
        { role: 'user', content: newMessages[0].text }
      ];

      generateAiMessages(messagesWithRoles, async(response) => {
        setIsTyping(false);
        if (response) {
          sendMessage(activeUser?.userId || '', response as string);
        } else {
          fallBack();
        }
      });
    }
  }, [accountInfo, activeUser, messages, generateAiMessages, sendMessage]);

  const fallBack = () => {
    const fallbackResponse = "I apologize, but I'm having trouble processing your request at the moment. Please try again later.";
    const fallbackMessage: IMessage = {
      _id: `fallback-${Date.now()}`,
      text: fallbackResponse,
      createdAt: new Date(),
      user: {
        _id: activeUser?.userId || 'ai',
        name: activeUser?.fname || 'AI Doctor',
        avatar: activeUser?.avatar || '',
      },
      sent: true,
      received: true,
    };

    setMessages(prevMessages => GiftedChat.append(prevMessages, [fallbackMessage]));
  }
  const sendPhoto = useCallback(() => {
    handleGetPhotos(async ({fileUrl}: {field:string,fileUrl:string}) => {
      if (!fileUrl) return;
      try {
        const photoPath = `chat_photos/${accountInfo?.userId}_${Date.now()}`;
        const imageUrl = await uploadFile(fileUrl, photoPath);
        sendMessage(accountInfo?.userId || '', '', imageUrl);
        if(activeUser?.isAI){
          setIsTyping(true);
          let messagesWithRoles:any = messages?.map(item => ({
            role: item.user._id === accountInfo?.userId ? 'user' : 'assistant',
            content: item.text
          })) || [];
    
          generateAiMessages([
            ...messagesWithRoles,
            {
              role: "user",
              content: [
                { type: "text", text: "You are a professional medical doctor, your duty is to analyze medical images and provide recommendations. Please analyze the following image and provide your recommendations. briefly respond, not too long, don't look like an AI" },
                {
                  type: "image_url",
                  image_url: {
                    "url": imageUrl,
                  },
                }
              ],
            },
          ], async(response) => {
            setIsTyping(false);
            if (response) {
              sendMessage(activeUser?.userId || '', response as string);
            } else {
              fallBack();
            }
          });
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    });
  }, [accountInfo, handleGetPhotos, connectionId, reversedConnectionId]);

  useEffect(() => {
    (async() => {
      getAllMessages(connectionId,reversedConnectionId,(data:any) => {
        if(data.length > 0){
          setMessages(prevMessages => {
            const existingMessageIds = new Set(prevMessages.map(msg => msg._id));
            const newMessages = data.filter((msg: any) => !existingMessageIds.has(msg._id));
            return [...prevMessages, ...newMessages].sort((a: any, b: any) =>
              b.createdAt.getTime() - a.createdAt.getTime()
            );
          });
        }
      });
    })()
  },[connectionId, reversedConnectionId]);
  return {
    onSend,
    messages,
    setMessages,
    inputText,setInputText,isTyping,setIsTyping,isOnline,setIsOnline,handleGetPhotos,sendPhoto
  };
};

export default useChat;
