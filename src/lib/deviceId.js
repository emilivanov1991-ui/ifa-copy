const DEVICE_ID_KEY = 'ifa_device_id';

export function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}