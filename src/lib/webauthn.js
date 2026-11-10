/**
 * WebAuthn Biometric Authentication Utility for STYCH
 * Supports Apple Face ID / Touch ID, Android Fingerprint, and Windows Hello.
 */

// Robust Base64 & Base64URL to ArrayBuffer conversion
function base64ToBuffer(base64String) {
  if (!base64String) return new ArrayBuffer(0);
  // Replace base64url characters with standard base64
  let base64 = base64String.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' if length is not a multiple of 4
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Check if the current device & browser support platform biometrics (Face ID / Fingerprint).
 */
export async function isBiometricsSupported() {
  if (typeof window === 'undefined') {
    return { supported: false, reason: 'No browser window.' };
  }

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isSecure = window.isSecureContext || isLocal;

  if (!isSecure) {
    return {
      supported: false,
      reason: 'Biometrics require HTTPS. On mobile, please access via HTTPS or your deployed domain (e.g. Vercel).'
    };
  }

  if (
    !window.PublicKeyCredential ||
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function'
  ) {
    return {
      supported: false,
      reason: 'WebAuthn is not supported in this browser.'
    };
  }

  try {
    const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return {
      supported: Boolean(isAvailable),
      reason: isAvailable ? '' : 'No biometric sensor detected on this device.'
    };
  } catch (e) {
    return {
      supported: false,
      reason: e.message || 'Biometric capability detection failed.'
    };
  }
}

/**
 * Retrieve saved biometric configuration from this device.
 */
export function getSavedBiometricInfo() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('stych_biometric_device');
    return raw ? JSON.parse(raw) : null;
  } catch (_err) {
    return null;
  }
}

/**
 * Register device biometrics (Face ID / Fingerprint) for the logged-in administrator.
 */
export async function registerBiometrics(userEmail = 'admin@stych.store') {
  if (!window.PublicKeyCredential) {
    throw new Error('Biometrics are not supported on this browser.');
  }

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!window.isSecureContext && !isLocal) {
    throw new Error('Biometric setup requires HTTPS. Please test via HTTPS or your live URL.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  const hostname = window.location.hostname;
  const rpConfig = { name: 'STYCH Luxury Atelier' };
  // Only assign rp.id if not an IP address (IP addresses cause WebAuthn SecurityError)
  if (hostname && !hostname.match(/^[0-9.]+$/)) {
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
      authenticatorAttachment: 'platform', // Built-in hardware sensor
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

  let rawId;
  if (credential.rawId) {
    rawId = bufferToBase64(credential.rawId);
  } else {
    rawId = credential.id;
  }

  const isApple = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('Macintosh');
  const isAndroid = navigator.userAgent.includes('Android');

  const biometricRecord = {
    id: rawId,
    email: userEmail,
    registeredAt: new Date().toISOString(),
    platform: isApple ? 'Apple Face ID / Touch ID' : isAndroid ? 'Android Biometrics' : 'Device Biometrics'
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
    throw new Error('No registered biometric device found. Please sign in with password first to enable biometrics.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const hostname = window.location.hostname;
  
  // Note: transports is intentionally omitted so both platform and hybrid (iCloud Keychain) passkeys match
  const getOptions = {
    challenge,
    timeout: 60000,
    userVerification: 'required',
    allowCredentials: [
      {
        id: base64ToBuffer(saved.id),
        type: 'public-key'
      }
    ]
  };

  if (hostname && !hostname.match(/^[0-9.]+$/)) {
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
