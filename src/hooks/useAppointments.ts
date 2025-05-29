import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import {
  setAppointments,
  setLoading,
  setError,
  updateAppointment,
  setSelectedAppointment
} from '../state/slices/appointmentSlice';
import {
  getUserAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  createPrescription,
  getPrescriptionsByAppointment,
  getUserById,
  getUserDetailsByUserId
} from '../helpers/api';
import { Appointment, AppointmentStatus } from '../types/doctorTypes';
import { useRouter } from 'expo-router';
import { showToast } from '../helpers/methods';
import { Prescription } from '../helpers/api';
import { setActiveUser } from '../state/slices/accountInfo';

const useAppointments = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { accountInfo, activeUser } = useSelector((state: RootState) => state.accountSlice);
  const {
    appointments,
    selectedAppointment,
    loading,
    error
  } = useSelector((state: RootState) => state.appointmentSlice);

  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newPrescription, setNewPrescription] = useState<{
    medications: { name: string; dosage: string; frequency: string; duration: string; notes?: string }[];
    instructions: string;
  }>({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
    instructions: ''
  });

  // Fetch appointments on component mount
  useEffect(() => {
    if (accountInfo?.userId) {
      fetchAppointments();
    }
  }, [accountInfo]);

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    if (!accountInfo?.userId) {
      showToast('Please log in to view appointments');
      return;
    }

    dispatch(setLoading(true));

    try {
      // Pass isDoctor flag to get the right appointments
      const appointments = await getUserAppointments(
        accountInfo.userId,
        accountInfo.isDoctor
      );
      dispatch(setAppointments(appointments));
    } catch (err) {
      dispatch(setError('Failed to fetch appointments'));
      showToast('Failed to fetch appointments');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, accountInfo]);

  // Get filtered appointments
  const filteredAppointments = useCallback(() =>
    filter === 'all'
      ? appointments
      : appointments.filter(appointment => appointment.status === filter)
  , [appointments, filter]);

  // Handle appointment selection
  const handleSelectAppointment = useCallback((appointment: Appointment) => {
    dispatch(setSelectedAppointment(appointment));

    // Fetch prescriptions for this appointment
    fetchPrescriptions(appointment.id);
  }, [dispatch]);

  // Fetch prescriptions for an appointment
  const fetchPrescriptions = useCallback(async (appointmentId: string) => {
    try {
      const result = await getPrescriptionsByAppointment(appointmentId);
      setPrescriptions(result);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  }, []);

  // Handle appointment status update
  const handleUpdateStatus = useCallback(async (
    appointmentId: string,
    status: AppointmentStatus,
    notes?: string
  ) => {
    dispatch(setLoading(true));

    try {
      const success = await updateAppointmentStatus(appointmentId, status, notes);

      if (success) {
        // Find and update the appointment in the state
        const updatedAppointment = appointments.find(a => a.id === appointmentId);

        if (updatedAppointment) {
          const updated = { ...updatedAppointment, status, notes: notes || updatedAppointment.notes };
          dispatch(updateAppointment(updated));

          if (selectedAppointment?.id === appointmentId) {
            dispatch(setSelectedAppointment(updated));
          }

          showToast(`Appointment ${status}`);
          fetchAppointments(); // Refresh the list
        }
      } else {
        showToast('Failed to update appointment status');
      }
    } catch (err) {
      showToast('Failed to update appointment status');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, appointments, selectedAppointment, fetchAppointments]);

  // Handle appointment rescheduling
  const handleReschedule = useCallback(async (
    appointmentId: string,
    newDate: string,
    newTime: string
  ) => {
    dispatch(setLoading(true));

    try {
      const success = await rescheduleAppointment(appointmentId, newDate, newTime);

      if (success) {
        // Find and update the appointment in the state
        const updatedAppointment = appointments.find(a => a.id === appointmentId);

        if (updatedAppointment) {
          const updated = {
            ...updatedAppointment,
            date: newDate,
            time: newTime,
            status: 'confirmed' as AppointmentStatus
          };

          dispatch(updateAppointment(updated));

          if (selectedAppointment?.id === appointmentId) {
            dispatch(setSelectedAppointment(updated));
          }

          showToast('Appointment rescheduled successfully');
          fetchAppointments(); // Refresh the list
        }
      } else {
        showToast('Failed to reschedule appointment');
      }
    } catch (err) {
      showToast('Failed to reschedule appointment');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, appointments, selectedAppointment, fetchAppointments]);

  // Handle prescription creation
  const handleCreatePrescription = useCallback(async () => {
    if (!selectedAppointment) {
      showToast('No appointment selected');
      return;
    }

    // Validate prescription data
    if (newPrescription.medications.some(med => !med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim())) {
      showToast('Please fill in all medication fields');
      console.log(newPrescription)
      return;
    }

    if (!newPrescription.instructions) {
      showToast('Please add instructions');
      return;
    }

    dispatch(setLoading(true));

    try {
      const prescriptionData = {
        appointmentId: selectedAppointment.id,
        doctorId: selectedAppointment.doctorId,
        doctorName: selectedAppointment.doctorName,
        doctorSpecialty: selectedAppointment.doctorSpecialty || 'General Practitioner',
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        medications: newPrescription.medications,
        instructions: newPrescription.instructions,
        status: 'pending' // Set default status
      };

      const result = await createPrescription(prescriptionData);

      if (result) {
        // Update appointment status to completed
        await handleUpdateStatus(selectedAppointment.id, 'completed');

        // Add the new prescription to the list
        setPrescriptions(prev => [result, ...prev]);

        // Reset the form
        setNewPrescription({
          medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
          instructions: ''
        });

        showToast('Prescription created successfully');
      } else {
        showToast('Failed to create prescription');
      }
    } catch (err) {
      showToast('Failed to create prescription');
    } finally {
      dispatch(setLoading(false));
    }
  }, [selectedAppointment, newPrescription, handleUpdateStatus]);

  // Handle adding a medication to the prescription
  const handleAddMedication = useCallback(() => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]
    }));
  }, []);

  // Handle removing a medication from the prescription
  const handleRemoveMedication = useCallback((index: number) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  }, []);

  // Handle updating a medication
  const handleUpdateMedication = useCallback((index: number, field: string, value: string) => {
    setNewPrescription(prev => {
      const updatedMedications = [...prev.medications];
      updatedMedications[index] = { ...updatedMedications[index], [field]: value };
      return { ...prev, medications: updatedMedications };
    });
  }, []);

  // Handle updating instructions
  const handleUpdateInstructions = useCallback((instructions: string) => {
    setNewPrescription(prev => ({ ...prev, instructions }));
  }, []);

  // Handle initiating a call with the patient
  const handleInitiateCall = useCallback(async (patientId: string) => {
    try {
      dispatch(setLoading(true));
      const patient = await getUserDetailsByUserId(patientId);
      if (patient?.length > 0) {
        dispatch(setActiveUser(patient?.[0]));
        router.push('/DoctorCall');
      } else {
        showToast('Failed to fetch patient details');
      }
    } catch (err) {
      showToast('Failed to initiate call');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, router]);

  return {
    appointments: filteredAppointments(),
    selectedAppointment,
    loading,
    error,
    filter,
    setFilter,
    prescriptions,
    newPrescription,
    fetchAppointments,
    handleSelectAppointment,
    handleUpdateStatus,
    handleReschedule,
    handleCreatePrescription,
    handleAddMedication,
    handleRemoveMedication,
    handleUpdateMedication,
    handleUpdateInstructions,
    handleInitiateCall,
    accountInfo,
    activeUser
  };
};

export default useAppointments;
