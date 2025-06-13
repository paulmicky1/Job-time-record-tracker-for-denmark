import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Polyfill for AsyncStorage on web
  const localStorage = {
    getItem: (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.warn('localStorage.setItem failed:', e);
      }
    },
    removeItem: (key) => {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.warn('localStorage.removeItem failed:', e);
      }
    },
  };

  global.localStorage = localStorage;
} 