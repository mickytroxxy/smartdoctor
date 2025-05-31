import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import {
  canUserRateDoctor,
  getUserRatingForDoctor,
  submitRating,
  getDoctorRatings
} from '../helpers/api';
import { showToast } from '../helpers/methods';

interface UserRating {
  raterId: string;
  raterName: string;
  rating: number;
  message: string;
  date: number;
}

const useRating = (doctorId: string) => {
  const { accountInfo } = useSelector((state: RootState) => state.accountSlice);

  const [canRate, setCanRate] = useState(false);
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [allRatings, setAllRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if user can rate this doctor
  const checkCanRate = useCallback(async () => {
    if (!accountInfo?.userId || !doctorId || accountInfo.isDoctor) {
      setCanRate(false);
      return;
    }

    try {
      setLoading(true);
      const canRateResult = await canUserRateDoctor(accountInfo.userId, doctorId);
      setCanRate(canRateResult);
    } catch (error) {
      console.error('Error checking if user can rate:', error);
      setCanRate(false);
    } finally {
      setLoading(false);
    }
  }, [accountInfo?.userId, doctorId, accountInfo?.isDoctor]);

  // Get user's existing rating
  const fetchUserRating = useCallback(async () => {
    if (!accountInfo?.userId || !doctorId || accountInfo.isDoctor) {
      return;
    }

    try {
      const rating = await getUserRatingForDoctor(accountInfo.userId, doctorId);
      setUserRating(rating);
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  }, [accountInfo?.userId, doctorId, accountInfo?.isDoctor]);

  // Get all ratings for the doctor
  const fetchAllRatings = useCallback(async () => {
    if (!doctorId) return;

    try {
      const ratings = await getDoctorRatings(doctorId);
      setAllRatings(ratings);
    } catch (error) {
      console.error('Error fetching all ratings:', error);
    }
  }, [doctorId]);

  // Submit or update rating
  const handleSubmitRating = useCallback(async (rating: number, comment: string) => {
    if (!accountInfo?.userId || !doctorId) {
      showToast('Please log in to rate this doctor');
      return false;
    }

    if (!canRate) {
      showToast('You can only rate doctors after completing an appointment');
      return false;
    }

    if (rating < 1 || rating > 5) {
      showToast('Please select a rating between 1 and 5 stars');
      return false;
    }

    if (!comment.trim()) {
      showToast('Please add a comment with your rating');
      return false;
    }

    try {
      setSubmitting(true);

      const ratingData = {
        patientId: accountInfo.userId,
        patientName: accountInfo.fname || 'Patient',
        doctorId,
        rating,
        comment: comment.trim(),
      };

      const success = await submitRating(ratingData);

      if (success) {
        showToast(userRating ? 'Rating updated successfully' : 'Rating submitted successfully');

        // Refresh user rating and all ratings
        await fetchUserRating();
        await fetchAllRatings();

        return true;
      } else {
        showToast('Failed to submit rating. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast('Failed to submit rating. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [accountInfo, doctorId, canRate, userRating, fetchUserRating, fetchAllRatings]);

  // Initialize data
  useEffect(() => {
    if (doctorId) {
      checkCanRate();
      fetchUserRating();
      fetchAllRatings();
    }
  }, [doctorId, checkCanRate, fetchUserRating, fetchAllRatings]);

  return {
    canRate,
    userRating,
    allRatings,
    loading,
    submitting,
    handleSubmitRating,
    refreshRatings: fetchAllRatings,
  };
};

export default useRating;
