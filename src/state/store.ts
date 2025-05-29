import { combineReducers, configureStore, Action, ThunkAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import ExpoFileSystemStorage from 'redux-persist-expo-filesystem';
import location from './slices/location';
import modalData from './slices/modalData';
import accountSlice from './slices/accountInfo';
import ConfirmDialog from './slices/ConfirmDialog';
import modalState from './slices/modalState';
import camera from './slices/camera';
import globalVariables from './slices/globalVariables';
import doctorSlice from './slices/doctorSlice';
import appointmentSlice from './slices/appointmentSlice';
import chatSlice from './slices/chatSlice';
import callSlice from './slices/callSlice';
import prescriptionSlice from './slices/prescriptionSlice';
const rootReducer = combineReducers({
  location,
  callSlice,
  globalVariables,
  modalData,
  accountSlice,
  ConfirmDialog,
  modalState,
  camera,
  doctorSlice,
  appointmentSlice,
  chatSlice,
  prescriptions: prescriptionSlice,
});

const persistConfig = {
  key: 'root',
  storage: ExpoFileSystemStorage,
  blacklist: ['modalData', 'modalState', 'camera', 'ConfirmDialog', 'game', 'chatSlice', 'prescriptions'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export const persistor = persistStore(store);