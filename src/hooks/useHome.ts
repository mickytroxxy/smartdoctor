import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import {
  setDoctors,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  setSelectedDoctor
} from '../state/slices/doctorSlice';
import { DoctorSpecialty, PlayMyJamProfile } from '@/constants/Types';
import { useRouter } from 'expo-router';
import { showToast } from '../helpers/methods';
import { getNearbyDoctors } from '../helpers/api';
import { setActiveUser } from '../state/slices/accountInfo';

const useHome = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { location } = useSelector((state: RootState) => state.location);
  const { accountInfo } = useSelector((state: RootState) => state.accountSlice);
  const {
    doctors,
    filteredDoctors,
    loading,
    error,
    filters
  } = useSelector((state: RootState) => state.doctorSlice);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayMyJamProfile[]>([]);

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, [location]);

  // Fetch doctors from API
  const fetchDoctors = useCallback(async () => {
    // if (!location.latitude || !location.longitude) {
    //   showToast('Location is required to find nearby doctors');
    //   return;
    // }
    dispatch(setLoading(true));
    try {
      const doctors = await getNearbyDoctors(
        location.latitude,
        location.longitude,
        filters.maxDistance,
      );

      dispatch(setDoctors(doctors));
    } catch (err) {
      dispatch(setError('Failed to fetch doctors'));
      showToast('Failed to fetch doctors');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, location, filters]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(filteredDoctors);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = filteredDoctors.filter(doctor =>
      (doctor.fname?.toLowerCase() || '').includes(query) ||
      (doctor.specialty?.toLowerCase() || '').includes(query)
    );

    setSearchResults(results);
  }, [searchQuery, filteredDoctors]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterKey: keyof typeof filters, value: any) => {
    dispatch(setFilters({ [filterKey]: value }));
  }, [dispatch]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Handle doctor selection
  const handleSelectDoctor = useCallback((doctor: PlayMyJamProfile) => {
    dispatch(setSelectedDoctor(doctor));
    dispatch(setActiveUser(doctor))
    router.push('/profile')
    //router.push(`/doctor/${doctor.userId}`);
  }, [dispatch, router]);

  // Handle specialty filter
  const handleSpecialtyFilter = useCallback((specialty: DoctorSpecialty | null) => {
    dispatch(setFilters({ specialty }));
  }, [dispatch]);

  return {
    doctors: searchQuery.trim() === '' ? filteredDoctors : searchResults,
    loading,
    error,
    filters,
    searchQuery,
    setSearchQuery,
    fetchDoctors,
    handleFilterChange,
    handleResetFilters,
    handleSelectDoctor,
    handleSpecialtyFilter,
    accountInfo
  };
};

export default useHome;
