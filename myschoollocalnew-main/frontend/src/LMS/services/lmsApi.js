/**
 * LMS API Service
 * Handles all API calls for the Learning Management System
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://portal.myschoolct.com/api';
const LMS_BASE_URL = `${API_BASE_URL}/rest/lms`;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Create axios instance with auth header
const lmsApi = axios.create({
  baseURL: LMS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
lmsApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============== CLASS MANAGEMENT ==============

export const createClass = async (classData) => {
  const response = await lmsApi.post('/classes', classData);
  return response.data;
};

export const listClasses = async (params = {}) => {
  const response = await lmsApi.get('/classes', { params });
  return response.data;
};

export const getClassDetails = async (classId) => {
  const response = await lmsApi.get(`/classes/${classId}`);
  return response.data;
};

export const updateClass = async (classId, classData) => {
  const response = await lmsApi.patch(`/classes/${classId}`, classData);
  return response.data;
};

export const deleteClass = async (classId) => {
  const response = await lmsApi.delete(`/classes/${classId}`);
  return response.data;
};

// ============== COURSE MANAGEMENT ==============

export const createCourse = async (courseData) => {
  const response = await lmsApi.post('/courses', courseData);
  return response.data;
};

export const listCourses = async (params = {}) => {
  const response = await lmsApi.get('/courses', { params });
  return response.data;
};

export const getCourseDetails = async (courseId) => {
  const response = await lmsApi.get(`/courses/${courseId}`);
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await lmsApi.patch(`/courses/${courseId}`, courseData);
  return response.data;
};

export const enrollStudents = async (enrollData) => {
  const response = await lmsApi.post('/courses/enroll', enrollData);
  return response.data;
};

// ============== ASSIGNMENT MANAGEMENT ==============

export const createAssignment = async (assignmentData) => {
  const response = await lmsApi.post('/assignments', assignmentData);
  return response.data;
};

export const listAssignments = async (params = {}) => {
  const response = await lmsApi.get('/assignments', { params });
  return response.data;
};

export const getAssignmentDetails = async (assignmentId) => {
  const response = await lmsApi.get(`/assignments/${assignmentId}`);
  return response.data;
};

export const updateAssignment = async (assignmentId, assignmentData) => {
  const response = await lmsApi.patch(`/assignments/${assignmentId}`, assignmentData);
  return response.data;
};

// ============== SUBMISSION MANAGEMENT ==============

export const submitAssignment = async (submissionData) => {
  const response = await lmsApi.post('/submissions', submissionData);
  return response.data;
};

export const gradeSubmission = async (gradeData) => {
  const response = await lmsApi.post('/submissions/grade', gradeData);
  return response.data;
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const response = await lmsApi.get(`/submissions/assignment/${assignmentId}`);
  return response.data;
};

// ============== ATTENDANCE MANAGEMENT ==============

export const markAttendance = async (attendanceData) => {
  const response = await lmsApi.post('/attendance/mark', attendanceData);
  return response.data;
};

export const getClassAttendance = async (classId, params = {}) => {
  const response = await lmsApi.get(`/attendance/class/${classId}`, { params });
  return response.data;
};

export const getStudentAttendanceReport = async (studentId, params = {}) => {
  const response = await lmsApi.get(`/attendance/student/${studentId}/report`, { params });
  return response.data;
};

// ============== GRADES & REPORTS ==============

export const getStudentGrades = async (studentId, params = {}) => {
  const response = await lmsApi.get(`/grades/student/${studentId}`, { params });
  return response.data;
};

export const getCourseGradeReport = async (courseId) => {
  const response = await lmsApi.get(`/grades/course/${courseId}/report`);
  return response.data;
};

// ============== ANNOUNCEMENTS ==============

export const createAnnouncement = async (announcementData) => {
  const response = await lmsApi.post('/announcements', announcementData);
  return response.data;
};

export const listAnnouncements = async (params = {}) => {
  const response = await lmsApi.get('/announcements', { params });
  return response.data;
};

// ============== NOTIFICATIONS ==============

export const getNotifications = async (params = {}) => {
  const response = await lmsApi.get('/notifications', { params });
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await lmsApi.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await lmsApi.post('/notifications/mark-all-read');
  return response.data;
};

// ============== ANALYTICS ==============

export const getStudentAnalytics = async (studentId) => {
  const response = await lmsApi.get(`/analytics/student/${studentId}`);
  return response.data;
};

export const getTeacherAnalytics = async (teacherId) => {
  const response = await lmsApi.get(`/analytics/teacher/${teacherId}`);
  return response.data;
};

export const getSchoolAnalytics = async () => {
  const response = await lmsApi.get('/analytics/school');
  return response.data;
};

// ============== PARENT-STUDENT LINK ==============

export const linkParentToStudents = async (linkData) => {
  const response = await lmsApi.post('/parent-student-link', linkData);
  return response.data;
};

export const getParentStudents = async (parentId) => {
  const response = await lmsApi.get(`/parent-student-link/parent/${parentId}`);
  return response.data;
};

// ============== EVENTS/CALENDAR ==============

export const createEvent = async (eventData) => {
  const response = await lmsApi.post('/events', eventData);
  return response.data;
};

export const listEvents = async (params = {}) => {
  const response = await lmsApi.get('/events', { params });
  return response.data;
};

// ============== BULK USER CREATION ==============

export const bulkCreateUsers = async (usersData) => {
  const response = await lmsApi.post('/bulk/create-users', usersData);
  return response.data;
};

// ============== TIMETABLE ==============

export const createTimetable = async (timetableData) => {
  const response = await lmsApi.post('/timetable', timetableData);
  return response.data;
};

export const getClassTimetable = async (classId) => {
  const response = await lmsApi.get(`/timetable/class/${classId}`);
  return response.data;
};

// ============== EXAM MANAGEMENT ==============

export const createExam = async (examData) => {
  const response = await lmsApi.post('/exams', examData);
  return response.data;
};

export const getCourseExams = async (courseId) => {
  const response = await lmsApi.get(`/exams/course/${courseId}`);
  return response.data;
};

export default lmsApi;
