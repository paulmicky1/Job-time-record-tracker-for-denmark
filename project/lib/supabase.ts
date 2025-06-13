/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your Supabase configuration
const supabaseUrl = 'https://roiujuaycshtqnvgafkx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvaXVqdWF5Y3NodHFudmdhZmt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MDQ3ODYsImV4cCI6MjA2NDk4MDc4Nn0.8w-f1rIuBFCBcrfdh_IyB2ACD1A-rIDlOVwwTUecDjY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create storage adapter based on platform
const storageAdapter = Platform.OS === 'web' 
  ? {
      getItem: (key: string) => {
        try {
          return Promise.resolve(window.localStorage.getItem(key));
        } catch (e) {
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (e) {
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        } catch (e) {
          return Promise.resolve();
        }
      },
    }
  : AsyncStorage;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
