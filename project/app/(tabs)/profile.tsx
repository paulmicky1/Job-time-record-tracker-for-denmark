/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { User, Settings, LogOut, Globe, Shield, CircleHelp as HelpCircle } from 'lucide-react-native';
import { useUser } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useUser();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const toggleLanguage = async (newLanguage: 'da' | 'en') => {
    await setLanguage(newLanguage);
  };

  const menuItems = [
    {
      id: 'language',
      title: 'Language / Sprog',
      subtitle: 'Choose your preferred language',
      icon: Globe,
      action: 'toggle',
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      subtitle: 'GDPR compliance information',
      icon: Shield,
      action: 'navigate',
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help with DAX',
      icon: HelpCircle,
      action: 'navigate',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile')}</Text>
      </View>

      <View style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userIcon}>
            <User size={32} color="#C8102E" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <item.icon size={20} color="#6C757D" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              {item.id === 'language' ? (
                <View style={styles.languageToggle}>
                  <Text style={[styles.langText, language === 'da' && styles.langActive]}>DA</Text>
                  <Switch
                    value={language === 'en'}
                    onValueChange={(value) => toggleLanguage(value ? 'en' : 'da')}
                    trackColor={{ false: '#C8102E', true: '#003D7A' }}
                    thumbColor="#FFFFFF"
                  />
                  <Text style={[styles.langText, language === 'en' && styles.langActive]}>EN</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.menuAction}
                  onPress={() => {
                    if (item.id === 'privacy') {
                      Alert.alert(
                        'Privacy & Data',
                        'DAX complies with GDPR and Danish data protection laws. Your data is stored securely and never shared with third parties. You can request data deletion at any time by contacting support.'
                      );
                    } else if (item.id === 'help') {
                      Alert.alert(
                        'Help & Support',
                        'For support with DAX, please contact us at support@dax-app.dk or visit our help center.'
                      );
                    }
                  }}
                >
                  <Settings size={16} color="#6C757D" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>DAX - Income Tracker</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Designed specifically for workers in Denmark to track income and prepare SKAT reports.
          </Text>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <LogOut size={20} color="#DC3545" />
          <Text style={styles.signOutText}>{t('signOut')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  userIcon: {
    backgroundColor: '#FFF5F5',
    borderRadius: 24,
    padding: 16,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  userEmail: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  menuAction: {
    padding: 4,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C757D',
  },
  langActive: {
    color: '#C8102E',
  },
  appInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  appVersion: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  appDescription: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC3545',
  },
});