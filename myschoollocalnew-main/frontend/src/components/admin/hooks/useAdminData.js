import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Custom hook for fetching admin dashboard data
 */
export const useAdminData = (accessToken, userRole) => {
  const [stats, setStats] = useState({});
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [usersWithoutSchool, setUsersWithoutSchool] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [accessToken]);

  // Fetch schools
  const fetchSchools = useCallback(async () => {
    if (userRole !== 'SUPER_ADMIN') return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rest/schools/list`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSchools(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  }, [accessToken, userRole]);

  // Fetch users without school codes
  const fetchUsersWithoutSchool = useCallback(async () => {
    if (userRole !== 'SUPER_ADMIN') return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rest/users/list?noSchoolCode=true`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUsersWithoutSchool(response.data.users || response.data || []);
    } catch (error) {
      console.error('Error fetching users without school:', error);
    }
  }, [accessToken, userRole]);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rest/users/listUsersByRole?role=TEACHER&limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setTeachers(response.data?.data?.users || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  }, [accessToken]);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rest/users/listUsersByRole?role=STUDENT&limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setStudents(response.data?.data?.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, [accessToken]);

  // Fetch pending images
  // FIX for Issue #100: Enhanced error handling and logging
  const fetchPendingImages = useCallback(async () => {
    if (userRole !== 'SUPER_ADMIN') {
      console.log('fetchPendingImages: Not SUPER_ADMIN, skipping');
      return;
    }
    try {
      console.log('fetchPendingImages: Starting fetch...');
      const response = await axios.get(`${BACKEND_URL}/api/rest/images/admin/getPendingApprovals`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('fetchPendingImages: Response received:', response.data);
      const images = response.data.images || response.data.pendingImages || [];
      console.log('fetchPendingImages: Setting', images.length, 'images');
      setPendingImages(images);
    } catch (error) {
      console.error('Error fetching pending images:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // FIX: Set empty array on error instead of leaving state undefined
      setPendingImages([]);
    }
  }, [accessToken, userRole]);

  // Fetch credit requests
  const fetchCreditRequests = useCallback(async () => {
    if (userRole !== 'SUPER_ADMIN') return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rest/users/creditRequests`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setCreditRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching credit requests:', error);
    }
  }, [accessToken, userRole]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchSchools(),
      fetchPendingImages(),
      fetchCreditRequests(),
      fetchTeachers(),
      fetchStudents()
    ]);
    setLoading(false);
  }, [fetchStats, fetchSchools, fetchPendingImages, fetchCreditRequests, fetchTeachers, fetchStudents]);

  return {
    stats,
    schools,
    teachers,
    students,
    usersWithoutSchool,
    pendingImages,
    creditRequests,
    loading,
    fetchStats,
    fetchSchools,
    fetchTeachers,
    fetchStudents,
    fetchUsersWithoutSchool,
    fetchPendingImages,
    fetchCreditRequests,
    fetchAllData
  };
};

/**
 * Custom hook for user search functionality
 */
export const useUserSearch = (accessToken) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/rest/users/semantic-search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSearchResults(response.data?.users || response.data || []);
    } catch (error) {
      // Fallback to regular search
      try {
        const fallbackResponse = await axios.get(`${BACKEND_URL}/api/rest/users/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setSearchResults(fallbackResponse.data?.users || fallbackResponse.data || []);
      } catch (fallbackError) {
        console.error('Search error:', fallbackError);
        setSearchResults([]);
      }
    }
    setSearchLoading(false);
  }, [accessToken]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchUsers
  };
};

export default useAdminData;
