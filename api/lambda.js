import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';

// Initialization
const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'ggsc-jwt-super-secret-key-2026';
const region = process.env.AWS_REGION || "ap-south-1";

// AWS Client config
const isAwsConfigured = Boolean(
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_SECRET_ACCESS_KEY
) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

let client = null;
let docClient = null;

if (isAwsConfigured) {
  client = new DynamoDBClient({ region });
  docClient = DynamoDBDocumentClient.from(client);
} else {
  console.warn("[DynamoDB Warning] AWS credentials or Lambda context not detected. Running in memory mock backup mode.");
}

// Memory Mock Store in case AWS environment variables are not loaded locally
const MEMORY_DB = {
  profiles: [
    { id: '11111111-1111-4111-a111-111111111111', email: 'admin@ggsc.org', password_hash: bcrypt.hashSync('Admin@GGSC2026', 10), display_name: 'Super Admin', role: 'admin', created_at: new Date().toISOString() },
    { id: '22222222-2222-4222-a222-222222222222', email: 'oops@ggsc.org', password_hash: bcrypt.hashSync('Oops@GGSC2026', 10), display_name: 'Oops Lead', role: 'oops', created_at: new Date().toISOString() },
    { id: '33333333-3333-4333-a333-333333333333', email: 'member@ggsc.org', password_hash: bcrypt.hashSync('Member@GGSC2026', 10), display_name: 'Core Member', role: 'member', created_at: new Date().toISOString() },
    { id: '44444444-4444-4444-a444-444444444444', email: 'volunteer@ggsc.org', password_hash: bcrypt.hashSync('Volunteer@GGSC2026', 10), display_name: 'Volunteer Scanner', role: 'volunteer', created_at: new Date().toISOString() }
  ],
  attendance: [],
  webauthn: [],
  loginHistory: []
};

// Help helper to seed default users if Profiles table is empty
async function checkAndSeedUsers() {
  if (!docClient) return;
  try {
    const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-profiles', Limit: 1 }));
    if (!scanRes.Items || scanRes.Items.length === 0) {
      console.log("[Auto-Seed] Profiles table is empty. Initializing default role users...");
      const defaultUsers = [
        { id: '11111111-1111-4111-a111-111111111111', email: 'admin@ggsc.org', password_hash: bcrypt.hashSync('Admin@GGSC2026', 10), display_name: 'Super Admin', role: 'admin', created_at: new Date().toISOString() },
        { id: '22222222-2222-4222-a222-222222222222', email: 'oops@ggsc.org', password_hash: bcrypt.hashSync('Oops@GGSC2026', 10), display_name: 'Oops Lead', role: 'oops', created_at: new Date().toISOString() },
        { id: '33333333-3333-4333-a333-333333333333', email: 'member@ggsc.org', password_hash: bcrypt.hashSync('Member@GGSC2026', 10), display_name: 'Core Member', role: 'member', created_at: new Date().toISOString() },
        { id: '44444444-4444-4444-a444-444444444444', email: 'volunteer@ggsc.org', password_hash: bcrypt.hashSync('Volunteer@GGSC2026', 10), display_name: 'Volunteer Scanner', role: 'volunteer', created_at: new Date().toISOString() }
      ];
      for (const u of defaultUsers) {
        await docClient.send(new PutCommand({ TableName: 'ggsc-profiles', Item: u }));
      }
      console.log("[Auto-Seed] Successfully loaded default admin, oops, member, and volunteer.");
    }
  } catch (err) {
    console.error("[Auto-Seed Error] Could not query/seed profiles:", err.message);
  }
}

// Middlewares
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired access token' });
    req.user = user;
    next();
  });
};

const getClientIp = (req) => {
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  return rawIp.split(',')[0].trim();
};

