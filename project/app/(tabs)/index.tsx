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
import { Plus, CreditCard as Edit, Trash2, Briefcase } from 'lucide-react-native';
import { Job } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import JobModal from '@/components/JobModal';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>();
  const { user } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert(t('error'), 'Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteJob = (job: Job) => {
    Alert.alert(
      t('deleteJob'),
      `Are you sure you want to delete "${job.name}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => deleteJob(job.id),
        },
      ]
    );
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      Alert.alert(t('error'), 'Failed to delete job');
    }
  };

  const renderJob = ({ item }: { item: Job }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobIcon}>
          <Briefcase size={20} color="#C8102E" />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobName}>{item.name}</Text>
          <Text style={styles.jobRate}>{item.hourly_rate} DKK/time</Text>
        </View>
        <View style={styles.jobActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedJob(item);
              setModalVisible(true);
            }}
          >
            <Edit size={18} color="#003D7A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteJob(item)}
          >
            <Trash2 size={18} color="#DC3545" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.jobDetails}>
        <Text style={styles.jobDate}>Started: {new Date(item.start_date).toLocaleDateString()}</Text>
        <Text style={[
          styles.jobStatus,
          { color: item.is_active ? '#28A745' : '#6C757D' }
        ]}>
          {item.is_active ? t('active') : t('inactive')}
        </Text>
      </View>
      
      {item.description && (
        <Text style={styles.jobDescription}>{item.description}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('jobs')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedJob(undefined);
            setModalVisible(true);
          }}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadJobs();
            }}
            colors={['#C8102E']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Briefcase size={64} color="#DEE2E6" />
            <Text style={styles.emptyText}>No jobs added yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first job</Text>
          </View>
        }
      />

      <JobModal
        visible={modalVisible}
        job={selectedJob}
        onClose={() => setModalVisible(false)}
        onSave={() => {
          setModalVisible(false);
          loadJobs();
        }}
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
  addButton: {
    backgroundColor: '#C8102E',
    borderRadius: 20,
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobIcon: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  jobRate: {
    fontSize: 14,
    color: '#6C757D',
  },
  jobActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8F9FA',
  },
  jobDate: {
    fontSize: 12,
    color: '#6C757D',
  },
  jobStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  jobDescription: {
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