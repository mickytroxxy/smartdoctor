import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment } from '@/src/types/doctorTypes';

interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  bookingStatus: 'idle' | 'loading' | 'success' | 'error';
}

const initialState: AppointmentState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
  bookingStatus: 'idle',
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(
        (appointment) => appointment.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    setSelectedAppointment: (state, action: PayloadAction<Appointment | null>) => {
      state.selectedAppointment = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setBookingStatus: (state, action: PayloadAction<AppointmentState['bookingStatus']>) => {
      state.bookingStatus = action.payload;
    },
    resetBookingStatus: (state) => {
      state.bookingStatus = 'idle';
    },
  },
});

export const {
  setAppointments,
  addAppointment,
  updateAppointment,
  setSelectedAppointment,
  setLoading,
  setError,
  setBookingStatus,
  resetBookingStatus,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