const writeLoginLog = async (email, role, status, req) => {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const id = crypto.randomUUID();
  const loggedAt = new Date().toISOString();
  
  if (docClient) {
    try {
      await docClient.send(new PutCommand({
        TableName: 'ggsc-login-history',
        Item: { id, email, role, status, ip_address: ipAddress, user_agent: userAgent, logged_at: loggedAt }
      }));
      // Prune logs older than 15 days
      const pruneDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
      const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-login-history' }));
      const oldLogs = (scanRes.Items || []).filter(log => log.logged_at < pruneDate);
      for (const log of oldLogs) {
        await docClient.send(new DeleteCommand({ TableName: 'ggsc-login-history', Key: { id: log.id } }));
      }
    } catch (err) {
      console.error("Failed to insert login history in DB:", err);
    }
  } else {
    MEMORY_DB.loginHistory.push({ id, email, role, status, ip_address: ipAddress, user_agent: userAgent, logged_at: loggedAt });
  }
};

// Base64URL helper
function base64urlToBuffer(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64');
}

// ---------------- ROUTES ----------------

// Base Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', database: docClient ? 'DynamoDB' : 'InMemoryMock' });
});

// 1. Password Login
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing required parameters: email, password, or role' });
  }

  const normEmail = email.trim().toLowerCase();
  const requestedRole = role.trim().toLowerCase();
  const ipAddress = getClientIp(req);

  // Auto-seed profiles if AWS DB runs for the first time
  await checkAndSeedUsers();

  try {
    // 1. Rate Limiting Check (Max 3 failed attempts per IP in 15 mins)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    let failedAttempts = 0;

    if (docClient) {
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-login-history',
        IndexName: 'IpAddressIndex',
        KeyConditionExpression: 'ip_address = :ip',
        FilterExpression: '#status = :s AND logged_at > :t',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':ip': ipAddress, ':s': 'failed', ':t': fifteenMinsAgo }
      }));
      failedAttempts = qRes.Count || 0;
    } else {
      failedAttempts = MEMORY_DB.loginHistory.filter(
        l => l.ip_address === ipAddress && l.status === 'failed' && l.logged_at > fifteenMinsAgo
      ).length;
    }

    if (failedAttempts >= 3) {
      return res.status(429).json({ 
        error: 'Device blocked: 3 consecutive failed login attempts detected. Access from this device is locked for 15 minutes.' 
      });
    }

    // 2. Fetch User Profile
    let profile = null;
    if (docClient) {
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-profiles',
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': normEmail }
      }));
      profile = qRes.Items?.[0];
    } else {
      profile = MEMORY_DB.profiles.find(p => p.email === normEmail);
    }

    if (!profile) {
      await writeLoginLog(normEmail, requestedRole, 'failed', req);
      return res.status(403).json({ error: 'Email is not registered or authorized to access this system.' });
    }

    if (profile.role !== requestedRole) {
      await writeLoginLog(normEmail, requestedRole, 'failed', req);
      return res.status(403).json({ error: `Email is registered under role "${profile.role}", which does not match selected role "${requestedRole}".` });
    }

    // 3. Verify Password Hash
    const passwordMatch = await bcrypt.compare(password, profile.password_hash);
    if (!passwordMatch) {
      await writeLoginLog(normEmail, requestedRole, 'failed', req);
      return res.status(401).json({ error: 'Incorrect password credentials.' });
    }

    // 4. Log success and generate JWT session
    await writeLoginLog(normEmail, requestedRole, 'success', req);

    const token = jwt.sign({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      display_name: profile.display_name
    }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      success: true,
      session: {
        access_token: token,
        refresh_token: 'refresh-token-placeholder',
        user: {
          id: profile.id,
          email: profile.email,
          user_metadata: { display_name: profile.display_name }
        }
      }
    });

  } catch (err) {
    console.error("Login API Error:", err);
    return res.status(500).json({ error: `Server authentication error: ${err.message}` });
  }
});

