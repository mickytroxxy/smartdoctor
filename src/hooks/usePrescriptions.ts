import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/state/store';
import {
  fetchPrescriptionsByAppointment,
  fetchPrescriptionsByPatient,
  fetchAllPrescriptions,
  createPrescriptionThunk,
  updatePrescriptionStatus,
  initializeForm,
  resetForm,
  addMedication,
  removeMedication,
  updateMedication,
  updateInstructions,
  Medication,
  PrescriptionStatus
} from '@/src/state/slices/prescriptionSlice';

/**
 * Custom hook for managing prescriptions
 */
const usePrescriptions = () => {
  const dispatch = useDispatch();
  const {
    prescriptions,
    loading,
    error,
    form,
    formStatus
  } = useSelector((state: RootState) => state.prescriptions);

  /**
   * Initialize the prescription form with appointment data
   */
  const initializePrescriptionForm = (appointmentId: string, doctorId: string, patientId: string) => {
    dispatch(initializeForm({ appointmentId, doctorId, patientId }));
  };

  /**
   * Reset the prescription form
   */
  const resetPrescriptionForm = () => {
    dispatch(resetForm());
  };

  /**
   * Add a new medication to the form
   */
  const handleAddMedication = () => {
    dispatch(addMedication());
  };

  /**
   * Remove a medication from the form
   */
  const handleRemoveMedication = (index: number) => {
    dispatch(removeMedication(index));
  };

  /**
   * Update a medication field
   */
  const handleUpdateMedication = (index: number, field: keyof Medication, value: string) => {
    dispatch(updateMedication({ index, field, value }));
  };

  /**
   * Update the instructions field
   */
  const handleUpdateInstructions = (value: string) => {
    dispatch(updateInstructions(value));
  };

  /**
   * Create a new prescription
   */
  const handleCreatePrescription = () => {
    dispatch(createPrescriptionThunk());
  };

  /**
   * Load prescriptions for an appointment
   */
  const loadPrescriptionsByAppointment = (appointmentId: string) => {
    dispatch(fetchPrescriptionsByAppointment(appointmentId));
  };

  /**
   * Load prescriptions for a patient
   */
  const loadPrescriptionsByPatient = (patientId: string) => {
    dispatch(fetchPrescriptionsByPatient(patientId));
  };

  /**
   * Fetch all prescriptions
   */
  const fetchPrescriptions = () => {
    dispatch(fetchAllPrescriptions());
  };

  /**
   * Update prescription status
   */
  const updatePrescriptionStatusFn = (prescriptionId: string, status: PrescriptionStatus) => {
    dispatch(updatePrescriptionStatus(prescriptionId, status));
  };

  /**
   * Check if the prescription form is valid
   */
  const isValidPrescription = () => {
    // Check if at least one medication is added
    if (form.medications.length === 0) return false;

    // Check if all medications have required fields
    for (const medication of form.medications) {
      if (!medication.name.trim() ||
          !medication.dosage.trim() ||
          !medication.frequency.trim() ||
          !medication.duration.trim()) {
        return false;
      }
    }

    // Check if instructions are provided
    return !!form.instructions.trim();
  };

  return {
    // State
    prescriptions,
    loading,
    error,
    form,
    formStatus,

    // Form validation
    isValidPrescription,

    // Form actions
    initializePrescriptionForm,
    resetPrescriptionForm,
    handleAddMedication,
    handleRemoveMedication,
    handleUpdateMedication,
    handleUpdateInstructions,

    // API actions
    handleCreatePrescription,
    loadPrescriptionsByAppointment,
    loadPrescriptionsByPatient,
    fetchPrescriptions,
    updatePrescriptionStatus: updatePrescriptionStatusFn
  };
};

export default usePrescriptions;
