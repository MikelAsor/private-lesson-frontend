import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🛠️ קבלת כתובת השרת מתוך app.config.js
const SERVER_URL = Constants.expoConfig?.extra?.SERVER_URL;

const api = axios.create({
  baseURL: 'https://private-lessones-2dbg.onrender.com' 
});

// 🔐 מוסיף את הטוקן אוטומטית לכל בקשה
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// ----- user -----
export const getUsers = () => api.get('/users');
export const login = (email, password) =>
  api.post('/users/login', { email, password });

export const register = (userData) =>
  api.post('/users/register', userData);
// ----- Classes -----
export const getClassesForUser = () => 
  api.get('/classes/my');
export const getClassesForManager = () => 
  api.get('/classes/managed');
export const createClass = (data) => 
  api.post('/classes', data);
export const deleteClass = (classId) => 
  api.delete(`/classes/${classId}`);
export const updateClass = (classId, data) => 
  api.put(`/classes/${classId}`, data);
export const addUserToClass = (classId, userId) => 
  api.put(`/classes/${classId}/assign-user`, { userId });
export const removeUserFromClass = (classId, userId) =>
  api.put(`/classes/${classId}/remove-user`, { userId });
export const addManagerToClass = (classId, managerId) =>
  api.put(`/classes/${classId}/add-manager`, { userId: managerId });
export const removeManagerFromClass = (classId, managerId) => {
  return api.put(`/classes/${classId}/remove-manager`, { userId: managerId });
};
export const getPublicClasses = () => api.get('/classes/public');

// ----- Lessons -----
export const getLessonsForClass = (classId) =>
  api.get(`/lessons/by-class/${classId}`);
export const createLesson = (data) =>
  api.post('/lessons', data);
export const updateLesson = (lessonId, data) =>
  api.put(`/lessons/${lessonId}`, data);
export const deleteLesson = (lessonId) =>
  api.delete(`/lessons/${lessonId}`);

// ----- files -----
export const getAllFiles=(lessonId)=> api.get(`/files/lesson/${lessonId}`);
export const uploadFile=(data)=> api.post('/files',data);
export const deleteFile=(fileId)=> api.delete(`/files/${fileId}`);
export const updateFile=(fileId,data)=> api.put(`/files/${fileId}`,data);

// ----- tasks -----
export const getTasks = (fileId) => api.get(`/tasks/file/${fileId}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (taskId, data) => api.put(`/tasks/${taskId}`, data);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);
export const markTaskCompleted = (taskId) =>  api.patch(`/tasks/${taskId}/complete`);