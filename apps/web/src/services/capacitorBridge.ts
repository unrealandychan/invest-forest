import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function isNativeMobile(): boolean {
  return Capacitor.isNativePlatform();
}

export function getMobilePlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

export async function triggerHaptic(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch {
      // Graceful fallback if device does not support haptics
    }
  }
}

export function setupNativeLifecycle(onBackground?: () => void, onForeground?: () => void): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const handle = CapApp.addListener('appStateChange', (state) => {
    if (state.isActive) {
      if (onForeground) onForeground();
    } else {
      if (onBackground) onBackground();
    }
  });

  return () => {
    handle.then((h) => h.remove());
  };
}
