/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaxSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface TaxReport {
  grossIncome: number;
  deductions: {
    amBidrag: number;
    bundskat: number;
    topskat: number;
    municipalTax: number;
    total: number;
  };
  netIncome: number;
}

interface WorkHourWithJob {
  hours_worked: number;
  jobs: {
    hourly_rate: number;
  } | null;
}

export default function TaxSettingsModal({ visible, onClose }: TaxSettingsModalProps) {
  const { user } = useUser();
  const { t } = useLanguage();
  const [selectedTaxType, setSelectedTaxType] = useState<'standard' | 'pension' | 'student'>('standard');
  const [municipality, setMunicipality] = useState('Copenhagen');
  const [taxReport, setTaxReport] = useState<TaxReport | null>(null);

  const taxTypes = [
    { id: 'standard', name: 'Standard (Fuldtidsansat)' },
    { id: 'pension', name: 'Pensionist' },
    { id: 'student', name: 'Studerende' },
  ];

  const municipalities = [
    'Copenhagen',
    'Aarhus',
    'Odense',
    'Aalborg',
    'Esbjerg',
  ];

  const calculateTaxReport = async () => {
    try {
      // Get total income from work_hours
      const { data: workHours, error } = await supabase
        .from('work_hours')
        .select(`
          hours_worked,
          jobs (
            hourly_rate
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const grossIncome = (workHours || []).reduce((total, entry: any) => {
        const hourlyRate = entry.jobs?.hourly_rate || 0;
        return total + (entry.hours_worked * hourlyRate);
      }, 0);

      // Calculate deductions based on tax type
      const deductions = calculateDeductions(grossIncome, selectedTaxType, municipality);
      const netIncome = grossIncome - deductions.total;

      setTaxReport({
        grossIncome,
        deductions,
        netIncome,
      });
    } catch (error) {
      console.error('Error calculating tax report:', error);
      Alert.alert(t('error'), 'Failed to calculate tax report');
    }
  };

  const calculateDeductions = (grossIncome: number, taxType: string, municipality: string) => {
    // Base rates
    const amBidrag = grossIncome * 0.08; // 8% AM-bidrag
    let bundskat = 0;
    let topskat = 0;
    let municipalTax = 0;

    // Calculate based on tax type
    switch (taxType) {
      case 'standard':
        // Bottom tax up to 552,500 DKK
        bundskat = Math.min(grossIncome, 552500) * 0.1209;
        // Top tax above 552,500 DKK
        if (grossIncome > 552500) {
          topskat = (grossIncome - 552500) * 0.15;
        }
        // Municipal tax (example rate for Copenhagen)
        municipalTax = grossIncome * 0.24;
        break;
      case 'pension':
        // Reduced rates for pensioners
        bundskat = Math.min(grossIncome, 552500) * 0.06045;
        municipalTax = grossIncome * 0.12;
        break;
      case 'student':
        // Special rates for students
        bundskat = Math.min(grossIncome, 552500) * 0.06045;
        municipalTax = grossIncome * 0.12;
        break;
    }

    return {
      amBidrag,
      bundskat,
      topskat,
      municipalTax,
      total: amBidrag + bundskat + topskat + municipalTax,
    };
  };

  useEffect(() => {
    if (visible) {
      calculateTaxReport();
    }
  }, [visible, selectedTaxType, municipality]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('taxSettings')}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6C757D" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('taxType')}</Text>
            <View style={styles.taxTypeButtons}>
              {taxTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.taxTypeButton,
                    selectedTaxType === type.id && styles.taxTypeButtonSelected,
                  ]}
                  onPress={() => setSelectedTaxType(type.id as any)}
                >
                  <Text
                    style={[
                      styles.taxTypeButtonText,
                      selectedTaxType === type.id && styles.taxTypeButtonTextSelected,
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {taxReport && (
            <View style={styles.report}>
              <Text style={styles.reportTitle}>{t('taxReport')}</Text>
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>{t('grossIncome')}</Text>
                <Text style={styles.reportValue}>{taxReport.grossIncome.toFixed(2)} DKK</Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>{t('deductions')}</Text>
                <View style={styles.deductionsList}>
                  <Text style={styles.deductionItem}>
                    AM-bidrag: {taxReport.deductions.amBidrag.toFixed(2)} DKK
                  </Text>
                  <Text style={styles.deductionItem}>
                    Bundskat: {taxReport.deductions.bundskat.toFixed(2)} DKK
                  </Text>
                  <Text style={styles.deductionItem}>
                    Topskat: {taxReport.deductions.topskat.toFixed(2)} DKK
                  </Text>
                  <Text style={styles.deductionItem}>
                    Kommuneskat: {taxReport.deductions.municipalTax.toFixed(2)} DKK
                  </Text>
                  <Text style={styles.deductionItem}>
                    Total: {taxReport.deductions.total.toFixed(2)} DKK
                  </Text>
                </View>
              </View>
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>{t('netIncome')}</Text>
                <Text style={styles.reportValue}>{taxReport.netIncome.toFixed(2)} DKK</Text>
              </View>
            </View>
          )}
        </ScrollView>
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  taxTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taxTypeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  taxTypeButtonSelected: {
    backgroundColor: '#0D6EFD',
    borderColor: '#0D6EFD',
  },
  taxTypeButtonText: {
    fontSize: 16,
    color: '#212529',
  },
  taxTypeButtonTextSelected: {
    color: '#FFFFFF',
  },
  report: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  reportItem: {
    marginBottom: 16,
  },
  reportLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  reportValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  deductionsList: {
  },
  deductionItem: {
    fontSize: 14,
    color: '#6C757D',
  },
}); 