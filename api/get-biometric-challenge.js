import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase Client with Admin credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  const normEmail = email.trim().toLowerCase();

  // Fallback to Mock Challenge generation if Supabase is unconfigured
  const isSupabaseConfigured = Boolean(supabaseAdmin && supabaseUrl && supabaseServiceKey);

  if (!isSupabaseConfigured) {
    console.warn('[Mock Auth] Generating offline WebAuthn challenge for email:', normEmail);
    const rawChallenge = crypto.randomBytes(32).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''); // Base64URL

    const expires = Date.now() + 120000; // 2 minutes expiration
    const challengeToken = `${rawChallenge}:${expires}:mock-signature`;

    return res.status(200).json({
      challenge: rawChallenge,
      challengeToken,
      credentialIds: ['mock-credential-id-1']
    });
  }

  try {
    // 1. Fetch user profile to ensure they exist and retrieve user_id
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', normEmail)
      .maybeSingle();

    if (profileErr) throw profileErr;
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Role check: Biometrics are strictly for admin and oops roles
    if (profile.role !== 'admin' && profile.role !== 'oops') {
      return res.status(403).json({ error: 'Biometric authentication is restricted to Admin and Oops team accounts only.' });
    }

    // 2. Retrieve their registered WebAuthn credentials
    const { data: credentials, error: credsErr } = await supabaseAdmin
      .from('webauthn_credentials')
      .select('id')
      .eq('user_id', profile.id);

    if (credsErr) throw credsErr;
    
    // In live mode, they must have registered a fingerprint first
    if (!credentials || credentials.length === 0) {
      return res.status(400).json({ error: 'No biometric credentials registered for this email. Please log in with your password first to register a fingerprint.' });
    }

    // 3. Generate a stateless cryptographic challenge signed by the server
    const rawChallenge = crypto.randomBytes(32).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''); // Base64URL

    const expires = Date.now() + 120000; // Challenge valid for 2 minutes
    const dataToSign = `${rawChallenge}:${normEmail}:${expires}`;
    
    const signingSecret = supabaseServiceKey || 'local-fallback-signing-secret';
    const signature = crypto.createHmac('sha256', signingSecret)
      .update(dataToSign)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''); // Base64URL

    const challengeToken = `${rawChallenge}:${expires}:${signature}`;

    return res.status(200).json({
      challenge: rawChallenge,
      challengeToken,
      credentialIds: credentials.map(c => c.id)
    });
  } catch (error) {
    console.error('Challenge generation error:', error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
