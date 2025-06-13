/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Plus, Clock, CreditCard as Edit, Trash2, Calculator } from 'lucide-react-native';
import { WorkHour, Job } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TimeEntryModal from '@/components/TimeEntryModal';
import TaxSettingsModal from '@/components/TaxSettingsModal';

export default function TrackingScreen() {
  const [workHours, setWorkHours] = useState<(WorkHour & { job: Job })[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [taxModalVisible, setTaxModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WorkHour | undefined>(undefined);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const { user } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load jobs first
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('name');

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Then load work hours
      const { data: workHoursData, error: workHoursError } = await supabase
        .from('work_hours')
        .select(`
          *,
          job:jobs(name, hourly_rate)
        `)
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(50);

      if (workHoursError) throw workHoursError;
      setWorkHours(workHoursData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('error'), 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddEntry = () => {
    if (jobs.length === 0) {
      Alert.alert(
        t('error'),
        'Please add a job first before tracking time',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to jobs tab
              // This will be implemented when we add navigation
            },
          },
        ]
      );
      return;
    }
    setSelectedEntry(undefined);
    setSelectedJobId(jobs[0].id); // Default to first job
    setModalVisible(true);
  };

  const handleEditEntry = (entry: WorkHour) => {
    setSelectedEntry(entry);
    setSelectedJobId(entry.job_id);
    setModalVisible(true);
  };

  const handleDeleteEntry = (entry: WorkHour) => {
    Alert.alert(
      t('delete'),
      'Are you sure you want to delete this time entry?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => deleteEntry(entry.id),
        },
      ]
    );
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('work_hours')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      setWorkHours(workHours.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
      Alert.alert(t('error'), 'Failed to delete entry');
    }
  };

  const renderWorkHour = ({ item }: { item: WorkHour & { job: Job } }) => {
    const earnings = item.hours_worked * (item.job?.hourly_rate || 0);
    
    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryIcon}>
            <Clock size={20} color="#C8102E" />
          </View>
          <View style={styles.entryInfo}>
            <Text style={styles.jobName}>{item.job?.name || 'Unknown Job'}</Text>
            <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.entryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditEntry(item)}
            >
              <Edit size={16} color="#003D7A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteEntry(item)}
            >
              <Trash2 size={16} color="#DC3545" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.entryDetails}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Hours</Text>
            <Text style={styles.statValue}>{item.hours_worked}h</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rate</Text>
            <Text style={styles.statValue}>{item.job?.hourly_rate || 0} DKK/h</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Earned</Text>
            <Text style={styles.statValueEarnings}>{earnings.toFixed(2)} DKK</Text>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.entryDescription}>{item.description}</Text>
        )}
      </View>
    );
  };

  const calculateTotalHours = () => {
    return workHours.reduce((total, entry) => total + entry.hours_worked, 0);
  };

  const calculateTotalEarnings = () => {
    return workHours.reduce((total, entry) => {
      return total + (entry.hours_worked * (entry.job?.hourly_rate || 0));
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tracking')}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.taxButton}
            onPress={() => setTaxModalVisible(true)}
          >
            <Calculator size={20} color="#0D6EFD" />
            <Text style={styles.taxButtonText}>{t('taxSettings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedEntry(undefined);
              setModalVisible(true);
            }}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>{t('addHours')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{calculateTotalHours()}h</Text>
          <Text style={styles.statCardLabel}>{t('totalHours')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{calculateTotalEarnings().toFixed(0)} DKK</Text>
          <Text style={styles.statCardLabel}>Total Earned</Text>
        </View>
      </View>

      <FlatList
        data={workHours}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkHour}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            colors={['#C8102E']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Clock size={64} color="#DEE2E6" />
            <Text style={styles.emptyText}>No time entries yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to log your first work hours</Text>
          </View>
        }
      />

      <TimeEntryModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedEntry(undefined);
        }}
        onSave={() => {
          setModalVisible(false);
          setSelectedEntry(undefined);
          loadData();
        }}
        jobId={selectedJobId}
        entry={selectedEntry}
      />

      <TaxSettingsModal
        visible={taxModalVisible}
        onClose={() => setTaxModalVisible(false)}
      />
    </SafeAreaView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  taxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0D6EFD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  taxButtonText: {
    color: '#0D6EFD',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#C8102E',
    borderRadius: 20,
    padding: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C8102E',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryIcon: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  jobName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  entryDate: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  entryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginTop: 2,
  },
  statValueEarnings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28A745',
    marginTop: 2,
  },
  entryDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 8,
    textAlign: 'center',
  },
});