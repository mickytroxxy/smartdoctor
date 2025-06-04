import { useState, useEffect, useCallback } from 'react';
import { getUserById } from '../helpers/api';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../helpers/api';
import { AI_DOCTOR } from '../data/dummyDoctors';
import useAuth from './useAuth';

export interface ChatPreview {
  userId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  isAI?: boolean;
  userDetails?: any; // Full user object for navigation
}

const useMessageList = () => {
  const { accountInfo } = useAuth();
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);



  // Process messages and create chat previews
  const processMessages = useCallback(async (messages: any[]) => {
    if (!messages || messages.length === 0 || !accountInfo?.userId) {
      setChatPreviews([]);
      setLoading(false);
      return;
    }

    try {
      // Group messages by conversation partner (recipient)
      const conversationMap = new Map<string, any>();

      // Process messages to find unique conversations
      for (const message of messages) {
        let recipientUserId: string | undefined;

        // Find the OTHER user in the conversation (not the current user)
        // Try multiple methods to identify the recipient
        if (message.users && Array.isArray(message.users)) {
          // Method 1: Look in users array
          recipientUserId = message.users.find((p: string) => p !== accountInfo.userId);
        }

        if (!recipientUserId && message.user && message.user._id !== accountInfo.userId) {
          // Method 2: If message is from someone else, they are the recipient
          recipientUserId = message.user._id;
        }

        if (!recipientUserId && message.user && message.user._id === accountInfo.userId) {
          // Method 3: If current user sent the message, find recipient in users
          recipientUserId = message.users?.find((p: string) => p !== accountInfo.userId);
        }

        if (recipientUserId && recipientUserId !== accountInfo.userId) {
          const existing = conversationMap.get(recipientUserId);

          // Keep the most recent message for each conversation
          if (!existing || new Date(message.createdAt) > new Date(existing.lastMessageTime)) {
            conversationMap.set(recipientUserId, {
              userId: recipientUserId,
              lastMessage: message.text || (message.image ? 'Image' : 'Message'),
              lastMessageTime: new Date(message.createdAt),
              unreadCount: message.user?._id !== accountInfo.userId ? 1 : 0, // Count unread if message is from other user
              isOnline: Math.random() > 0.5, // Random online status for demo - implement real logic later
            });
          }
        }
      }

      // Convert to array
      const conversationUserIds = Array.from(conversationMap.keys());

      if (conversationUserIds.length === 0) {
        setChatPreviews([]);
        setLoading(false);
        return;
      }

      // Fetch user details for all conversation partners using Promise.all
      const userDetailsPromises = conversationUserIds.map(userId => {
        // Special handling for AI doctor
        if (userId === 'ai-doctor') {
          return Promise.resolve(AI_DOCTOR);
        }
        return getUserById(userId);
      });

      const userDetailsResults = await Promise.all(userDetailsPromises);

      // Create enriched previews with proper user details
      const enrichedPreviews: ChatPreview[] = [];

      userDetailsResults.forEach((userDetails, index) => {
        const userId = conversationUserIds[index];
        const conversation = conversationMap.get(userId);

        if (userDetails && conversation) {
          enrichedPreviews.push({
            userId: userId,
            name: userDetails.fname || 'Unknown User',
            avatar: userDetails.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
            lastMessage: conversation.lastMessage,
            lastMessageTime: conversation.lastMessageTime,
            unreadCount: conversation.unreadCount,
            isOnline: conversation.isOnline,
            isAI: userDetails.isAI || false,
            userDetails: userDetails, // Store complete user details for navigation
          });
        }
      });

      // Sort by last message time
      enrichedPreviews.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

      setChatPreviews(enrichedPreviews);
    } catch (error) {
      console.error('Error processing messages:', error);
      setChatPreviews([]);
    } finally {
      setLoading(false);
    }
  }, [accountInfo?.userId]);

  // Fetch messages from Firestore directly
  const fetchMessages = useCallback(async () => {
    if (!accountInfo?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Query messages where current user is in users array
      const q = query(
        collection(db, "chat"),
        where("users", "array-contains", accountInfo.userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        };
      });

      await processMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setChatPreviews([]);
      setLoading(false);
    }
  }, [accountInfo?.userId, processMessages]);

  // Fetch chat previews (for manual refresh)
  const fetchChatPreviews = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  }, [fetchMessages]);

  // Format time for display
  const formatTime = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return `${days}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    chatPreviews,
    loading,
    refreshing,
    onRefresh,
    formatTime,
    fetchChatPreviews,
  };
};

export default useMessageList;
