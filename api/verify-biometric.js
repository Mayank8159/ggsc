import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase Client with Admin credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

// Convert base64url to standard Buffer
function base64urlToBuffer(base64url) {
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, challengeToken, assertion } = req.body;

  if (!email || !challengeToken) {
    return res.status(400).json({ error: 'Missing required validation payload' });
  }

  const normEmail = email.trim().toLowerCase();
  
  // Safely extract client IP address (handling proxy chains like Vercel/Cloudflare)
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ipAddress = rawIp.split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || 'unknown';

  const isSupabaseConfigured = Boolean(supabaseAdmin && supabaseUrl && supabaseServiceKey);
  const isMockToken = challengeToken.endsWith(':mock-signature');

  // Fallback to Mock verification if Supabase is unconfigured or a mock token is processed
  if (!isSupabaseConfigured || isMockToken) {
    console.warn('[Mock Auth] Authenticating mock biometric assertion for email:', normEmail);
    
    let mockRole = 'admin';
    if (normEmail.includes('oops')) mockRole = 'oops';
    else if (normEmail.includes('member')) mockRole = 'member';
    else if (normEmail.includes('volunteer')) mockRole = 'volunteer';

    return res.status(200).json({
      success: true,
      isMock: true,
      session: {
        access_token: `mock-session-token-${mockRole}`,
        refresh_token: `mock-refresh-token-${mockRole}`,
        user: {
          id: `mock-uid-${mockRole}`,
          email: normEmail,
          user_metadata: { display_name: normEmail.split('@')[0] }
        }
      }
    });
  }

  if (!assertion) {
    return res.status(400).json({ error: 'Missing biometric assertion payload' });
  }

  const { credentialId, clientDataJSON, authenticatorData, signature } = assertion;

  try {
    // Rate Limiting Check: Max 3 attempts per IP in 15 minutes
    if (ipAddress !== 'unknown') {
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count, error: countErr } = await supabaseAdmin
        .from('login_history')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ipAddress)
        .eq('status', 'failed')
        .gt('logged_at', fifteenMinsAgo);

      if (countErr) throw countErr;

      if (count && count >= 3) {
        return res.status(429).json({ 
          error: 'Device blocked: 3 consecutive failed biometric attempts detected. To prevent abuse, access from this device is locked for 15 minutes.' 
        });
      }
    }

    // 1. Verify stateless challenge token
    const tokenParts = challengeToken.split(':');
    if (tokenParts.length !== 3) {
      return res.status(400).json({ error: 'Malformed challenge token' });
    }

    const [rawChallenge, expires, tokenSig] = tokenParts;

    // Check expiration
    if (Date.now() > parseInt(expires, 10)) {
      return res.status(400).json({ error: 'Challenge expired. Please try again.' });
    }

    // Re-verify server HMAC signature
    const dataToSign = `${rawChallenge}:${normEmail}:${expires}`;
    const signingSecret = supabaseServiceKey || 'local-fallback-signing-secret';
    const computedSig = crypto.createHmac('sha256', signingSecret)
      .update(dataToSign)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''); // Base64URL

    if (computedSig !== tokenSig) {
      return res.status(401).json({ error: 'Challenge signature is invalid' });
    }

    // 2. Fetch the profile to get user_id and role
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', normEmail)
      .maybeSingle();

    if (profileErr) throw profileErr;
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // 3. Enforce role boundary: Biometrics are strictly for admin and oops
    if (profile.role !== 'admin' && profile.role !== 'oops') {
      await supabaseAdmin.from('login_history').insert({
        email: normEmail,
        role: profile.role,
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent
      });
      return res.status(403).json({ error: 'Biometric authentication is restricted to Admin and Oops team accounts only.' });
    }

    // 4. Fetch public key and verify matching credential ID from the db
    const { data: credInfo, error: credErr } = await supabaseAdmin
      .from('webauthn_credentials')
      .select('public_key, counter')
      .eq('id', credentialId)
      .eq('user_id', profile.id)
      .maybeSingle();

    if (credErr) throw credErr;
    if (!credInfo) {
      await supabaseAdmin.from('login_history').insert({
        email: normEmail,
        role: profile.role,
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent
      });
      return res.status(401).json({ error: 'No registered biometric credential matches the browser key.' });
    }

    // 5. Verify clientDataJSON challenge content
    let clientDataObj;
    try {
      const clientDataJSONBuffer = base64urlToBuffer(clientDataJSON);
      const clientDataJSONStr = clientDataJSONBuffer.toString('utf8');
      clientDataObj = JSON.parse(clientDataJSONStr);
    } catch {
      await supabaseAdmin.from('login_history').insert({
        email: normEmail,
        role: profile.role,
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent
      });
      return res.status(400).json({ error: 'Malformed clientDataJSON payload.' });
    }

    // Normalize comparison of base64url challenge
    const receivedChallenge = clientDataObj.challenge
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .replace(/=/g, '');
    const expectedChallenge = rawChallenge
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .replace(/=/g, '');

    if (receivedChallenge !== expectedChallenge) {
      await supabaseAdmin.from('login_history').insert({
        email: normEmail,
        role: profile.role,
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent
      });
      return res.status(401).json({ error: 'Cryptographic challenge verification failed.' });
    }

    // 6. Verify Cryptographic Signature
    const clientDataHash = crypto.createHash('sha256').update(clientDataJSONBuffer).digest();
    const authenticatorDataBuffer = base64urlToBuffer(authenticatorData);
    
    // WebAuthn signature is signed over [authenticatorData + clientDataHash]
    const signedData = Buffer.concat([authenticatorDataBuffer, clientDataHash]);
    const signatureBuffer = base64urlToBuffer(signature);

    const verified = crypto.verify(
      'sha256',
      signedData,
      credInfo.public_key, // The PEM string from database
      signatureBuffer
    );

    if (!verified) {
      await supabaseAdmin.from('login_history').insert({
        email: normEmail,
        role: profile.role,
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent
      });
      return res.status(401).json({ error: 'Cryptographic signature verification failed (device rejection).' });
    }

    // 7. Generate Supabase Auth Session for User
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      email: normEmail,
      type: 'magiclink'
    });

    if (linkErr) throw linkErr;

    const otpToken = linkData.properties.email_otp;
    const { data: authSession, error: authSessionErr } = await supabaseAdmin.auth.verifyOtp({
      email: normEmail,
      token: otpToken,
      type: 'magiclink'
    });

    if (authSessionErr) throw authSessionErr;

    // 8. Log successful biometric sign-in
    await supabaseAdmin.from('login_history').insert({
      email: normEmail,
      role: profile.role,
      status: 'success',
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // 9. Prune logs > 15 days
    const pruneDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from('login_history')
      .delete()
      .lt('logged_at', pruneDate);

    // Return the generated valid session JWT
    return res.status(200).json({
      success: true,
      isMock: false,
      session: authSession.session
    });

  } catch (error) {
    console.error('Biometric verification error:', error);
    return res.status(500).json({ error: `Verification failed: ${error.message}` });
  }
}
