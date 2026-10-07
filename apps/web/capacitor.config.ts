import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.investforest.app',
  appName: 'Invest Forest',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0b1512',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      iosKeychainPrefix: 'investforest',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for Invest Forest',
      },
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for Invest Forest',
      },
    },
  },
};

export default config;
