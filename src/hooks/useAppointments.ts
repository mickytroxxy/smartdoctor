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
  getDoctorAppointmentsWithMedicalAid,
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
import { sendNotification } from './useOnesignal';
import useUpdates from './useUpdates';
import { useSecrets } from './useSecrets';
import { setModalState } from '../state/slices/modalState';

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

  // Payment handling hooks
  const { handleTransaction } = useUpdates();
  const { secrets } = useSecrets();

  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newPrescription, setNewPrescription] = useState<{
    medications: { name: string; dosage: string; frequency: string; duration: string; notes?: string }[];
    instructions: string;
  }>({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
    instructions: ''
  });

  // Helper function to send notification to user
  const sendNotificationToUser = useCallback(async (
    userId: string,
    title: string,
    body: string,
    data: any = {}
  ) => {
    try {
      const userData = await getUserById(userId);
      if (userData?.notificationToken && !userData.notificationToken.startsWith("ExponentPushToken")) {
        await sendNotification([userData.notificationToken], title, body, data);
      }
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }, []);

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
      // Use enhanced function for doctors to get medical aid details
      const appointments = accountInfo.isDoctor
        ? await getDoctorAppointmentsWithMedicalAid(accountInfo.userId)
        : await getUserAppointments(accountInfo.userId, false);

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
          // Handle payment logic based on status change
          await handlePaymentLogic(updatedAppointment, status);

          const updated = { ...updatedAppointment, status, notes: notes || updatedAppointment.notes };
          dispatch(updateAppointment(updated));

          if (selectedAppointment?.id === appointmentId) {
            dispatch(setSelectedAppointment(updated));
          }

          // Send notification to the other party about status change
          const recipientId = accountInfo?.isDoctor ? updatedAppointment.patientId : updatedAppointment.doctorId;
          const recipientName = accountInfo?.isDoctor ? updatedAppointment.patientName : updatedAppointment.doctorName;
          const senderName = accountInfo?.isDoctor ? `Dr. ${accountInfo.fname}` : accountInfo?.fname;

          let notificationTitle = '';
          let notificationBody = '';

          switch (status) {
            case 'confirmed':
              notificationTitle = 'Appointment Confirmed';
              notificationBody = `Your appointment with ${senderName} has been confirmed for ${updatedAppointment.date} at ${updatedAppointment.time}`;
              break;
            case 'cancelled':
              notificationTitle = 'Appointment Cancelled';
              notificationBody = `Your appointment with ${senderName} has been cancelled`;
              break;
            case 'completed':
              notificationTitle = 'Appointment Completed';
              notificationBody = `Your appointment with ${senderName} has been completed`;
              break;
          }

          if (notificationTitle && recipientId) {
            await sendNotificationToUser(
              recipientId,
              notificationTitle,
              notificationBody,
              {
                type: 'appointment_status_update',
                appointmentId: appointmentId,
                status: status,
                senderName: senderName
              }
            );
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
  }, [dispatch, appointments, selectedAppointment, fetchAppointments, handleTransaction, secrets]);

  // Handle payment logic for appointment status changes
  const handlePaymentLogic = useCallback(async (
    appointment: Appointment,
    newStatus: AppointmentStatus
  ) => {
    // Only process payments for card payments
    if (appointment.paymentMethod !== 'card') {
      return;
    }

    const appAccountId = secrets?.appAccountId;
    const commissionFee = secrets?.commissionFee || 15;

    if (!appAccountId) {
      console.error('App account ID not found');
      return;
    }

    try {
      if (newStatus === 'cancelled' && accountInfo?.isDoctor) {
        // Doctor cancelled - refund full amount to patient
        await handleTransaction({
          amount: appointment.fee,
          receiver: appointment.patientId,
          sender: appAccountId,
          msg: 'Appointment cancelled - full refund processed',
          type: 'transfer',
          description: `Refund for cancelled appointment with Dr. ${appointment.doctorName}`,
          createStatement: true
        });
        dispatch(setModalState({isVisible:true,attr:{headerText:'SUCCESS STATUS',message:'Patient refunded successfully',status:true}}));
      } else if (newStatus === 'completed' && accountInfo?.isDoctor) {
        // Doctor completed appointment - transfer commission-adjusted amount to doctor
        const commissionAmount = (appointment.fee * commissionFee) / 100;
        const doctorAmount = appointment.fee - commissionAmount;

        await handleTransaction({
          amount: doctorAmount,
          receiver: appointment.doctorId,
          sender: appAccountId,
          msg: `Payment for completed appointment with ${appointment.patientName}`,
          type: 'transfer',
          description: `Appointment fee`,
          createStatement: true
        });
        dispatch(setModalState({isVisible:true,attr:{headerText:'SUCCESS STATUS',message:`Payment of R${doctorAmount.toFixed(2)} transferred to your account`,status:true}}));
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      showToast('Payment processing failed');
    }
  }, [handleTransaction, secrets, accountInfo]);

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

          // Send notification to the other party about rescheduling
          const recipientId = accountInfo?.isDoctor ? updatedAppointment.patientId : updatedAppointment.doctorId;
          const senderName = accountInfo?.isDoctor ? `Dr. ${accountInfo.fname}` : accountInfo?.fname;

          if (recipientId) {
            await sendNotificationToUser(
              recipientId,
              'Appointment Rescheduled',
              `Your appointment with ${senderName} has been rescheduled to ${newDate} at ${newTime}`,
              {
                type: 'appointment_reschedule',
                appointmentId: appointmentId,
                newDate: newDate,
                newTime: newTime,
                senderName: senderName
              }
            );
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

        // Send notification to patient about new prescription
        await sendNotificationToUser(
          selectedAppointment.patientId,
          'New Prescription Available',
          `Dr. ${selectedAppointment.doctorName} has created a new prescription for you`,
          {
            type: 'prescription_created',
            prescriptionId: result.id,
            appointmentId: selectedAppointment.id,
            doctorName: selectedAppointment.doctorName
          }
        );

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