// 2. Fetch WebAuthn Fingerprint Challenge
app.post('/api/get-biometric-challenge', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email parameter is required' });

  const normEmail = email.trim().toLowerCase();

  try {
    let profile = null;
    if (docClient) {
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-profiles',
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': normEmail }
      }));
      profile = qRes.Items?.[0];
    } else {
      profile = MEMORY_DB.profiles.find(p => p.email === normEmail);
    }

    if (!profile) return res.status(404).json({ error: 'User profile not found' });
    if (profile.role !== 'admin' && profile.role !== 'oops') {
      return res.status(403).json({ error: 'Biometric authentication is restricted to Admin and Oops team accounts only.' });
    }

    // Get WebAuthn Credentials
    let credentials = [];
    if (docClient) {
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-webauthn',
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: { ':user_id': profile.id }
      }));
      credentials = qRes.Items || [];
    } else {
      credentials = MEMORY_DB.webauthn.filter(c => c.user_id === profile.id);
    }

    if (credentials.length === 0) {
      return res.status(400).json({ error: 'No biometric credentials registered. Please log in with your password first to register a fingerprint.' });
    }

    const rawChallenge = crypto.randomBytes(32).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const expires = Date.now() + 120000; // valid for 2 mins
    const dataToSign = `${rawChallenge}:${normEmail}:${expires}`;
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(dataToSign).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const challengeToken = `${rawChallenge}:${expires}:${signature}`;

    return res.status(200).json({
      challenge: rawChallenge,
      challengeToken,
      credentialIds: credentials.map(c => c.id)
    });

  } catch (err) {
    console.error("Challenge Gen API Error:", err);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// 3. Verify Biometric Signature
app.post('/api/verify-biometric', async (req, res) => {
  const { email, challengeToken, assertion } = req.body;
  if (!email || !challengeToken) return res.status(400).json({ error: 'Missing required validation payload' });

  const normEmail = email.trim().toLowerCase();
  const ipAddress = getClientIp(req);

  try {
    // 1. Rate Limiting
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    let failedAttempts = 0;
    if (docClient) {
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-login-history',
        IndexName: 'IpAddressIndex',
        KeyConditionExpression: 'ip_address = :ip',
        FilterExpression: '#status = :s AND logged_at > :t',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':ip': ipAddress, ':s': 'failed', ':t': fifteenMinsAgo }
      }));
      failedAttempts = qRes.Count || 0;
    } else {
      failedAttempts = MEMORY_DB.loginHistory.filter(
        l => l.ip_address === ipAddress && l.status === 'failed' && l.logged_at > fifteenMinsAgo
      ).length;
    }

    if (failedAttempts >= 3) {
      return res.status(429).json({ error: 'Device blocked: 3 consecutive failed biometric attempts detected.' });
    }

    // 2. Token Verify
    const tokenParts = challengeToken.split(':');
    if (tokenParts.length !== 3) return res.status(400).json({ error: 'Malformed challenge token' });

    const [rawChallenge, expires, tokenSig] = tokenParts;
    if (Date.now() > parseInt(expires, 10)) {
      return res.status(400).json({ error: 'Challenge expired. Please try again.' });
    }

    const dataToSign = `${rawChallenge}:${normEmail}:${expires}`;
    const computedSig = crypto.createHmac('sha256', JWT_SECRET).update(dataToSign).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    if (computedSig !== tokenSig) return res.status(401).json({ error: 'Challenge signature is invalid' });

    // Fetch Profile
    let profile = null;
    if (docClient) {
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-profiles',
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': normEmail }
      }));
      profile = qRes.Items?.[0];
    } else {
      profile = MEMORY_DB.profiles.find(p => p.email === normEmail);
    }

    if (!profile) return res.status(404).json({ error: 'User profile not found' });
    if (profile.role !== 'admin' && profile.role !== 'oops') {
      await writeLoginLog(normEmail, profile.role, 'failed', req);
      return res.status(403).json({ error: 'Biometric authentication is restricted to Admin and Oops team accounts only.' });
    }

    if (!assertion) return res.status(400).json({ error: 'Missing biometric assertion payload' });
    const { credentialId, clientDataJSON, authenticatorData, signature } = assertion;

    // Fetch Registered Credential
    let credInfo = null;
    if (docClient) {
      const getRes = await docClient.send(new GetCommand({
        TableName: 'ggsc-webauthn',
        Key: { id: credentialId }
      }));
      credInfo = getRes.Item;
    } else {
      credInfo = MEMORY_DB.webauthn.find(c => c.id === credentialId);
    }

    if (!credInfo || credInfo.user_id !== profile.id) {
      await writeLoginLog(normEmail, profile.role, 'failed', req);
      return res.status(401).json({ error: 'No registered biometric credential matches the browser key.' });
    }

    // Verify clientDataJSON challenge content
    const clientDataJSONBuffer = base64urlToBuffer(clientDataJSON);
    const clientDataJSONStr = clientDataJSONBuffer.toString('utf8');
    const clientDataObj = JSON.parse(clientDataJSONStr);

    const receivedChallenge = clientDataObj.challenge.replace(/-/g, '+').replace(/_/g, '/').replace(/=/g, '');
    const expectedChallenge = rawChallenge.replace(/-/g, '+').replace(/_/g, '/').replace(/=/g, '');

    if (receivedChallenge !== expectedChallenge) {
      await writeLoginLog(normEmail, profile.role, 'failed', req);
      return res.status(401).json({ error: 'Cryptographic challenge verification failed.' });
    }

    // Verify Cryptographic Signature
    const clientDataHash = crypto.createHash('sha256').update(clientDataJSONBuffer).digest();
    const authenticatorDataBuffer = base64urlToBuffer(authenticatorData);
    const signedData = Buffer.concat([authenticatorDataBuffer, clientDataHash]);
    const signatureBuffer = base64urlToBuffer(signature);

    const verified = crypto.verify('sha256', signedData, credInfo.public_key, signatureBuffer);
    if (!verified) {
      await writeLoginLog(normEmail, profile.role, 'failed', req);
      return res.status(401).json({ error: 'Cryptographic signature verification failed (device rejection).' });
    }

    // Successful Login Log
    await writeLoginLog(normEmail, profile.role, 'success', req);

    const token = jwt.sign({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      display_name: profile.display_name
    }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      success: true,
      session: {
        access_token: token,
        refresh_token: 'refresh-token-placeholder',
        user: {
          id: profile.id,
          email: profile.email,
          user_metadata: { display_name: profile.display_name }
        }
      }
    });

  } catch (err) {
    console.error("Biometric Verification Error:", err);
    return res.status(500).json({ error: `Verification failed: ${err.message}` });
  }
});

