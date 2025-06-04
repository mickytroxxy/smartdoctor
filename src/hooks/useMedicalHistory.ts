import { useState, useEffect, useCallback } from 'react';
import { MedicalHistory } from '@/constants/Types';
import { updateData, getUserById } from '../helpers/api';
import { showToast } from '../helpers/methods';
import useAuth from './useAuth';

const useMedicalHistory = () => {
  const { accountInfo } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize empty medical history
  const initializeEmptyHistory = useCallback((): MedicalHistory => {
    return {
      id: `medical_${accountInfo?.userId}_${Date.now()}`,
      userId: accountInfo?.userId || '',
      emergencyContact: {
        name: '',
        phoneNumber: '',
      },
      lifestyle: {
        smoking: 'never',
        alcohol: 'never',
      },
      lastUpdated: Date.now(),
      isComplete: false,
    };
  }, [accountInfo?.userId]);

  // Fetch medical history
  const fetchMedicalHistory = useCallback(async () => {
    if (!accountInfo?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Try to get existing medical history
      const userProfile = await getUserById(accountInfo.userId);
      
      if (userProfile?.medicalHistory) {
        setMedicalHistory(userProfile.medicalHistory);
      } else {
        // Initialize empty history if none exists
        const emptyHistory = initializeEmptyHistory();
        setMedicalHistory(emptyHistory);
      }
    } catch (error) {
      console.error('Error fetching medical history:', error);
      // Initialize empty history on error
      const emptyHistory = initializeEmptyHistory();
      setMedicalHistory(emptyHistory);
    } finally {
      setLoading(false);
    }
  }, [accountInfo?.userId, initializeEmptyHistory]);

  // Save medical history
  const saveMedicalHistory = useCallback(async (history: MedicalHistory) => {
    if (!accountInfo?.userId) return false;

    try {
      setSaving(true);
      
      const updatedHistory = {
        ...history,
        lastUpdated: Date.now(),
        isComplete: isHistoryComplete(history),
      };

      // Update user profile with medical history
      await updateData('users', accountInfo.userId, {
        field: 'medicalHistory',
        value: updatedHistory
      });

      setMedicalHistory(updatedHistory);
      showToast('Medical history saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving medical history:', error);
      showToast('Failed to save medical history');
      return false;
    } finally {
      setSaving(false);
    }
  }, [accountInfo?.userId]);

  // Check if medical history is complete
  const isHistoryComplete = useCallback((history: MedicalHistory): boolean => {
    return !!(
      history.emergencyContact.name &&
      history.emergencyContact.phoneNumber
    );
  }, []);

  // Update basic info
  const updateBasicInfo = useCallback((updates: Partial<MedicalHistory>) => {
    if (!medicalHistory) return;

    const updatedHistory = {
      ...medicalHistory,
      ...updates,
    };

    setMedicalHistory(updatedHistory);
  }, [medicalHistory]);

  // Initialize on mount
  useEffect(() => {
    fetchMedicalHistory();
  }, [fetchMedicalHistory]);

  return {
    medicalHistory,
    loading,
    saving,
    saveMedicalHistory,
    updateBasicInfo,
    isHistoryComplete: medicalHistory ? isHistoryComplete(medicalHistory) : false,
    fetchMedicalHistory,
  };
};

export default useMedicalHistory;
