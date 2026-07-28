/**
 * Utility functions for WebAuthn registration and login in the GGSC Admin Portal.
 */

// Convert ArrayBuffer to Base64
export function bufferToBase64(buffer) {
  let bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64URL string to ArrayBuffer
export function base64URLToBuffer(base64url) {
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  let binary = window.atob(base64);
  let bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper to format DER public key into PEM format
export function derToPem(derBuffer) {
  const base64 = bufferToBase64(derBuffer);
  // Split Base64 into 64-character lines
  const lines = base64.match(/.{1,64}/g) || [base64];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
}

/**
 * Initiates registration of a new biometric credential
 * @param {string} email - Admin email
 * @param {string} userId - UUID of the user from Supabase auth
 * @returns {Promise<{id: string, publicKeyPem: string}>}
 */
export async function registerBiometric(email, userId) {
  if (!navigator.credentials || !navigator.credentials.create) {
    throw new Error('WebAuthn (biometrics) is not supported on this device/browser.');
  }

  // Generate a random 32-byte challenge
  const challengeBuffer = new Uint8Array(32);
  window.crypto.getRandomValues(challengeBuffer);

  // Configure WebAuthn creation options
  const options = {
    publicKey: {
      challenge: challengeBuffer,
      rp: {
        name: 'GGSC Admin Portal',
        id: window.location.hostname
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: email,
        displayName: email.split('@')[0]
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Enforce TouchID / FaceID / Windows Hello
        userVerification: 'required',
        requireResidentKey: false
      },
      timeout: 60000
    }
  };

  const credential = await navigator.credentials.create(options);
  if (!credential) {
    throw new Error('Credential registration cancelled or failed.');
  }

  // Extract public key and credential ID
  const rawId = credential.rawId;
  const credentialId = bufferToBase64(rawId)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, ''); // Base64URL

  const derPublicKey = credential.response.getPublicKey();
  const publicKeyPem = derToPem(derPublicKey);

  return {
    id: credentialId,
    publicKeyPem
  };
}

/**
 * Initiates biometric assertion request (login verification)
 * @param {string} credentialId - Registered base64url credential ID
 * @param {string} challengeBase64 - 32-byte challenge base64url
 * @returns {Promise<object>} - Assertion payload to send to serverless endpoint
 */
export async function authenticateBiometric(credentialId, challengeBase64) {
  if (!navigator.credentials || !navigator.credentials.get) {
    throw new Error('WebAuthn (biometrics) is not supported on this device/browser.');
  }

  const challengeBuffer = base64URLToBuffer(challengeBase64);
  const allowCredentialBuffer = base64URLToBuffer(credentialId);

  const options = {
    publicKey: {
      challenge: challengeBuffer,
      allowCredentials: [
        {
          id: allowCredentialBuffer,
          type: 'public-key'
        }
      ],
      userVerification: 'required',
      timeout: 60000
    }
  };

  const assertion = await navigator.credentials.get(options);
  if (!assertion) {
    throw new Error('Biometric verification cancelled.');
  }

  // Helper to convert buffer to base64url
  const toBase64URL = (buf) => bufferToBase64(buf)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return {
    credentialId: toBase64URL(assertion.rawId),
    clientDataJSON: toBase64URL(assertion.response.clientDataJSON),
    authenticatorData: toBase64URL(assertion.response.authenticatorData),
    signature: toBase64URL(assertion.response.signature)
  };
}
