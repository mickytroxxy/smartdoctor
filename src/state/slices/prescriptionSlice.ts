import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';
import {
  createPrescription,
  getPrescriptionsByAppointment,
  getPrescriptionsByPatient,
  getAllPrescriptions,
  updatePrescription,
  Prescription
} from '@/src/helpers/api';
import { showToast } from '@/src/helpers/methods';

// Define prescription status type
export type PrescriptionStatus = 'pending' | 'collected' | 'cancelled';

// Define the medication type
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

// Define the new prescription form state
export interface PrescriptionForm {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  medications: Medication[];
  instructions: string;
}

// Define the prescription state
interface PrescriptionState {
  prescriptions: Prescription[];
  loading: boolean;
  error: string | null;
  form: PrescriptionForm;
  formStatus: 'idle' | 'loading' | 'success' | 'error';
}

// Define the initial empty medication
const emptyMedication: Medication = {
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  notes: ''
};

// Define the initial state
const initialState: PrescriptionState = {
  prescriptions: [],
  loading: false,
  error: null,
  form: {
    appointmentId: '',
    doctorId: '',
    patientId: '',
    medications: [{ ...emptyMedication }],
    instructions: ''
  },
  formStatus: 'idle'
};

// Create the prescription slice
const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    // Set prescriptions
    setPrescriptions: (state, action: PayloadAction<Prescription[]>) => {
      state.prescriptions = action.payload;
    },

    // Add a prescription
    addPrescription: (state, action: PayloadAction<Prescription>) => {
      state.prescriptions.unshift(action.payload);
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Initialize form with appointment data
    initializeForm: (state, action: PayloadAction<{
      appointmentId: string;
      doctorId: string;
      patientId: string;
    }>) => {
      state.form = {
        ...action.payload,
        medications: [{ ...emptyMedication }],
        instructions: ''
      };
      state.formStatus = 'idle';
    },

    // Reset form to initial state
    resetForm: (state) => {
      state.form = { ...initialState.form };
      state.formStatus = 'idle';
    },

    // Add a medication to the form
    addMedication: (state) => {
      state.form.medications.push({ ...emptyMedication });
    },

    // Remove a medication from the form
    removeMedication: (state, action: PayloadAction<number>) => {
      state.form.medications = state.form.medications.filter((_, index) => index !== action.payload);
    },

    // Update a medication field
    updateMedication: (state, action: PayloadAction<{
      index: number;
      field: keyof Medication;
      value: string;
    }>) => {
      const { index, field, value } = action.payload;
      if (state.form.medications[index]) {
        state.form.medications[index][field] = value;
      }
    },

    // Update instructions
    updateInstructions: (state, action: PayloadAction<string>) => {
      state.form.instructions = action.payload;
    },

    // Set form status
    setFormStatus: (state, action: PayloadAction<PrescriptionState['formStatus']>) => {
      state.formStatus = action.payload;
    }
  }
});

// Export actions
export const {
  setPrescriptions,
  addPrescription,
  setLoading,
  setError,
  initializeForm,
  resetForm,
  addMedication,
  removeMedication,
  updateMedication,
  updateInstructions,
  setFormStatus
} = prescriptionSlice.actions;

// Thunk to fetch prescriptions by appointment
export const fetchPrescriptionsByAppointment = (appointmentId: string): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const prescriptions = await getPrescriptionsByAppointment(appointmentId);
    dispatch(setPrescriptions(prescriptions));
  } catch (error) {
    dispatch(setError('Failed to fetch prescriptions'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk to fetch prescriptions by patient
export const fetchPrescriptionsByPatient = (patientId: string): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const prescriptions = await getPrescriptionsByPatient(patientId);
    dispatch(setPrescriptions(prescriptions));
  } catch (error) {
    dispatch(setError('Failed to fetch prescriptions'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk to create a prescription
export const createPrescriptionThunk = (): AppThunk => async (dispatch, getState) => {
  const { form } = getState().prescriptions;

  // Validate form data
  if (form.medications.some(med =>
    !med.name.trim() ||
    !med.dosage.trim() ||
    !med.frequency.trim() ||
    !med.duration.trim()
  )) {
    showToast('Please fill in all medication fields');
    return;
  }

  if (!form.instructions.trim()) {
    showToast('Please add instructions');
    return;
  }

  dispatch(setFormStatus('loading'));

  try {
    const prescriptionData = {
      appointmentId: form.appointmentId,
      doctorId: form.doctorId,
      patientId: form.patientId,
      medications: form.medications,
      instructions: form.instructions,
      status: 'pending' // Set default status
    };

    const result = await createPrescription(prescriptionData);

    if (result) {
      dispatch(addPrescription(result));
      dispatch(setFormStatus('success'));
      dispatch(resetForm());
      showToast('Prescription created successfully');
    } else {
      dispatch(setFormStatus('error'));
      showToast('Failed to create prescription');
    }
  } catch (error) {
    dispatch(setFormStatus('error'));
    showToast('Failed to create prescription');
  }
};

// Thunk to fetch all prescriptions
export const fetchAllPrescriptions = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const prescriptions = await getAllPrescriptions();
    dispatch(setPrescriptions(prescriptions));
  } catch (error) {
    dispatch(setError('Failed to fetch prescriptions'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk to update prescription status
export const updatePrescriptionStatus = (
  prescriptionId: string,
  status: PrescriptionStatus
): AppThunk => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const result = await updatePrescription(prescriptionId, { status });

    if (result) {
      // Update the prescription in the state
      const updatedPrescriptions = getState().prescriptions.prescriptions.map(
        prescription => prescription.id === prescriptionId
          ? { ...prescription, status }
          : prescription
      );

      dispatch(setPrescriptions(updatedPrescriptions));
      showToast(`Prescription ${status === 'collected' ? 'marked as collected' : 'status updated'}`);
    } else {
      showToast('Failed to update prescription status');
    }
  } catch (error) {
    dispatch(setError('Failed to update prescription status'));
    showToast('Failed to update prescription status');
  } finally {
    dispatch(setLoading(false));
  }
};

// Export the reducer
export default prescriptionSlice.reducer;
