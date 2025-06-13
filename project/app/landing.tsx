/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Landing() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track Your Work, Simplify Your Taxes</Text>
      <Text style={styles.subtitle}>
        DAX helps freelancers and workers in Denmark track hours, calculate income, and estimate taxes across multiple jobs.
      </Text>
      <View style={styles.buttonRow}>
        <Link href="/(auth)" asChild>
          <Button title="Login" />
        </Link>
        <Link href="/(auth)/signup" asChild>
          <Button title="Sign Up" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#6C63FF' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, color: '#6b7280' },
  buttonRow: { flexDirection: 'row' },
}); 