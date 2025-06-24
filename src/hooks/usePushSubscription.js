import { useEffect } from 'react';
import axios from 'axios';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export default function usePushSubscription(userId) {
  useEffect(() => {
    if (!userId) return;
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            }).then(subscription => {
              axios.post('/api/users/push-subscription', { userId, subscription });
            });
          }
        });
      });
    }
  }, [userId]);
} 