import { base44 } from '@/api/base44Client';

/**
 * Secure Log Storage Utilities
 * 
 * Usage:
 * 
 * // Upload a voice recording
 * const logId = await uploadSecureLog({
 *   file: audioBlob,
 *   journey_id: 'journey123',
 *   log_type: 'voice_session',
 * });
 * 
 * // Get signed URL to play/download
 * const { signed_url } = await getSecureLogUrl({ log_id: logId });
 * const audio = new Audio(signed_url);
 * audio.play();
 */

/**
 * Upload a file to secure encrypted storage
 */
export async function uploadSecureLog({
  file,
  journey_id,
  log_type,
  retention_days = 365 * 7,
  access_roles,
}) {
  try {
    // Convert File/Blob to base64
    const base64 = await fileToBase64(file);
    
    const response = await base44.functions.invoke('uploadSecureLog', {
      file: base64,
      journey_id,
      log_type,
      retention_days,
      access_roles,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error('Failed to upload secure log:', error);
    throw error;
  }
}

/**
 * Get a signed URL to access a secure log
 */
export async function getSecureLogUrl({
  log_id,
  expires_in = 3600,
}) {
  try {
    const response = await base44.functions.invoke('getSecureLogUrl', {
      log_id,
      expires_in,
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error('Failed to get secure log URL:', error);
    throw error;
  }
}

/**
 * Helper: Convert File/Blob to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper: Verify file integrity using hash
 */
export async function verifyFileIntegrity(file, expectedHash) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === expectedHash;
}