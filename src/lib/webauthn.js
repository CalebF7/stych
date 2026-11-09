/**
 * WebAuthn Biometric Authentication Utility for STYCH
 * Supports Apple Face ID / Touch ID, Android Fingerprint, and Windows Hello.
 */

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if the current device & browser support platform biometrics (Face ID / Fingerprint).
 */
export async function isBiometricsSupported() {
  if (typeof window === 'undefined') return false;

  // WebAuthn requires a secure context (HTTPS or localhost)
  if (!window.isSecureContext && window.location.hostname !== 'localhost') {
    return false;
  }

  if (
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  ) {
    try {
      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return Boolean(isAvailable);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Retrieve saved biometric configuration from this device.
 */
export function getSavedBiometricInfo() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('stych_biometric_device');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Register device biometrics (Face ID / Fingerprint) for the logged-in administrator.
 */
export async function registerBiometrics(userEmail = 'admin@stych.store') {
  if (!window.PublicKeyCredential) {
    throw new Error('Biometric authentication is not supported on this browser.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  // Exclude port from rp.id if custom domain or localhost
  const hostname = window.location.hostname;
  const rpConfig = { name: 'STYCH Luxury Atelier' };
  if (hostname && hostname !== 'localhost' && !hostname.match(/^[0-9.]+$/)) {
    rpConfig.id = hostname;
  }

  const publicKeyCredentialCreationOptions = {
    challenge,
    rp: rpConfig,
    user: {
      id: userId,
      name: userEmail,
      displayName: userEmail.split('@')[0] || 'STYCH Admin'
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },   // ES256 (standard for mobile Touch ID & Face ID)
      { alg: -257, type: 'public-key' }  // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Hardware device sensor: Face ID, Touch ID, Fingerprint
      userVerification: 'required',
      residentKey: 'preferred'
    },
    timeout: 60000,
    attestation: 'none'
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions
  });

  if (!credential) {
    throw new Error('Biometric authorization was cancelled or failed.');
  }

  const rawId = credential.rawId ? bufferToBase64(credential.rawId) : credential.id;

  const biometricRecord = {
    id: rawId,
    email: userEmail,
    registeredAt: new Date().toISOString(),
    platform: navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
      ? 'Apple Face ID / Touch ID'
      : navigator.userAgent.includes('Android')
      ? 'Android Biometrics'
      : 'Device Biometrics'
  };

  localStorage.setItem('stych_biometric_device', JSON.stringify(biometricRecord));
  return biometricRecord;
}

/**
 * Verify device biometrics (Face ID / Fingerprint) to unlock the Admin Portal.
 */
export async function verifyBiometrics() {
  const saved = getSavedBiometricInfo();
  if (!saved || !saved.id) {
    throw new Error('No registered biometric device found. Please log in with password once to enable biometrics.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const hostname = window.location.hostname;
  const getOptions = {
    challenge,
    timeout: 60000,
    userVerification: 'required',
    allowCredentials: [
      {
        id: base64ToBuffer(saved.id),
        type: 'public-key',
        transports: ['internal']
      }
    ]
  };

  if (hostname && hostname !== 'localhost' && !hostname.match(/^[0-9.]+$/)) {
    getOptions.rpId = hostname;
  }

  const assertion = await navigator.credentials.get({
    publicKey: getOptions
  });

  if (!assertion) {
    throw new Error('Biometric verification cancelled.');
  }

  return {
    success: true,
    email: saved.email,
    platform: saved.platform
  };
}

/**
 * Remove biometrics from this device.
 */
export function removeBiometrics() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('stych_biometric_device');
  }
}

