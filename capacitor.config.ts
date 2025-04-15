
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bc1591bb7b9946cdb6615410c6078375',
  appName: 'Eng.Christina Maher',
  webDir: 'dist',
  // تم إزالة عنوان السيرفر للسماح بالتطبيق بالعمل محلياً
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
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      signingType: undefined
    }
  }
};

export default config;
