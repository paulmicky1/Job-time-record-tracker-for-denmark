/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Job } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface JobModalProps {
  visible: boolean;
  job?: Job;
  onClose: () => void;
  onSave: () => void;
}

export default function JobModal({ visible, job, onClose, onSave }: JobModalProps) {
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    if (job) {
      setName(job.name);
      setHourlyRate(job.hourly_rate.toString());
      setStartDate(job.start_date);
      setDescription(job.description || '');
      setIsActive(job.is_active);
    } else {
      // Reset form for new job
      setName('');
      setHourlyRate('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setIsActive(true);
    }
  }, [job, visible]);

  const handleSave = async () => {
    if (!name.trim() || !hourlyRate.trim() || !startDate.trim()) {
      Alert.alert(t('error'), 'Please fill in all required fields');
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      Alert.alert(t('error'), 'Please enter a valid hourly rate');
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const jobData = {
        user_id: user.id,
        name: name.trim(),
        hourly_rate: rate,
        start_date: startDate,
        description: description.trim() || null,
        is_active: isActive,
      };

      console.log('Attempting to save job:', jobData);

      if (job) {
        // Update existing job
        const { data, error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id)
          .select();

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        console.log('Job updated successfully:', data);
      } else {
        // Create new job
        const { data, error } = await supabase
          .from('jobs')
          .insert([jobData])
          .select();

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        console.log('Job created successfully:', data);
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving job:', error);
      Alert.alert(
        t('error'),
        `Failed to save job: ${error.message || 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {job ? t('editJob') : t('addJob')}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6C757D" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('jobName')} *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Restaurant Server"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('hourlyRate')} *</Text>
              <TextInput
                style={styles.input}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="150.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('startDate')} *</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Optional job description..."
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.label}>{t('active')}</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#DEE2E6', true: '#C8102E' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>{t('save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#C8102E',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});