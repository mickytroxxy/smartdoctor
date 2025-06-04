import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../helpers/api';
import useAuth from './useAuth';
import { Appointment } from '@/constants/Types';

interface UserStats {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalConsultations: number;
  totalPrescriptions: number;
  loading: boolean;
  error: string | null;
}

const useStats = () => {
  const { accountInfo } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    totalConsultations: 0,
    totalPrescriptions: 0,
    loading: true,
    error: null,
  });

  const fetchUserStats = useCallback(async () => {
    if (!accountInfo?.userId) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Determine the field to query based on user type
      const userField = accountInfo.isDoctor ? 'doctorId' : 'patientId';

      // Fetch appointments
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where(userField, '==', accountInfo.userId)
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];

      // Calculate appointment stats
      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
      const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
      const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;

      // Count consultations (completed video/clinic appointments)
      const totalConsultations = appointments.filter(apt =>
        apt.status === 'completed' && (apt.type === 'video' || apt.type === 'clinic')
      ).length;

      // Fetch prescriptions
      let totalPrescriptions = 0;
      
      if (accountInfo.isDoctor) {
        // For doctors, count prescriptions they've created
        const prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('doctorId', '==', accountInfo.userId)
        );
        const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
        totalPrescriptions = prescriptionsSnapshot.docs.length;
      } else {
        // For patients, count prescriptions they've received
        const prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', accountInfo.userId)
        );
        const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
        totalPrescriptions = prescriptionsSnapshot.docs.length;
      }

      setStats({
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        cancelledAppointments,
        totalConsultations,
        totalPrescriptions,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch stats'
      }));
    }
  }, [accountInfo]);

  // Fetch stats on mount and when user changes
  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  // Refresh stats function
  const refreshStats = useCallback(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return {
    ...stats,
    refreshStats,
  };
};

export default useStats;
