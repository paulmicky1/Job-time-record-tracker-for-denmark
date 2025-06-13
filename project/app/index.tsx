/**
 * Copyright (c) PAUL MICKY D COSTA
 * Licensed under the MIT license: https://opensource.org/license/mit
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 600;

export default function HomePage() {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#C8102E']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <Image source={require('../assets/images/accounting.png')} style={styles.logo} />
            <Text style={styles.daxHeading}>DAX</Text>
          </View>
          <View style={styles.authLinks}>
            <Link href="/(auth)" style={styles.authButton}>
              <Text style={styles.authButtonText}>Login</Text>
            </Link>
            <Link href="/(auth)/signup" style={[styles.authButton, styles.signupButton]}>
              <Text style={[styles.authButtonText, styles.signupButtonText]}>Signup</Text>
            </Link>
          </View>
        </View>
        <ScrollView style={styles.scrollView}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Transform Your Ideas Into Reality</Text>
            <Text style={styles.heroSubtitle}>
              Build, deploy, and scale your applications with our powerful platform
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🚀</Text>
              </View>
              <Text style={styles.featureTitle}>Lightning Fast</Text>
              <Text style={styles.featureDescription}>
                Deploy your applications in seconds with our optimized infrastructure
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🛡️</Text>
              </View>
              <Text style={styles.featureTitle}>Secure by Default</Text>
              <Text style={styles.featureDescription}>
                Enterprise-grade security built into every layer of your application
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>📈</Text>
              </View>
              <Text style={styles.featureTitle}>Scale Effortlessly</Text>
              <Text style={styles.featureDescription}>
                Grow your application without worrying about infrastructure
              </Text>
            </View>
          </View>

          {/* CTA Box */}
          <View style={styles.ctaBox}>
            <Text style={styles.ctaBoxTitle}>Ready to simplify your work tracking?</Text>
            <Text style={styles.ctaBoxSubtitle}>
              Join DAX today and take control of your work hours, income, and taxes.
            </Text>
            <View style={styles.ctaBoxButtons}>
              <Link href="/(auth)/signup" style={styles.ctaBoxPrimaryButton}>
                <Text style={styles.ctaBoxPrimaryButtonText}>Create Free Account</Text>
              </Link>
              <Link href="/(auth)" style={styles.ctaBoxSecondaryButton}>
                <Text style={styles.ctaBoxSecondaryButtonText}>Login</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 DAX. All rights reserved.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isMobile ? 12 : 20,
    paddingTop: isMobile ? 10 : 16,
    paddingBottom: isMobile ? 6 : 8,
    backgroundColor: 'transparent',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: isMobile ? 32 : 40,
    height: isMobile ? 32 : 40,
    resizeMode: 'contain',
    marginRight: 8,
  },
  daxHeading: {
    fontSize: isMobile ? 22 : 28,
    fontWeight: 'bold',
    color: '#C8102E',
    letterSpacing: 1,
  },
  authLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authButton: {
    paddingVertical: isMobile ? 4 : 6,
    paddingHorizontal: isMobile ? 10 : 16,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  authButtonText: {
    color: '#C8102E',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#C8102E',
    marginLeft: 8,
  },
  signupButtonText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: isMobile ? 16 : 24,
    alignItems: 'center',
    marginTop: isMobile ? 24 : 40,
  },
  heroTitle: {
    fontSize: isMobile ? 26 : 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#C8102E',
  },
  heroSubtitle: {
    fontSize: isMobile ? 15 : 18,
    textAlign: 'center',
    color: '#6C757D',
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#C8102E',
    paddingHorizontal: isMobile ? 20 : 32,
    paddingVertical: isMobile ? 12 : 16,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 16 : 18,
    fontWeight: '600',
  },
  featuresSection: {
    padding: isMobile ? 12 : 24,
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    justifyContent: isMobile ? 'center' : 'space-between',
    marginTop: isMobile ? 24 : 40,
  },
  featureCard: {
    flex: 1,
    maxWidth: isMobile ? '100%' : 320,
    minWidth: isMobile ? '100%' : 220,
    backgroundColor: '#FFFFFF',
    padding: isMobile ? 16 : 20,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    alignSelf: isMobile ? 'center' : 'auto',
  },
  featureIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#C8102E',
  },
  featureDescription: {
    fontSize: isMobile ? 13 : 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  ctaBox: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: isMobile ? 20 : 32,
    marginHorizontal: isMobile ? 8 : 24,
    marginTop: isMobile ? 24 : 32,
    alignItems: 'center',
  },
  ctaBoxTitle: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaBoxSubtitle: {
    fontSize: isMobile ? 14 : 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaBoxButtons: {
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
  },
  ctaBoxPrimaryButton: {
    backgroundColor: '#C8102E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: isMobile ? 0 : 12,
    marginBottom: isMobile ? 10 : 0,
    width: isMobile ? 180 : 'auto',
    alignItems: 'center',
  },
  ctaBoxPrimaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  ctaBoxSecondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8102E',
    width: isMobile ? 180 : 'auto',
    alignItems: 'center',
  },
  ctaBoxSecondaryButtonText: {
    color: '#C8102E',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? 14 : 20,
    marginTop: isMobile ? 16 : 32,
  },
  footerText: {
    color: '#888',
    fontSize: isMobile ? 12 : 13,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});