import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { setSelectedDoctor } from '../state/slices/doctorSlice';
import {
  setBookingStatus,
  addAppointment
} from '../state/slices/appointmentSlice';
import { bookAppointment, getUserById } from '../helpers/api';
import { useRouter } from 'expo-router';
import { currencyFormatter, showToast } from '../helpers/methods';
import { AppointmentStatus, AppointmentType, PlayMyJamProfile } from '@/constants/Types';
import { setActiveUser } from '../state/slices/accountInfo';
import { ItemListType } from '@/components/ui/Dropdown';
import useUpdates from './useUpdates';
import { useSecrets } from './useSecrets';
import { setCallback } from '../state/slices/camera';
import { setConfirmDialog } from '../state/slices/ConfirmDialog';
import { setModalState } from '../state/slices/modalState';
import { sendNotification } from './useOnesignal';


const useDoctor = (doctorId: string, medicalHistoryAttached: boolean = false) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { accountInfo } = useSelector((state: RootState) => state.accountSlice);
  const { selectedDoctor, doctors } = useSelector((state: RootState) => state.doctorSlice);
  const { bookingStatus } = useSelector((state: RootState) => state.appointmentSlice);
  const { location } = useSelector((state: RootState) => state.location);
  const [error, setError] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const {handleTransaction} = useUpdates()
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('surgery');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const {secrets} = useSecrets();

  // Helper function to send notification to doctor
  const sendNotificationToDoctor = useCallback(async (
    title: string,
    body: string,
    data: any = {}
  ) => {
    try {
      if (selectedDoctor?.userId) {
        const doctorData = await getUserById(selectedDoctor.userId);
        if (doctorData?.notificationToken && !doctorData.notificationToken.startsWith("ExponentPushToken")) {
          await sendNotification([doctorData.notificationToken], title, body, data);
        }
      }
    } catch (error) {
      console.error('Error sending notification to doctor:', error);
    }
  }, [selectedDoctor]);

  // Helper function to send notification to patient
  const sendNotificationToPatient = useCallback(async (
    title: string,
    body: string,
    data: any = {}
  ) => {
    try {
      if (accountInfo?.userId) {
        const patientData = await getUserById(accountInfo.userId);
        if (patientData?.notificationToken && !patientData.notificationToken.startsWith("ExponentPushToken")) {
          await sendNotification([patientData.notificationToken], title, body, data);
        }
      }
    } catch (error) {
      console.error('Error sending notification to patient:', error);
    }
  }, [accountInfo]);
  const [paymentMethods, setPaymentMethods] = useState<ItemListType[]>([]);

  // Initialize payment methods based on user's medical aid status
  useEffect(() => {
    const basePaymentMethods = [
      { id: 'cash', label: 'Cash Payment', selected: true, subtitle: 'Pay at the surgery' },
      { id: 'card', label: 'Card Payment', selected: false, subtitle: 'Pay with account balance' }
    ];

    // Add medical aid option if user has uploaded medical aid document
    if (accountInfo?.medicalAid?.documentUrl) {
      basePaymentMethods.push({
        id: 'medical_aid',
        label: 'Medical Aid',
        selected: false,
        subtitle: `${accountInfo.medicalAid.provider} - ${accountInfo.medicalAid.memberNumber}`
      });
    }

    setPaymentMethods(basePaymentMethods);
  }, [accountInfo?.medicalAid]);

  // Helper function to handle payment method change
  const handlePaymentMethodChange = (selectedItem: ItemListType) => {
    setPaymentMethods(prev =>
      prev.map(item => ({
        ...item,
        selected: item.id === selectedItem.id
      }))
    );
  };

  // Get selected payment method
  const selectedPaymentMethod = paymentMethods.find(method => method.selected);
  const paymentMethod = selectedPaymentMethod?.id as 'cash' | 'card' || 'cash';
  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      const doctor = doctors.find(doctor => doctor.userId === doctorId);
      if (doctor) {
        dispatch(setSelectedDoctor(doctor));
      } else {
        setError('Doctor not found');
      }
    };

    fetchDoctor();
    return () => {
      dispatch(setSelectedDoctor(null));
    };
  }, [doctorId, dispatch]);

  // Handle booking appointment
  
  const handleBookAppointment = useCallback(async (status:boolean) => {
    
    if(status){
      dispatch(setBookingStatus('loading'));
      try {
        const appointmentData = {
          doctorId: selectedDoctor?.userId || '',
          doctorName: selectedDoctor?.fname || '',
          paymentMethod,
          doctorSpecialty: selectedDoctor?.specialty || 'General Practitioner',
          doctorAvatar: selectedDoctor?.avatar || '',
          patientId: accountInfo?.userId || '',
          patientName: accountInfo?.fname || '',
          date: appointmentDate,
          time: appointmentTime,
          status: 'pending' as AppointmentStatus,
          type: appointmentType,
          symptoms,
          notes,
          medicalHistoryAttached,
          fee: appointmentType === 'home' && selectedDoctor?.supportsHomeVisit
            ? (selectedDoctor.fees || 0) + (selectedDoctor.homeVisitFee || 0)
            : (selectedDoctor?.fees || 0),
          // Include medical aid details if payment method is medical aid
          ...(paymentMethod === 'medical_aid' && accountInfo?.medicalAid && {
            medicalAidDetails: {
              provider: accountInfo.medicalAid.provider,
              memberNumber: accountInfo.medicalAid.memberNumber,
              documentUrl: accountInfo.medicalAid.documentUrl,
              isVerified: accountInfo.medicalAid.isVerified || false,
            },
          }),
          ...(appointmentType === 'home' && {
            location: {
              text: location.text || 'Custom location',
              latitude: location.latitude,
              longitude: location.longitude,
            },
          }),
        };
  
        const appointment = await bookAppointment(appointmentData);
  
        if (appointment) {
          dispatch(addAppointment(appointment));
          dispatch(setBookingStatus('success'));
          dispatch(setModalState({isVisible:true,attr:{headerText:'SUCCESS STATUS',message:'Your booking was successful',status:true}}));

          // Send notification to doctor about new appointment
          const medicalHistoryNote = medicalHistoryAttached ? ' with medical history attached' : '';
          await sendNotificationToDoctor(
            'New Appointment Booking',
            `${accountInfo?.fname || 'A patient'} has booked a ${appointmentType} appointment for ${appointmentDate} at ${appointmentTime}${medicalHistoryNote}`,
            {
              type: 'appointment_booking',
              appointmentId: appointment.id,
              patientId: accountInfo?.userId,
              patientName: accountInfo?.fname,
              medicalHistoryAttached: medicalHistoryAttached
            }
          );

          router.push('/appointments');
        } else {
          dispatch(setBookingStatus('error'));
          showToast('Failed to book appointment');
        }
      } catch (err) {
        dispatch(setBookingStatus('error'));
        showToast('Failed to book appointment');
      }
    }else{
      dispatch(setModalState({isVisible:true,attr:{headerText:'SUCCESS STATUS',message:'Your booking did not go through, please try again',status:false}}));
    }
  }, [
    dispatch,
    accountInfo,
    selectedDoctor,
    appointmentDate,
    appointmentTime,
    appointmentType,
    symptoms,
    notes,
    selectedPaymentMethod,
    location,
    router
  ]);
  const bookAppointmentCheckAsyc = async() => {
    if (!accountInfo || !selectedDoctor) {
      showToast('Please log in to book an appointment');
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      showToast('Please select appointment date and time');
      return;
    }

    if (appointmentType === 'home' && !location.latitude) {
      showToast('Please provide your location for home visit');
      return;
    }
    const paymentText = paymentMethod === 'card' ? 'card payment' :
                       paymentMethod === 'medical_aid' ? 'medical aid' : 'cash payment';

    dispatch(setConfirmDialog({isVisible: true,text: `Are you sure you want to book this appointment with ${paymentText}?`,okayBtn: 'Confirm',cancelBtn: 'Cancel',severity: true,response: (res:boolean) => {
      if(res){
        if(paymentMethod === 'card'){
          const balance = accountInfo?.balance || 0;
          const cost = appointmentType === 'home' && selectedDoctor?.supportsHomeVisit
              ? (selectedDoctor?.fees || 0) + (selectedDoctor.homeVisitFee || 0)
              : (selectedDoctor?.fees || 0);

          async function handleTopUp() {
            const response = await handleTransaction({amount:cost,receiver:secrets?.appAccountId || '', sender:accountInfo?.userId || '', msg:'Transfer successful', type:'transfer',description:`${appointmentType} Appointment`});
            handleBookAppointment(response as boolean);
          }
          if(balance < cost){
            const bal = cost - balance;
            router.push({pathname:'/WebBrowser',params:{amount:bal,type:'book'}});
            dispatch(setCallback(handleTopUp))
            showToast(`Your account balance is low, please top up your account by ${currencyFormatter(bal)}`)
          }else{
            handleTopUp();
          }
        }else if(paymentMethod === 'medical_aid'){
          // For medical aid, book appointment directly
          // The doctor will handle medical aid claims separately
          handleBookAppointment(true);
          showToast('Appointment booked with medical aid. Please bring your medical aid card to the appointment.');
        }else{
          // Cash payment
          handleBookAppointment(true);
        }
      }
    }}));
  }

  // Handle chat with doctor
  const handleChatWithDoctor = useCallback(async (user:PlayMyJamProfile) => {
    dispatch(setActiveUser(user));
    router.push('/chat/chat');
  }, []);

  return {
    doctor: selectedDoctor,
    error,
    bookingStatus,
    appointmentDate,
    setAppointmentDate,
    appointmentTime,
    setAppointmentTime,
    appointmentType,
    setAppointmentType,
    symptoms,
    setSymptoms,
    notes,
    setNotes,
    paymentMethods,
    handlePaymentMethodChange,
    bookAppointmentCheckAsyc,
    handleChatWithDoctor,
    accountInfo
  };
};

export default useDoctor;