// 4. Cloudinary Image Upload
app.post('/api/upload-ticket-cloudinary', async (req, res) => {
  const { ticketImage, eventName, cloudinaryConfig } = req.body;
  if (!ticketImage || !eventName) {
    return res.status(400).json({ error: 'Missing required parameters: ticketImage or eventName' });
  }

  const cloudName = cloudinaryConfig?.cloudName || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = cloudinaryConfig?.apiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = cloudinaryConfig?.apiSecret || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[Cloudinary Local Backup] API credentials missing. Returning base64 URI.');
    return res.status(200).json({ 
      success: true,
      isMock: true,
      secure_url: ticketImage,
      public_id: `mock_ticket_${Date.now()}`
    });
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    const sanitizedFolder = `ggsc-events/${eventName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const uploadRes = await cloudinary.uploader.upload(ticketImage, {
      folder: sanitizedFolder,
      resource_type: 'image',
      overwrite: true
    });

    return res.status(200).json({
      success: true,
      secure_url: uploadRes.secure_url,
      public_id: uploadRes.public_id
    });
  } catch (err) {
    console.error('Cloudinary API upload error:', err);
    return res.status(500).json({ error: `Cloudinary upload failed: ${err.message}` });
  }
});

// 5. NodeMailer Ticket Dispatch
app.post('/api/send-ticket', async (req, res) => {
  const { recipientEmail, recipientName, ticketImage, smtpConfig, mailTemplate } = req.body;
  if (!recipientEmail || !recipientName || !ticketImage || !smtpConfig) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const { host, port, secure, user, pass, fromName } = smtpConfig;
  if (!host || !port || !user || !pass) {
    return res.status(400).json({ error: 'Missing SMTP configuration details' });
  }

  try {
    const base64Data = ticketImage.split(',')[1] || ticketImage;
    const ticketImageBuffer = Buffer.from(base64Data, 'base64');

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: secure === true || secure === 'true',
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    const rawTemplate = mailTemplate || `Hello {name},\n\nYour event ticket is attached below.`;
    const replacedText = rawTemplate.replace(/{name}/gi, recipientName).replace(/{email}/gi, recipientEmail);
    const bodyHtml = replacedText
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
      .replace(/\n/g, '<br />');

    const finalHtml = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 580px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background-color: #ffffff;">
        <div style="margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px;">
          <span style="font-size: 16px; font-weight: bold; color: #2563eb;">GGSC Event Portal</span>
        </div>
        <div style="font-size: 14px;">${bodyHtml}</div>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; text-align: center;">
          This is an automated dispatch. Please do not reply.
        </div>
      </div>
    `;

    const displaySender = fromName || 'GGSC Organizing Team';
    const mailOptions = {
      from: `"${displaySender}" <${user}>`,
      to: recipientEmail,
      subject: `🎟️ Entry Ticket for GGSC - ${recipientName}`,
      html: finalHtml,
      attachments: [{
        filename: `GGSC_Ticket_${recipientName.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
        content: ticketImageBuffer,
        contentType: 'image/png'
      }]
    };

    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Email sending error:', err);
    return res.status(500).json({ error: `Failed to deliver email: ${err.message}` });
  }
});

// 6. Auth session profiles helper: GET /api/me
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    let profile = null;
    if (docClient) {
      const getRes = await docClient.send(new GetCommand({
        TableName: 'ggsc-profiles',
        Key: { id: req.user.id }
      }));
      profile = getRes.Item;
    } else {
      profile = MEMORY_DB.profiles.find(p => p.id === req.user.id);
    }

    if (!profile) return res.status(404).json({ error: 'User profile not found' });
    
    // Omit password hash for safety
    const { password_hash, ...profileSafe } = profile;
    return res.status(200).json({ success: true, profile: profileSafe });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. GET /api/profiles (Admin/Oops role checking all members)
app.get('/api/profiles', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'oops') {
    return res.status(403).json({ error: 'Admin authentication required.' });
  }

  try {
    let items = [];
    if (docClient) {
      const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-profiles' }));
      items = scanRes.Items || [];
    } else {
      items = MEMORY_DB.profiles;
    }
    
    // Sort profiles alphabetically and remove password hashes
    const sanitized = items.map(({ password_hash, ...rest }) => rest);
    sanitized.sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''));

    return res.status(200).json({ success: true, profiles: sanitized });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. POST /api/profiles (Admin capability to register new users/roles)
app.post('/api/profiles', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can register new users.' });
  }

  const { email, password, display_name, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing required parameters: email, password, or role' });
  }

  const normEmail = email.trim().toLowerCase();
  const id = crypto.randomUUID();
  const password_hash = await bcrypt.hash(password, 10);
  const created_at = new Date().toISOString();

  try {
    // Check if email already registered
    let existingProfile = null;
    if (docClient) {
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-profiles',
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': normEmail }
      }));
      existingProfile = qRes.Items?.[0];
    } else {
      existingProfile = MEMORY_DB.profiles.find(p => p.email === normEmail);
    }

    if (existingProfile) return res.status(409).json({ error: 'Email already registered.' });

    const newProfile = {
      id,
      email: normEmail,
      password_hash,
      display_name: display_name || normEmail.split('@')[0],
      role: role.trim().toLowerCase(),
      created_at
    };

    if (docClient) {
      await docClient.send(new PutCommand({
        TableName: 'ggsc-profiles',
        Item: newProfile
      }));
    } else {
      MEMORY_DB.profiles.push(newProfile);
    }

    const { password_hash: _, ...safeProfile } = newProfile;
    return res.status(201).json({ success: true, profile: safeProfile });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9. Scanner Attendance records: GET /api/attendance
app.get('/api/attendance', authenticateToken, async (req, res) => {
  try {
    let items = [];
    if (docClient) {
      const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-attendance' }));
      items = scanRes.Items || [];
    } else {
      items = MEMORY_DB.attendance;
    }
    
    // Sort scanned_at desc
    items.sort((a, b) => new Date(b.scanned_at) - new Date(a.scanned_at));
    return res.status(200).json({ success: true, records: items });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 10. Scanner Attendance records: POST /api/attendance
app.post('/api/attendance', authenticateToken, async (req, res) => {
  const record = req.body;
  if (!record.email || !record.name) {
    return res.status(400).json({ error: 'Missing required student details (email/name)' });
  }

  const normEmail = record.email.trim().toLowerCase();
  const scanned_at = new Date().toISOString();
  
  const newRecord = {
    email: normEmail,
    name: record.name,
    year: record.year || '',
    section: record.section || '',
    roll_number: record.roll_number || '',
    enrolment_number: record.enrolment_number || '',
    phone_number: record.phone_number || '',
    position: record.position || '',
    scanned_by: req.user.id,
    scanned_at
  };

  try {
    // Check if record exists
    let existing = null;
    if (docClient) {
      const getRes = await docClient.send(new GetCommand({
        TableName: 'ggsc-attendance',
        Key: { email: normEmail }
      }));
      existing = getRes.Item;
    } else {
      existing = MEMORY_DB.attendance.find(a => a.email === normEmail);
    }

    if (existing) {
      return res.status(409).json({ 
        error: 'Duplicate scan: This ticket has already been checked-in.',
        record: existing
      });
    }

    if (docClient) {
      await docClient.send(new PutCommand({
        TableName: 'ggsc-attendance',
        Item: newRecord
      }));
    } else {
      MEMORY_DB.attendance.push(newRecord);
    }

    return res.status(201).json({ success: true, record: newRecord });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 11. GET /api/login-history (Admin/Oops audit log view)
app.get('/api/login-history', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'oops') {
    return res.status(403).json({ error: 'Audit view restricted to Admin and Oops.' });
  }

  try {
    let items = [];
    if (docClient) {
      const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-login-history' }));
      items = scanRes.Items || [];
    } else {
      items = MEMORY_DB.loginHistory;
    }

    items.sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at));
    return res.status(200).json({ success: true, logs: items });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 12. DELETE /api/login-history (Oops capability to clear audit logs)
app.delete('/api/login-history', authenticateToken, async (req, res) => {
  if (req.user.role !== 'oops') {
    return res.status(403).json({ error: 'Only members of the Oops team can delete login records.' });
  }

  try {
    if (docClient) {
      // In DynamoDB, to clear a table, we scan and delete all elements
      const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-login-history' }));
      const items = scanRes.Items || [];
      for (const item of items) {
        await docClient.send(new DeleteCommand({
          TableName: 'ggsc-login-history',
          Key: { id: item.id }
        }));
      }
    } else {
      MEMORY_DB.loginHistory = [];
    }

    return res.status(200).json({ success: true, message: 'Login history cleared successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 12b. DELETE /api/login-history/:id (Oops capability to delete single log row)
app.delete('/api/login-history/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'oops') {
    return res.status(403).json({ error: 'Only members of the Oops team can delete login records.' });
  }

  const { id } = req.params;

  try {
    if (docClient) {
      await docClient.send(new DeleteCommand({
        TableName: 'ggsc-login-history',
        Key: { id }
      }));
    } else {
      MEMORY_DB.loginHistory = MEMORY_DB.loginHistory.filter(log => log.id !== id);
    }

    return res.status(200).json({ success: true, message: 'Login history entry deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 13. WebAuthn: GET /api/webauthn (list keys for user_id)
app.get('/api/webauthn', authenticateToken, async (req, res) => {
  const userId = req.query.userId || req.user.id;

  // Verification: Users can view their own keys, but Admin/Oops can view anyone's keys
  if (userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'oops') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    let credentials = [];
    if (docClient) {
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-webauthn',
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: { ':user_id': userId }
      }));
      credentials = qRes.Items || [];
    } else {
      credentials = MEMORY_DB.webauthn.filter(c => c.user_id === userId);
    }

    return res.status(200).json({ success: true, credentials });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 14. WebAuthn: POST /api/webauthn (enroll a key)
app.post('/api/webauthn', authenticateToken, async (req, res) => {
  const { id, user_id, public_key } = req.body;
  if (!id || !user_id || !public_key) {
    return res.status(400).json({ error: 'Missing required biometric credential attributes.' });
  }

  const created_at = new Date().toISOString();

  // Access validation: Admin/Oops can enroll keys for others, others can only enroll their own
  if (user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'oops') {
    return res.status(403).json({ error: 'Unauthorized credential enrollment.' });
  }

  try {
    // Check if key is already registered to user
    let existing = null;
    if (docClient) {
      const getRes = await docClient.send(new GetCommand({
        TableName: 'ggsc-webauthn',
        Key: { id }
      }));
      existing = getRes.Item;
    } else {
      existing = MEMORY_DB.webauthn.find(c => c.id === id);
    }

    if (existing) {
      return res.status(409).json({ error: 'This biometric device is already registered.' });
    }

    const newCred = { id, user_id, public_key, counter: 0, created_at };

    if (docClient) {
      await docClient.send(new PutCommand({
        TableName: 'ggsc-webauthn',
        Item: newCred
      }));
    } else {
      MEMORY_DB.webauthn.push(newCred);
    }

    return res.status(201).json({ success: true, credential: newCred });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 15. WebAuthn: DELETE /api/webauthn/:id (remove a key)
app.delete('/api/webauthn/:id', authenticateToken, async (req, res) => {
  const credId = req.params.id;

  try {
    let credential = null;
    if (docClient) {
      const getRes = await docClient.send(new GetCommand({
        TableName: 'ggsc-webauthn',
        Key: { id: credId }
      }));
      credential = getRes.Item;
    } else {
      credential = MEMORY_DB.webauthn.find(c => c.id === credId);
    }

    if (!credential) return res.status(404).json({ error: 'Biometric credential not found.' });

    // Validation: Admin/Oops can delete anyone's key, others can only delete their own keys
    if (credential.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'oops') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (docClient) {
      await docClient.send(new DeleteCommand({
        TableName: 'ggsc-webauthn',
        Key: { id: credId }
      }));
    } else {
      MEMORY_DB.webauthn = MEMORY_DB.webauthn.filter(c => c.id !== credId);
    }

    return res.status(200).json({ success: true, message: 'Biometric key removed successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Export Lambda handler
export const handler = serverless(app);

// Local runner startup logic: run `node api/lambda.js` to run locally
const currentFileUrl = import.meta.url;
if (process.argv[1] && currentFileUrl.includes(process.argv[1].replace(/\\/g, '/'))) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Local API Server] Running on http://localhost:${PORT}`);
  });
}
