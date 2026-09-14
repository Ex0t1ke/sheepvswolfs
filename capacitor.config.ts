import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sheepvswolves.game',
  appName: 'Защита Овец от Волков',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
