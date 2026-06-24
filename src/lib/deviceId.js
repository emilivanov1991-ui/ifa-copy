const DEVICE_ID_KEY = 'ifa_device_id';
const DEVICE_COOKIE_KEY = 'ifa_device_id';

// Set cookie with expiration (default 1 year)
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}

// Get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Generate device fingerprint from browser attributes
function generateFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ];
  
  // Simple hash function
  const hash = components.join('|').split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
  }, 0);
  
  return 'dev_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
}

export function getOrCreateDeviceId() {
  // Try cookie first
  let deviceId = getCookie(DEVICE_COOKIE_KEY);
  
  // Try localStorage
  if (!deviceId) {
    deviceId = localStorage.getItem(DEVICE_ID_KEY);
  }
  
  // Generate new if not found
  if (!deviceId) {
    deviceId = generateFingerprint();
    // Save to both cookie and localStorage
    setCookie(DEVICE_COOKIE_KEY, deviceId, 365);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  } else {
    // Ensure it's saved in both places
    setCookie(DEVICE_COOKIE_KEY, deviceId, 365);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

// Sync device ID with backend Device entity
export async function syncDeviceWithBackend(deviceId, userId = null) {
  try {
    const { base44 } = await import('@/api/base44Client');
    
    // Check if device exists
    const existing = await base44.entities.Device.filter({ device_id: deviceId });
    
    const deviceData = {
      device_id: deviceId,
      user_id: userId,
      device_info: navigator.userAgent,
      ip_address: '', // Will be filled by backend if needed
      last_seen_at: new Date().toISOString(),
      is_active: true,
    };
    
    if (existing.length > 0) {
      // Update existing device
      await base44.entities.Device.update(existing[0].id, {
        last_seen_at: deviceData.last_seen_at,
        user_id: userId,
        is_active: true,
      });
    } else {
      // Create new device
      await base44.entities.Device.create({
        ...deviceData,
        created_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Failed to sync device:', error);
  }
}