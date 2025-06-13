/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useUser } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { t } = useLanguage();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert(t('error'), 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error'), 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('error'), 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            language: 'en',
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw profileError;
        }

        Alert.alert(
          t('success'),
          'Account created successfully! Please check your email for verification.'
        );
        router.replace('/(auth)');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert(
        t('error'),
        error.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>DAX</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder={t('fullName')}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoComplete="name"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder={t('confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t('signUp')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>{t('alreadyHaveAccount')}</Text>
            <Link href="/(auth)" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>{t('signIn')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#C8102E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  form: {
    // gap: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#C8102E',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    // gap: 4,
  },
  linkText: {
    color: '#6C757D',
    fontSize: 14,
  },
  link: {
    color: '#C8102E',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});