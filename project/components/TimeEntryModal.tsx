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
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Job } from '@/types/database';

interface TimeEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  jobId: string;
  entry?: {
    id: string;
    job_id: string;
    hours_worked: number;
    date: string;
    description?: string;
  };
}

export default function TimeEntryModal({ visible, onClose, onSave, jobId, entry }: TimeEntryModalProps) {
  const { user } = useUser();
  const { t } = useLanguage();
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId);
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    if (visible) {
      loadJobs();
    }
  }, [visible]);

  useEffect(() => {
    if (entry) {
      setHours(entry.hours_worked.toString());
      setDate(new Date(entry.date));
      setDateInput(entry.date);
      setDescription(entry.description || '');
      setSelectedJobId(entry.job_id);
    } else {
      setHours('');
      const today = new Date();
      setDate(today);
      setDateInput(today.toISOString().split('T')[0]);
      setDescription('');
      setSelectedJobId(jobId);
    }
  }, [entry, visible, jobId]);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setJobs(data || []);
      
      if (!selectedJobId && data && data.length > 0) {
        setSelectedJobId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert(t('error'), 'Failed to load jobs');
    }
  };

  const handleSave = async () => {
    if (!selectedJobId) {
      Alert.alert(t('error'), 'Please select a job');
      return;
    }

    if (!hours.trim()) {
      Alert.alert(t('error'), 'Please enter the number of hours worked');
      return;
    }

    const numericHours = parseFloat(hours);
    if (isNaN(numericHours) || numericHours <= 0 || numericHours > 24) {
      Alert.alert(t('error'), 'Please enter a valid number of hours (between 0 and 24)');
      return;
    }

    setLoading(true);
    try {
      const timeEntryData = {
        user_id: user?.id,
        job_id: selectedJobId,
        hours_worked: numericHours,
        date: date.toISOString().split('T')[0],
        description: description.trim() || null,
      };

      let error;
      if (entry) {
        ({ error } = await supabase
          .from('work_hours')
          .update(timeEntryData)
          .eq('id', entry.id));
      } else {
        ({ error } = await supabase
          .from('work_hours')
          .insert([timeEntryData]));
      }

      if (error) throw error;
      onSave();
    } catch (error: any) {
      console.error('Error saving time entry:', error);
      Alert.alert(t('error'), error.message || 'Failed to save time entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDateInputChange = (text: string) => {
    setDateInput(text);
    // Try to parse the date
    const parsedDate = new Date(text);
    if (!isNaN(parsedDate.getTime())) {
      setDate(parsedDate);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setDateInput(selectedDate.toISOString().split('T')[0]);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {entry ? t('editHours') : t('addHours')}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6C757D" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('selectJob')} *</Text>
              <View style={styles.jobButtons}>
                {jobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    style={[
                      styles.jobButton,
                      selectedJobId === job.id && styles.jobButtonSelected,
                    ]}
                    onPress={() => setSelectedJobId(job.id)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.jobButtonText,
                        selectedJobId === job.id && styles.jobButtonTextSelected,
                      ]}
                    >
                      {job.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('hoursWorked')} *</Text>
              <TextInput
                style={styles.input}
                value={hours}
                onChangeText={setHours}
                placeholder="e.g., 7.5"
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('selectDate')} *</Text>
              <View style={styles.dateContainer}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={dateInput}
                  onChangeText={handleDateInputChange}
                  placeholder="YYYY-MM-DD"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={showDatepicker}
                  disabled={loading}
                >
                  <Text style={styles.datePickerButtonText}>
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  locale="da-DK"
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Optional notes about your work..."
                multiline
                numberOfLines={3}
                maxLength={500}
                editable={!loading}
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
  dateContainer: {
    flexDirection: 'row',
  },
  dateInput: {
    flex: 1,
  },
  datePickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#212529',
  },
  jobButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  jobButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  jobButtonSelected: {
    backgroundColor: '#C8102E',
    borderColor: '#C8102E',
  },
  jobButtonText: {
    fontSize: 14,
    color: '#212529',
  },
  jobButtonTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
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
