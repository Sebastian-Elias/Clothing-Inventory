import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'QualityControl',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    Camera: {
      allowEditing: true,
      saveToGallery: false,
      presentationStyle: 'fullscreen',
    },
  },
};

export default config;
