import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client with Admin credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

// Predefined Mock Role Credentials for Offline Development Testing
const MOCK_CREDENTIALS = {
  admin: { email: 'admin@ggsc.org', password: 'Admin@123', role: 'admin' },
  oops: { email: 'oops@ggsc.org', password: 'Oops@123', role: 'oops' },
  member: { email: 'member@ggsc.org', password: 'Member@123', role: 'member' },
  volunteer: { email: 'volunteer@ggsc.org', password: 'Volunteer@123', role: 'volunteer' }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing required parameters: email, password, or role' });
  }

  const normEmail = email.trim().toLowerCase();
  const requestedRole = role.trim().toLowerCase(); // 'admin' | 'member' | 'volunteer' | 'oops'

  // Safely extract client IP address (handling proxy chains like Vercel/Cloudflare)
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ipAddress = rawIp.split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Fallback to Mock Authentication Mode if Supabase DB is unconfigured or offline
  const isSupabaseConfigured = Boolean(supabaseAdmin && supabaseUrl && supabaseServiceKey);

  if (!isSupabaseConfigured) {
    console.warn('[Mock Auth] Running in Offline Mock Authentication Mode (Supabase not configured yet).');
    const mockUser = MOCK_CREDENTIALS[requestedRole];

    if (!mockUser) {
      return res.status(400).json({ error: 'Invalid role selected.' });
    }

    // Match password against mock role password (or allow email matching mock)
    if (password !== mockUser.password) {
      return res.status(401).json({ error: `Incorrect password for role '${requestedRole}'. Mock password is: ${mockUser.password}` });
    }

    // Return a mock Supabase session JWT payload
    return res.status(200).json({
      success: true,
      isMock: true,
      session: {
        access_token: `mock-access-token-${requestedRole}`,
        refresh_token: `mock-refresh-token-${requestedRole}`,
        user: {
          id: `mock-uid-${requestedRole}`,
          email: normEmail || mockUser.email,
          user_metadata: { display_name: normEmail.split('@')[0] || requestedRole }
        }
      }
    });
  }

  try {
    // Rate Limiting Check: Max 3 failed attempts per IP in 15 minutes
    if (ipAddress !== 'unknown') {
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count, error: countErr } = await supabaseAdmin
        .from('login_history')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ipAddress)
        .eq('status', 'failed')
        .gt('logged_at', fifteenMinsAgo);

      if (!countErr && count && count >= 3) {
        return res.status(429).json({ 
          error: 'Device blocked: 3 consecutive failed login attempts detected. Access from this device is locked for 15 minutes.' 
        });
      }
    }

    // 1. Check if the email exists in the profiles database and matches the selected role
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', normEmail)
      .maybeSingle();

    if (profileErr || !profile) {
      // Check if fallback to mock mode is needed if profile table doesn't exist yet
      if (profileErr && profileErr.message.includes('relation "public.profiles" does not exist')) {
        const mockUser = MOCK_CREDENTIALS[requestedRole];
        if (password === mockUser.password) {
          return res.status(200).json({
            success: true,
            isMock: true,
            session: {
              access_token: `mock-access-token-${requestedRole}`,
              refresh_token: `mock-refresh-token-${requestedRole}`,
              user: {
                id: `mock-uid-${requestedRole}`,
                email: normEmail,
                user_metadata: { display_name: normEmail.split('@')[0] }
              }
            }
          });
        }
      }

      await supabaseAdmin.from('login_history').insert({
        email: normEmail,
        role: requestedRole,
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent
      });
      return res.status(403).json({ error: 'Email is not registered or authorized to access this system.' });
    }

    if (profile.role !== requestedRole) {
      await supabaseAdmin.from('login_history').insert({
        email: normEmail,
        role: requestedRole,
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent
      });
      return res.status(403).json({ error: `Email is registered under role "${profile.role}", which does not match selected role "${requestedRole}".` });
    }

    // 2. Perform standard Supabase Auth password verification
    const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
      email: normEmail,
      password: password
    });

    if (authErr) {
      await supabaseAdmin.from('login_history').insert({
        email: normEmail,
        role: requestedRole,
        status: 'failed',
        ip_address: ipAddress,
        user_agent: userAgent
      });
      return res.status(401).json({ error: 'Incorrect password credentials.' });
    }

    // 3. Log successful login
    await supabaseAdmin.from('login_history').insert({
      email: normEmail,
      role: requestedRole,
      status: 'success',
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // 4. Prune audit logs older than 15 days
    const pruneDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from('login_history')
      .delete()
      .lt('logged_at', pruneDate);

    return res.status(200).json({
      success: true,
      session: authData.session
    });

  } catch (error) {
    console.error('API login error:', error);
    return res.status(500).json({ error: `Server authentication error: ${error.message}` });
  }
}
