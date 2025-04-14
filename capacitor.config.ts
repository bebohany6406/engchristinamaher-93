
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bc1591bb7b9946cdb6615410c6078375',
  appName: 'physics-edu-smart-app',
  webDir: 'dist',
  server: {
    url: 'https://bc1591bb-7b99-46cd-b661-5410c6078375.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      signingType: undefined
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#171E31",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#D4AF37",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
