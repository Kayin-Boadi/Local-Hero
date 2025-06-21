import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const Backend_Url = Constants.expoConfig?.extra?.Backend_Url;

// instance for normal requests
const api = axios.create({
  baseURL: Backend_Url,
});

export default api;