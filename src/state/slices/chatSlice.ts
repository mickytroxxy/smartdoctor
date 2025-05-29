import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, ChatRoom } from '@/src/types/doctorTypes';

interface ChatState {
  chatRooms: ChatRoom[];
  selectedChatRoom: ChatRoom | null;
  messages: Record<string, ChatMessage[]>; // chatRoomId -> messages
  loading: boolean;
  error: string | null;
  sendingMessage: boolean;
}

const initialState: ChatState = {
  chatRooms: [],
  selectedChatRoom: null,
  messages: {},
  loading: false,
  error: null,
  sendingMessage: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatRooms: (state, action: PayloadAction<ChatRoom[]>) => {
      state.chatRooms = action.payload;
    },
    addChatRoom: (state, action: PayloadAction<ChatRoom>) => {
      if (!state.chatRooms.some(room => room.id === action.payload.id)) {
        state.chatRooms.push(action.payload);
      }
    },
    updateChatRoom: (state, action: PayloadAction<Partial<ChatRoom> & { id: string }>) => {
      const index = state.chatRooms.findIndex(
        (room) => room.id === action.payload.id
      );
      if (index !== -1) {
        state.chatRooms[index] = { ...state.chatRooms[index], ...action.payload };
      }
    },
    setSelectedChatRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.selectedChatRoom = action.payload;

      // Reset unread count when selecting a chat room
      if (action.payload) {
        const index = state.chatRooms.findIndex(
          (room) => room.id === action.payload.id
        );
        if (index !== -1) {
          state.chatRooms[index].unreadCount = 0;
        }
      }
    },
    setMessages: (state, action: PayloadAction<{ chatRoomId: string; messages: ChatMessage[] }>) => {
      const { chatRoomId, messages } = action.payload;
      state.messages[chatRoomId] = messages;
    },
    addMessage: (state, action: PayloadAction<{ chatRoomId: string; message: ChatMessage }>) => {
      const { chatRoomId, message } = action.payload;
      if (!state.messages[chatRoomId]) {
        state.messages[chatRoomId] = [];
      }

      // Check if message already exists to avoid duplicates
      const messageExists = state.messages[chatRoomId].some(
        msg => msg._id === message._id
      );

      if (!messageExists) {
        state.messages[chatRoomId].unshift(message);
      }

      // Update last message in chat room
      const roomIndex = state.chatRooms.findIndex(room => room.id === chatRoomId);
      if (roomIndex !== -1) {
        state.chatRooms[roomIndex].lastMessage = message.text;
        state.chatRooms[roomIndex].lastMessageTime =
          message.createdAt instanceof Date
            ? message.createdAt.getTime()
            : Date.now();

        // Increment unread count if not the selected chat room
        if (!state.selectedChatRoom || state.selectedChatRoom.id !== chatRoomId) {
          state.chatRooms[roomIndex].unreadCount += 1;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSendingMessage: (state, action: PayloadAction<boolean>) => {
      state.sendingMessage = action.payload;
    },
  },
});

export const {
  setChatRooms,
  addChatRoom,
  updateChatRoom,
  setSelectedChatRoom,
  setMessages,
  addMessage,
  setLoading,
  setError,
  setSendingMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
