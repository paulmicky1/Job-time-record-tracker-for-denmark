/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './AuthContext';

interface LanguageContextType {
  language: 'da' | 'en';
  setLanguage: (lang: 'da' | 'en') => void;
  t: (key: string) => string;
}

const translations = {
  da: {
    // Navigation
    jobs: 'Jobs',
    tracking: 'Tidsregistrering',
    income: 'Indkomst',
    profile: 'Profil',
    
    // Auth
    signIn: 'Log ind',
    signUp: 'Opret konto',
    signOut: 'Log ud',
    email: 'E-mail',
    password: 'Adgangskode',
    fullName: 'Fulde navn',
    confirmPassword: 'Bekræft adgangskode',
    dontHaveAccount: 'Har du ikke en konto?',
    alreadyHaveAccount: 'Har du allerede en konto?',
    
    // Jobs
    addJob: 'Tilføj job',
    editJob: 'Rediger job',
    jobName: 'Job navn',
    hourlyRate: 'Timeløn (DKK)',
    startDate: 'Startdato',
    description: 'Beskrivelse',
    active: 'Aktiv',
    inactive: 'Inaktiv',
    deleteJob: 'Slet job',
    
    // Time tracking
    addHours: 'Tilføj timer',
    editHours: 'Rediger timer',
    hoursWorked: 'Timer arbejdet',
    selectJob: 'Vælg job',
    selectDate: 'Vælg dato',
    totalHours: 'Samlede timer',
    
    // Income
    monthlyIncome: 'Månedlig indkomst',
    yearlyIncome: 'Årlig indkomst',
    totalIncome: 'Samlet indkomst',
    exportData: 'Eksporter data',
    
    // Common
    save: 'Gem',
    cancel: 'Annuller',
    delete: 'Slet',
    edit: 'Rediger',
    loading: 'Indlæser...',
    error: 'Fejl',
    success: 'Succes',
    welcome: 'Velkommen til DAX',
    subtitle: 'Din indkomstregistrering til SKAT',
  },
  en: {
    // Navigation
    jobs: 'Jobs',
    tracking: 'Time Tracking',
    income: 'Income',
    profile: 'Profile',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    
    // Jobs
    addJob: 'Add Job',
    editJob: 'Edit Job',
    jobName: 'Job Name',
    hourlyRate: 'Hourly Rate (DKK)',
    startDate: 'Start Date',
    description: 'Description',
    active: 'Active',
    inactive: 'Inactive',
    deleteJob: 'Delete Job',
    
    // Time tracking
    addHours: 'Add Hours',
    editHours: 'Edit Hours',
    hoursWorked: 'Hours Worked',
    selectJob: 'Select Job',
    selectDate: 'Select Date',
    totalHours: 'Total Hours',
    
    // Income
    monthlyIncome: 'Monthly Income',
    yearlyIncome: 'Yearly Income',
    totalIncome: 'Total Income',
    exportData: 'Export Data',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    welcome: 'Welcome to DAX',
    subtitle: 'Your income tracking for SKAT',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'da' | 'en'>('da');
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // Load user's preferred language from database
      loadUserLanguage();
    }
  }, [user]);

  const loadUserLanguage = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('language')
        .eq('id', user?.id)
        .single();
      
      if (!error && data) {
        setLanguageState(data.language);
      }
    } catch (error) {
      console.error('Error loading user language:', error);
    }
  };

  const setLanguage = async (lang: 'da' | 'en') => {
    setLanguageState(lang);
    
    if (user) {
      try {
        await supabase
          .from('user_profiles')
          .update({ language: lang })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating user language:', error);
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}