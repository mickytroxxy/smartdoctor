import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DoctorSpecialty, PlayMyJamProfile } from '@/constants/Types';

interface DoctorState {
  doctors: PlayMyJamProfile[];
  filteredDoctors: PlayMyJamProfile[];
  selectedDoctor: PlayMyJamProfile | null;
  loading: boolean;
  error: string | null;
  filters: {
    specialty: DoctorSpecialty | null;
    minRating: number;
    maxDistance: number;
    supportsHomeVisit: boolean;
  };
}

const initialState: DoctorState = {
  doctors: [],
  filteredDoctors: [],
  selectedDoctor: null,
  loading: false,
  error: null,
  filters: {
    specialty: null,
    minRating: 0,
    maxDistance: 50, // in kilometers
    supportsHomeVisit: false,
  },
};

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setDoctors: (state, action: PayloadAction<PlayMyJamProfile[]>) => {
      state.doctors = action.payload;
      state.filteredDoctors = applyFilters(action.payload, state.filters);
    },
    setSelectedDoctor: (state, action: PayloadAction<PlayMyJamProfile | null>) => {
      state.selectedDoctor = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<DoctorState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredDoctors = applyFilters(state.doctors, state.filters);
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredDoctors = state.doctors;
    },
  },
});

// Helper function to apply filters
const applyFilters = (doctors: PlayMyJamProfile[], filters: DoctorState['filters']) => {
  return doctors.filter((doctor) => {
    // Always include AI Doctor at the top
    if (doctor.isAI) return true;

    // Filter by specialty
    if (filters.specialty && doctor.specialty !== filters.specialty) return false;

    // Filter by rating
    if (doctor.rating && doctor.rating.average < filters.minRating) return false;

    // Filter by home visit support
    if (filters.supportsHomeVisit && !doctor.supportsHomeVisit) return false;

    return true;
  });
};

export const {
  setDoctors,
  setSelectedDoctor,
  setLoading,
  setError,
  setFilters,
  resetFilters,
} = doctorSlice.actions;

export default doctorSlice.reducer;
