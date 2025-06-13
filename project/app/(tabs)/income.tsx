/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { TrendingUp, Calendar, Download, DollarSign } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import * as FileSystem from 'expo-file-system';
// @ts-ignore: expo-sharing may not have types in some setups
import * as Sharing from 'expo-sharing';

interface IncomeData {
  period: string;
  totalHours: number;
  totalIncome: number;
  jobBreakdown: {
    jobName: string;
    hours: number;
    income: number;
  }[];
}

export default function IncomeScreen() {
  const [monthlyData, setMonthlyData] = useState<IncomeData[]>([]);
  const [yearlyData, setYearlyData] = useState<IncomeData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const { t } = useLanguage();

  useEffect(() => {
    loadIncomeData();
  }, []);

  const loadIncomeData = async () => {
    try {
      console.log('Loading income data for user:', user?.id);
      
      // Load work hours with job information
      const { data, error } = await supabase
        .from('work_hours')
        .select(`
          *,
          job:jobs(name, hourly_rate)
        `)
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Work hours data:', data);
      
      if (data) {
        if (data.length === 0) {
          console.log('No work hours found for user');
        } else {
          console.log('Processing', data.length, 'work hours entries');
          processIncomeData(data);
        }
      } else {
        console.log('No data returned from Supabase');
      }
    } catch (error) {
      console.error('Error loading income data:', error);
      Alert.alert(t('error'), 'Failed to load income data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processIncomeData = (workHours: any[]) => {
    console.log('Processing income data...');
    const monthlyMap = new Map<string, any>();
    const yearlyMap = new Map<string, any>();

    workHours.forEach(entry => {
      console.log('Processing entry:', entry);
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const yearKey = String(date.getFullYear());
      const income = entry.hours_worked * (entry.job?.hourly_rate || 0);
      console.log('Calculated income:', income, 'for job:', entry.job?.name);

      // Process monthly data
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          period: monthKey,
          totalHours: 0,
          totalIncome: 0,
          jobBreakdown: new Map(),
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.totalHours += entry.hours_worked;
      monthData.totalIncome += income;
      
      const jobName = entry.job?.name || 'Unknown Job';
      if (!monthData.jobBreakdown.has(jobName)) {
        monthData.jobBreakdown.set(jobName, { jobName, hours: 0, income: 0 });
      }
      const jobBreakdown = monthData.jobBreakdown.get(jobName);
      jobBreakdown.hours += entry.hours_worked;
      jobBreakdown.income += income;

      // Process yearly data
      if (!yearlyMap.has(yearKey)) {
        yearlyMap.set(yearKey, {
          period: yearKey,
          totalHours: 0,
          totalIncome: 0,
          jobBreakdown: new Map(),
        });
      }
      
      const yearData = yearlyMap.get(yearKey);
      yearData.totalHours += entry.hours_worked;
      yearData.totalIncome += income;
      
      if (!yearData.jobBreakdown.has(jobName)) {
        yearData.jobBreakdown.set(jobName, { jobName, hours: 0, income: 0 });
      }
      const yearJobBreakdown = yearData.jobBreakdown.get(jobName);
      yearJobBreakdown.hours += entry.hours_worked;
      yearJobBreakdown.income += income;
    });

    // Convert maps to arrays
    const monthlyArray = Array.from(monthlyMap.values()).map(item => ({
      ...item,
      jobBreakdown: Array.from(item.jobBreakdown.values()),
    }));

    const yearlyArray = Array.from(yearlyMap.values()).map(item => ({
      ...item,
      jobBreakdown: Array.from(item.jobBreakdown.values()),
    }));

    console.log('Processed monthly data:', monthlyArray);
    console.log('Processed yearly data:', yearlyArray);

    setMonthlyData(monthlyArray.sort((a, b) => b.period.localeCompare(a.period)));
    setYearlyData(yearlyArray.sort((a, b) => b.period.localeCompare(a.period)));
  };

  const formatPeriod = (period: string, type: 'monthly' | 'yearly') => {
    if (type === 'yearly') {
      return period;
    } else {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('da-DK', { year: 'numeric', month: 'long' });
    }
  };

  const exportToExcel = async () => {
    try {
      console.log('Starting export...');
      const currentData = selectedPeriod === 'monthly' ? monthlyData : yearlyData;
      console.log('Current data:', currentData);

      // Create CSV content
      let csvContent = 'Period,Job,Hours,Income (DKK)\n';

      // Add data rows
      currentData.forEach(item => {
        item.jobBreakdown.forEach(job => {
          csvContent += `"${formatPeriod(item.period, selectedPeriod)}","${job.jobName}",${job.hours},${job.income.toFixed(2)}\n`;
        });
      });

      if (Platform.OS === 'web') {
        console.log('Web platform detected, using web export method');
        
        // Create a Blob with the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Create a temporary link
        const downloadLink = document.createElement("a");
        downloadLink.style.display = 'none';
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `income_report_${new Date().toISOString().split('T')[0]}.csv`;
        console.log('Download link created with filename:', downloadLink.download);
        
        // Append to body, click, and remove
        document.body.appendChild(downloadLink);
        console.log('Download link appended to body');
        
        // Use setTimeout to ensure the click event is processed
        setTimeout(() => {
          downloadLink.click();
          console.log('Download link clicked');
          
          // Clean up
          URL.revokeObjectURL(downloadLink.href);
          document.body.removeChild(downloadLink);
          console.log('Download link removed from body');
        }, 100);
      } else {
        console.log('Mobile platform detected, using mobile export method');
        const fileUri = FileSystem.cacheDirectory + 'income_report.csv';
        await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Share your income report',
            UTI: 'public.comma-separated-values-text',
          });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      const err = error as Error;
      console.error('Export error:', err);
      Alert.alert('Export Error', 'Could not export file: ' + err.message);
    }
  };

  const handleExport = async () => {
    console.log('Export button clicked');
    Alert.alert(
      t('exportData'),
      'Choose export format',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: 'Download', onPress: () => {
          console.log('Download selected');
          exportToExcel();
        }},
        { text: 'Summary', onPress: () => {
          console.log('Summary export selected');
          generateSummary();
        }},
      ]
    );
  };

  const generateSummary = () => {
    // This would generate a formatted summary for SKAT
    Alert.alert('Summary', 'Summary generation feature will be implemented');
  };

  const currentData = selectedPeriod === 'monthly' ? monthlyData : yearlyData;
  const totalIncome = currentData.reduce((sum, item) => sum + item.totalIncome, 0);
  const totalHours = currentData.reduce((sum, item) => sum + item.totalHours, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('income')}</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Download size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadIncomeData();
            }}
            colors={['#C8102E']}
          />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <DollarSign size={24} color="#28A745" />
            <Text style={styles.summaryValue}>{totalIncome.toFixed(0)} DKK</Text>
            <Text style={styles.summaryLabel}>{t('totalIncome')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <TrendingUp size={24} color="#C8102E" />
            <Text style={styles.summaryValue}>{totalHours.toFixed(1)}h</Text>
            <Text style={styles.summaryLabel}>{t('totalHours')}</Text>
          </View>
        </View>

        {/* Period Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedPeriod === 'monthly' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={[
              styles.toggleText,
              selectedPeriod === 'monthly' && styles.toggleTextActive,
            ]}>
              {t('monthlyIncome')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedPeriod === 'yearly' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedPeriod('yearly')}
          >
            <Text style={[
              styles.toggleText,
              selectedPeriod === 'yearly' && styles.toggleTextActive,
            ]}>
              {t('yearlyIncome')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Income Data */}
        <View style={styles.content}>
          {currentData.map((item, index) => (
            <View key={item.period} style={styles.periodCard}>
              <View style={styles.periodHeader}>
                <View>
                  <Text style={styles.periodTitle}>
                    {formatPeriod(item.period, selectedPeriod)}
                  </Text>
                  <Text style={styles.periodSubtitle}>
                    {item.totalHours}h • {item.totalIncome.toFixed(2)} DKK
                  </Text>
                </View>
                <Calendar size={20} color="#6C757D" />
              </View>

              {item.jobBreakdown.map((job: any, jobIndex: number) => (
                <View key={jobIndex} style={styles.jobBreakdown}>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobName}>{job.jobName}</Text>
                    <Text style={styles.jobStats}>
                      {job.hours}h • {job.income.toFixed(2)} DKK
                    </Text>
                  </View>
                  <View style={styles.jobProgress}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${(job.income / item.totalIncome) * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          ))}

          {currentData.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <TrendingUp size={64} color="#DEE2E6" />
              <Text style={styles.emptyText}>No income data yet</Text>
              <Text style={styles.emptySubtext}>
                Start tracking your work hours to see income summaries
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  exportButton: {
    backgroundColor: '#003D7A',
    borderRadius: 20,
    padding: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6C757D',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#C8102E',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  periodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  periodSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  jobBreakdown: {
    marginBottom: 12,
  },
  jobInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  jobStats: {
    fontSize: 12,
    color: '#6C757D',
  },
  jobProgress: {
    height: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#C8102E',
    borderRadius: 2,
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