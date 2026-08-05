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

import fs from 'fs';
import path from 'path';

// Load environment variables from .env file manually if not already present
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of envLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        let val = trimmed.substring(index + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (err) {
  console.warn("Unable to load .env file manually:", err.message);
}

// Initialization
export const app = express();
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
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // Running inside AWS Lambda environment: use automatic IAM Execution Role
    client = new DynamoDBClient({ region });
  } else {
    // Running locally: use credentials from .env
    client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
      }
    });
  }
  docClient = DynamoDBDocumentClient.from(client);
} else {
  console.warn("[DynamoDB Warning] AWS credentials or Lambda context not detected. Running in memory mock backup mode.");

  // Set up persistent mock database attached to globalThis to survive Vite hot-reloads
  globalThis.__mockDb = globalThis.__mockDb || {
    'ggsc-profiles': [],
    'ggsc-attendance': [],
    'ggsc-webauthn': [],
    'ggsc-login-history': [],
    'ggsc-events': []
  };
  const mockDb = globalThis.__mockDb;

  docClient = {
    async send(command) {
      const { TableName, Item, Key, IndexName, KeyConditionExpression, FilterExpression, ExpressionAttributeValues, ExpressionAttributeNames } = command.input;
      const table = mockDb[TableName] || [];
      const cmdType = command.constructor.name;

      if (cmdType === 'ScanCommand') {
        return { Items: [...table], Count: table.length };
      }

      if (cmdType === 'PutCommand') {
        let keyField = 'id';
        if (TableName === 'ggsc-attendance') keyField = 'email';
        else if (TableName === 'ggsc-webauthn') keyField = 'id';
        else if (TableName === 'ggsc-profiles') keyField = 'id';
        else if (TableName === 'ggsc-events') keyField = 'id';
        else if (TableName === 'ggsc-login-history') keyField = 'id';

        const existingIdx = table.findIndex(x => x[keyField] === Item[keyField]);
        if (existingIdx > -1) {
          table[existingIdx] = Item;
        } else {
          table.push(Item);
        }
        return { success: true };
      }

      if (cmdType === 'GetCommand') {
        const item = table.find(x => {
          return Object.keys(Key).every(k => x[k] === Key[k]);
        });
        return { Item: item };
      }

      if (cmdType === 'DeleteCommand') {
        const idx = table.findIndex(x => {
          return Object.keys(Key).every(k => x[k] === Key[k]);
        });
        if (idx > -1) {
          table.splice(idx, 1);
        }
        return { success: true };
      }

      if (cmdType === 'QueryCommand') {
        let results = [...table];
        if (KeyConditionExpression) {
          // Parse e.g. "email = :email" or "user_id = :user_id" or "ip_address = :ip"
          const match = KeyConditionExpression.match(/(\w+)\s*=\s*:(\w+)/);
          if (match) {
            const field = match[1];
            const valKey = `:${match[2]}`;
            const targetVal = ExpressionAttributeValues[valKey];
            results = results.filter(x => x[field] === targetVal);
          }
        }

        if (FilterExpression) {
          if (FilterExpression.includes('status') && FilterExpression.includes('logged_at')) {
            const statusVal = ExpressionAttributeValues[':s'];
            const timeVal = ExpressionAttributeValues[':t'];
            results = results.filter(x => x.status === statusVal && x.logged_at > timeVal);
          }
        }

        return { Items: results, Count: results.length };
      }

      throw new Error(`Unsupported Mock Command: ${cmdType}`);
    }
  };
}



// Helper to parse CSV lines manually in the backend
function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  const result = [];
  if (lines.length === 0) return result;

  // Parse headers
  const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split on commas not inside double quotes
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    const values = matches.map(v => v.replace(/^["']|["']$/g, '').trim());

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });
    result.push(obj);
  }
  return result;
}

// Help helper to seed default users if Profiles table is empty
async function checkAndSeedUsers() {
  try {
    const csvPath = path.join(process.cwd(), 'src/components/Admin/ggsc-adminportal-member-list.csv');
    if (!fs.existsSync(csvPath)) {
      console.warn(`[Auto-Seed Warning] CSV file not found at ${csvPath}`);
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const parsed = parseCSV(csvContent);

    const commonPasswords = {
      admin: 'Admin@GGSC2026',
      'operations team': 'Oops@GGSC2026',
      member: 'Member@GGSC2026',
      volunteer: 'Volunteer@GGSC2026'
    };

    const getStableId = (email) => {
      const hash = crypto.createHash('md5').update(email).digest('hex');
      return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(12, 15)}-a${hash.slice(15, 18)}-${hash.slice(18, 30)}`;
    };

    for (const member of parsed) {
      const email = String(member.email).trim().toLowerCase();
      const role = String(member.role).trim().toLowerCase();
      const name = String(member.name || member.display_name || email.split('@')[0]).trim();
      const position = String(member.position || '').trim();

      if (!email || !role) continue;

      const commonPass = commonPasswords[role] || 'Member@GGSC2026';
      const password_hash = bcrypt.hashSync(commonPass, 10);
      const id = getStableId(email);

      // Check if user already exists
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-profiles',
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email }
      }));

      if (!qRes.Items || qRes.Items.length === 0) {
        const newProfile = {
          id,
          email,
          password_hash,
          display_name: name,
          role: role === 'oops' ? 'operations team' : role,
          position,
          created_at: new Date().toISOString()
        };
        await docClient.send(new PutCommand({ TableName: 'ggsc-profiles', Item: newProfile }));
        console.log(`[Auto-Seed] Successfully loaded default profile for ${name} (${email}) from CSV`);
      } else {
        const existingProf = qRes.Items[0];
        if (existingProf.role === 'oops') {
          existingProf.role = 'operations team';
          await docClient.send(new PutCommand({ TableName: 'ggsc-profiles', Item: existingProf }));
          console.log(`[Auto-Seed] Migrated role for ${email} from 'oops' to 'operations team' in DynamoDB`);
        }
      }
    }
  } catch (err) {
    console.error("[Auto-Seed Error] Could not query/seed profiles from CSV:", err.message);
  }
}

// Help helper to seed default events if Events table is empty
async function checkAndSeedEvents() {

  try {
    const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-events', Limit: 1 }));
    if (!scanRes.Items || scanRes.Items.length === 0) {
      console.log("[Auto-Seed] Events table is empty. Initializing Cydropreneur...");
      const defaultEvent = {
        id: "cydropreneur-2026",
        title: "Cydropreneur",
        date: "08th August 2026",
        venue: "FICCI Auditorium",
        desc: "Build Android applications in an immersive, hands-on workshop",
        img: "/img/event-banner.png",
        tag: "AI & Android",
        route: "/events/Cydropreneur",
        folder: "cydropreneur-2026",
        status: "upcoming",
        created_at: new Date().toISOString()
      };
      await docClient.send(new PutCommand({ TableName: 'ggsc-events', Item: defaultEvent }));
      console.log("[Auto-Seed] Successfully loaded default event.");
    }
  } catch (err) {
    console.error("[Auto-Seed Error] Could not query/seed events:", err.message);
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

const writeLoginLog = async (email, role, status, req, displayName = '', position = '') => {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const id = crypto.randomUUID();
  const loggedAt = new Date().toISOString();

  try {
    await docClient.send(new PutCommand({
      TableName: 'ggsc-login-history',
      Item: {
        id,
        email,
        role,
        status,
        ip_address: ipAddress,
        user_agent: userAgent,
        logged_at: loggedAt,
        display_name: displayName || email.split('@')[0],
        position: position || 'Unknown'
      }
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
  res.status(200).json({ status: 'healthy', database: 'DynamoDB' });
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

    const historyRes = await docClient.send(new QueryCommand({
      TableName: 'ggsc-login-history',
      IndexName: 'IpAddressIndex',
      KeyConditionExpression: 'ip_address = :ip',
      FilterExpression: '#status = :s AND logged_at > :t',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':ip': ipAddress, ':s': 'failed', ':t': fifteenMinsAgo }
    }));
    failedAttempts = historyRes.Count || 0;

    if (failedAttempts >= 3) {
      return res.status(429).json({
        error: 'Device blocked: 3 consecutive failed login attempts detected. Access from this device is locked for 15 minutes.'
      });
    }

    // 2. Fetch User Profile
    const profileRes = await docClient.send(new QueryCommand({
      TableName: 'ggsc-profiles',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': normEmail }
    }));
    const profile = profileRes.Items?.[0];

    if (!profile) {
      await writeLoginLog(normEmail, requestedRole, 'failed', req, 'Unknown', 'Unknown');
      return res.status(403).json({ error: 'Invalid email, password, or role combination.' });
    }

    const normalizeRole = (r) => (r === 'oops' ? 'operations team' : r);
    const dbRole = normalizeRole(profile.role);
    const reqRole = normalizeRole(requestedRole);

    if (dbRole !== reqRole) {
      await writeLoginLog(normEmail, requestedRole, 'failed', req, profile.display_name, profile.position);
      return res.status(403).json({ error: `Email is registered under role "${dbRole}", which does not match selected role "${reqRole}".` });
    }

    // 3. Verify Password Hash
    const passwordMatch = await bcrypt.compare(password, profile.password_hash);
    if (!passwordMatch) {
      await writeLoginLog(normEmail, requestedRole, 'failed', req, profile.display_name, profile.position);
      return res.status(401).json({ error: 'Invalid email, password, or role combination.' });
    }

    // Auto-migrate legacy 'oops' role in DB to 'operations team'
    if (profile.role === 'oops') {
      profile.role = 'operations team';
      try {
        await docClient.send(new PutCommand({ TableName: 'ggsc-profiles', Item: profile }));
      } catch (e) {
        console.warn("Could not auto-migrate profile role in DB:", e.message);
      }
    }

    // 4. Log success and generate JWT session
    await writeLoginLog(normEmail, 'operations team', 'success', req, profile.display_name, profile.position);

    const token = jwt.sign({
      id: profile.id,
      email: profile.email,
      role: 'operations team',
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
    const profileRes = await docClient.send(new QueryCommand({
      TableName: 'ggsc-profiles',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': normEmail }
    }));
    const profile = profileRes.Items?.[0];

    if (!profile) return res.status(400).json({ error: 'Biometric authentication request failed.' });

    // Get WebAuthn Credentials
    const credRes = await docClient.send(new QueryCommand({
      TableName: 'ggsc-webauthn',
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: { ':user_id': profile.id }
    }));
    const credentials = credRes.Items || [];

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
    const historyRes = await docClient.send(new QueryCommand({
      TableName: 'ggsc-login-history',
      IndexName: 'IpAddressIndex',
      KeyConditionExpression: 'ip_address = :ip',
      FilterExpression: '#status = :s AND logged_at > :t',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':ip': ipAddress, ':s': 'failed', ':t': fifteenMinsAgo }
    }));
    failedAttempts = historyRes.Count || 0;

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
    const profileRes = await docClient.send(new QueryCommand({
      TableName: 'ggsc-profiles',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': normEmail }
    }));
    const profile = profileRes.Items?.[0];

    if (!profile) {
      await writeLoginLog(normEmail, 'Unknown', 'failed', req, 'Unknown', 'Unknown');
      return res.status(400).json({ error: 'Biometric verification failed.' });
    }

    if (!assertion) return res.status(400).json({ error: 'Missing biometric assertion payload' });
    const { credentialId, clientDataJSON, authenticatorData, signature } = assertion;

    // Fetch Registered Credential
    const getRes = await docClient.send(new GetCommand({
      TableName: 'ggsc-webauthn',
      Key: { id: credentialId }
    }));
    const credInfo = getRes.Item;

    if (!credInfo || credInfo.user_id !== profile.id) {
      await writeLoginLog(normEmail, profile.role, 'failed', req, profile.display_name, profile.position);
      return res.status(401).json({ error: 'Biometric verification failed.' });
    }

    // Verify clientDataJSON challenge content
    const clientDataJSONBuffer = base64urlToBuffer(clientDataJSON);
    const clientDataJSONStr = clientDataJSONBuffer.toString('utf8');
    const clientDataObj = JSON.parse(clientDataJSONStr);

    const receivedChallenge = clientDataObj.challenge.replace(/-/g, '+').replace(/_/g, '/').replace(/=/g, '');
    const expectedChallenge = rawChallenge.replace(/-/g, '+').replace(/_/g, '/').replace(/=/g, '');

    if (receivedChallenge !== expectedChallenge) {
      await writeLoginLog(normEmail, profile.role, 'failed', req, profile.display_name, profile.position);
      return res.status(401).json({ error: 'Biometric verification failed.' });
    }

    // Verify Cryptographic Signature
    const clientDataHash = crypto.createHash('sha256').update(clientDataJSONBuffer).digest();
    const authenticatorDataBuffer = base64urlToBuffer(authenticatorData);
    const signedData = Buffer.concat([authenticatorDataBuffer, clientDataHash]);
    const signatureBuffer = base64urlToBuffer(signature);

    const verified = crypto.verify('sha256', signedData, credInfo.public_key, signatureBuffer);
    if (!verified) {
      await writeLoginLog(normEmail, profile.role, 'failed', req, profile.display_name, profile.position);
      return res.status(401).json({ error: 'Biometric verification failed.' });
    }

    // Successful Login Log
    await writeLoginLog(normEmail, profile.role, 'success', req, profile.display_name, profile.position);

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

  const cleanUser = String(user).trim();
  const cleanPass = String(pass).replace(/\s+/g, '');

  try {
    const base64Data = ticketImage.split(',')[1] || ticketImage;
    const ticketImageBuffer = Buffer.from(base64Data, 'base64');

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: secure === true || secure === 'true',
      auth: { user: cleanUser, pass: cleanPass },
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
      from: `"${displaySender}" <${cleanUser}>`,
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
    let errMsg = err.message || 'SMTP delivery failure';
    if (errMsg.includes('535') || errMsg.includes('Username and Password not accepted')) {
      errMsg = 'Invalid login credentials (535 Bad Credentials). For Gmail, please enter a 16-character Google App Password (not your regular Gmail password).';
    }
    return res.status(500).json({ error: `Failed to deliver email: ${errMsg}` });
  }
});

// 5b. NodeMailer Generic Email Dispatch
app.post('/api/send-email', async (req, res) => {
  const { recipientEmail, subject, htmlBody, smtpConfig } = req.body;
  if (!recipientEmail || !subject || !htmlBody || !smtpConfig) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const { host, port, secure, user, pass, fromName } = smtpConfig;
  if (!host || !port || !user || !pass) {
    return res.status(400).json({ error: 'Missing SMTP configuration details' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: secure === true || secure === 'true',
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    const displaySender = fromName || 'GGSC Organizing Team';
    const mailOptions = {
      from: `"${displaySender}" <${user}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlBody
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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    let profile = null;

    // 1. Try querying by email
    if (req.user?.email) {
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-profiles',
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': req.user.email.toLowerCase() }
      })).catch(() => null);
      profile = qRes?.Items?.[0];
    }

    // 2. Try fetching by id
    if (!profile && req.user?.id) {
      const getRes = await docClient.send(new GetCommand({
        TableName: 'ggsc-profiles',
        Key: { id: req.user.id }
      })).catch(() => null);
      profile = getRes?.Item;
    }

    if (profile) {
      const { password_hash, ...profileSafe } = profile;
      if (profileSafe.role === 'oops') profileSafe.role = 'operations team';
      return res.status(200).json({ success: true, profile: profileSafe });
    }

    // 3. Fallback to JWT payload so authenticated session is ALWAYS valid
    return res.status(200).json({
      success: true,
      profile: {
        id: req.user?.id || 'usr-default',
        email: req.user?.email || 'admin@ggsc.org',
        role: req.user?.role === 'oops' ? 'operations team' : (req.user?.role || 'admin'),
        display_name: req.user?.display_name || (req.user?.email ? req.user.email.split('@')[0] : 'Admin User')
      }
    });
  } catch (err) {
    console.warn('/api/me DB fetch warning, returning token profile fallback:', err.message);
    return res.status(200).json({
      success: true,
      profile: {
        id: req.user?.id || 'usr-default',
        email: req.user?.email || 'admin@ggsc.org',
        role: req.user?.role === 'oops' ? 'operations team' : (req.user?.role || 'admin'),
        display_name: req.user?.display_name || 'Admin User'
      }
    });
  }
});

// 7. GET /api/profiles (Admin/Operations Team role checking all members)
app.get('/api/profiles', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operations team') {
    return res.status(403).json({ error: 'Admin or Operations Team authentication required.' });
  }

  try {
    const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-profiles' }));
    const items = scanRes.Items || [];

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
    const qRes = await docClient.send(new QueryCommand({
      TableName: 'ggsc-profiles',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': normEmail }
    }));
    const existingProfile = qRes.Items?.[0];

    if (existingProfile) return res.status(409).json({ error: 'Email already registered.' });

    const newProfile = {
      id,
      email: normEmail,
      password_hash,
      display_name: display_name || normEmail.split('@')[0],
      role: role.trim().toLowerCase(),
      created_at
    };

    await docClient.send(new PutCommand({
      TableName: 'ggsc-profiles',
      Item: newProfile
    }));

    const { password_hash: _, ...safeProfile } = newProfile;
    return res.status(201).json({ success: true, profile: safeProfile });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9. Scanner Attendance records: GET /api/attendance
app.get('/api/attendance', authenticateToken, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-attendance' }));
    const items = scanRes.Items || [];

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
    const getRes = await docClient.send(new GetCommand({
      TableName: 'ggsc-attendance',
      Key: { email: normEmail }
    }));
    const existing = getRes.Item;

    if (existing) {
      return res.status(409).json({
        error: 'Duplicate scan: This ticket has already been checked-in.',
        record: existing
      });
    }

    await docClient.send(new PutCommand({
      TableName: 'ggsc-attendance',
      Item: newRecord
    }));

    return res.status(201).json({ success: true, record: newRecord });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 10.5. Scanner Attendance records: DELETE /api/attendance/:email (Operations Team role restricted)
app.delete('/api/attendance/:email', authenticateToken, async (req, res) => {
  if (req.user.role !== 'operations team') {
    return res.status(403).json({ error: 'Access denied: Only Operations Team members can delete check-in entries.' });
  }

  const { email } = req.params;
  const normEmail = email.trim().toLowerCase();

  try {
    await docClient.send(new DeleteCommand({
      TableName: 'ggsc-attendance',
      Key: { email: normEmail }
    }));

    return res.status(200).json({ success: true, message: 'Attendance entry deleted successfully.' });
  } catch (err) {
    console.error("Delete attendance error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 11. GET /api/login-history (Admin/Operations Team audit log view)
app.get('/api/login-history', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operations team') {
    return res.status(403).json({ error: 'Audit view restricted to Admin and Operations Team.' });
  }

  try {
    const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-login-history' }));
    const items = scanRes.Items || [];

    items.sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at));
    return res.status(200).json({ success: true, logs: items });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 12. DELETE /api/login-history (Operations Team capability to clear audit logs)
app.delete('/api/login-history', authenticateToken, async (req, res) => {
  if (req.user.role !== 'operations team') {
    return res.status(403).json({ error: 'Only members of the Operations Team can delete login records.' });
  }

  try {
    // In DynamoDB, to clear a table, we scan and delete all elements
    const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-login-history' }));
    const items = scanRes.Items || [];
    for (const item of items) {
      await docClient.send(new DeleteCommand({
        TableName: 'ggsc-login-history',
        Key: { id: item.id }
      }));
    }

    return res.status(200).json({ success: true, message: 'Login history cleared successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 12b. DELETE /api/login-history/:id (Operations Team capability to delete single log row)
app.delete('/api/login-history/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'operations team') {
    return res.status(403).json({ error: 'Only members of the Operations Team can delete login records.' });
  }

  const { id } = req.params;

  try {
    await docClient.send(new DeleteCommand({
      TableName: 'ggsc-login-history',
      Key: { id }
    }));

    return res.status(200).json({ success: true, message: 'Login history entry deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 13. WebAuthn: GET /api/webauthn (list keys for user_id)
app.get('/api/webauthn', authenticateToken, async (req, res) => {
  const userId = req.query.userId || req.user.id;

  // Verification: Users can view their own keys, but Admin/Operations Team can view anyone's keys
  if (userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'operations team') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const qRes = await docClient.send(new QueryCommand({
      TableName: 'ggsc-webauthn',
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: { ':user_id': userId }
    }));
    const credentials = qRes.Items || [];

    return res.status(200).json({ success: true, credentials });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 14. WebAuthn: POST /api/webauthn (enroll a key)
app.post('/api/webauthn', authenticateToken, async (req, res) => {
  const { id, user_id, public_key, setupPassword } = req.body;
  if (!id || !user_id || !public_key || !setupPassword) {
    return res.status(400).json({ error: 'Missing required biometric credential attributes or setup password.' });
  }

  // Backend validation of setup authorization passwords
  if (req.user.role === 'admin') {
    if (setupPassword !== 'AdminBioAuth2026') {
      return res.status(403).json({ error: 'Invalid setup authorization password.' });
    }
  } else if (req.user.role === 'operations team') {
    if (setupPassword !== 'OopsBioAuth2026') {
      return res.status(403).json({ error: 'Invalid setup authorization password.' });
    }
  } else {
    return res.status(403).json({ error: 'Only Admin and Operations Team roles can enroll biometric credentials.' });
  }

  const created_at = new Date().toISOString();

  try {
    // Check if key is already registered to user
    const getRes = await docClient.send(new GetCommand({
      TableName: 'ggsc-webauthn',
      Key: { id }
    }));
    const existing = getRes.Item;

    if (existing) {
      return res.status(409).json({ error: 'This biometric device is already registered.' });
    }

    const newCred = { id, user_id, public_key, counter: 0, created_at };

    await docClient.send(new PutCommand({
      TableName: 'ggsc-webauthn',
      Item: newCred
    }));

    return res.status(201).json({ success: true, credential: newCred });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 15. WebAuthn: DELETE /api/webauthn/:id (remove a key)
app.delete('/api/webauthn/:id', authenticateToken, async (req, res) => {
  const credId = req.params.id;

  try {
    const getRes = await docClient.send(new GetCommand({
      TableName: 'ggsc-webauthn',
      Key: { id: credId }
    }));
    const credential = getRes.Item;

    if (!credential) return res.status(404).json({ error: 'Biometric credential not found.' });

    // Validation: Admin/Operations Team can delete anyone's key, others can only delete their own keys
    if (credential.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'operations team') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await docClient.send(new DeleteCommand({
      TableName: 'ggsc-webauthn',
      Key: { id: credId }
    }));

    return res.status(200).json({ success: true, message: 'Biometric key removed successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 16. POST /api/sync-profiles (Sync CSV roster list of members, admin/operations team authorization required)
app.post('/api/sync-profiles', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operations team') {
    return res.status(403).json({ error: 'Access denied: Only Admins or Operations Team can sync member roster.' });
  }

  const { members } = req.body;
  if (!Array.isArray(members)) {
    return res.status(400).json({ error: 'Missing parameter: members array is required' });
  }

  const commonPasswords = {
    admin: 'Admin@GGSC2026',
    'operations team': 'Oops@GGSC2026',
    member: 'Member@GGSC2026',
    volunteer: 'Volunteer@GGSC2026'
  };

  try {
    const results = [];
    for (const member of members) {
      const email = String(member.email).trim().toLowerCase();
      const role = String(member.role).trim().toLowerCase();
      const display_name = String(member.display_name || member.name || email.split('@')[0]).trim();
      const position = String(member.position || '').trim();

      if (!email || !role) continue; // skip invalid rows

      const commonPass = commonPasswords[role] || 'Member@GGSC2026';
      const password_hash = bcrypt.hashSync(commonPass, 10);

      // Check if user already exists
      const qRes = await docClient.send(new QueryCommand({
        TableName: 'ggsc-profiles',
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email }
      }));
      const existingProfile = qRes.Items?.[0];

      if (existingProfile) {
        // Update existing profile (preserves UUID id, keeping biometrics intact)
        const updatedProfile = {
          ...existingProfile,
          display_name,
          role,
          position,
          password_hash
        };

        await docClient.send(new PutCommand({
          TableName: 'ggsc-profiles',
          Item: updatedProfile
        }));
        results.push({ email, status: 'updated', id: existingProfile.id });
      } else {
        // Insert new profile
        const id = crypto.randomUUID();
        const created_at = new Date().toISOString();
        const newProfile = {
          id,
          email,
          password_hash,
          display_name,
          role,
          position,
          created_at
        };

        await docClient.send(new PutCommand({
          TableName: 'ggsc-profiles',
          Item: newProfile
        }));
        results.push({ email, status: 'inserted', id });
      }
    }

    return res.status(200).json({ success: true, count: results.length, details: results });
  } catch (err) {
    console.error("Profile sync error:", err);
    return res.status(500).json({ error: `Sync failed: ${err.message}` });
  }
});

// 17. GET /api/events (Public endpoint to list events)
app.get('/api/events', async (req, res) => {
  // Auto-seed events if AWS DB is empty
  await checkAndSeedEvents();

  try {
    const scanRes = await docClient.send(new ScanCommand({ TableName: 'ggsc-events' }));
    const items = scanRes.Items || [];

    // Sort events by created_at desc (newest first)
    items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return res.status(200).json({ success: true, events: items });
  } catch (err) {
    console.error("Fetch events error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 18. POST /api/events (Create an event, Auth required: admin, operations team, member)
app.post('/api/events', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operations team' && req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied: Only Admins, Operations Team, or Core Members can launch cards.' });
  }

  const { title, date, venue, desc, img, tag, route, folder, status } = req.body;
  if (!title || !date || !venue || !desc) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const created_at = new Date().toISOString();

  const newEvent = {
    id,
    title,
    date,
    venue,
    desc,
    img: img || '/img/event-banner.png',
    tag: tag || 'General',
    route: route || `/events/${title.replace(/[^a-zA-Z0-9]/g, '')}`,
    folder: folder || id,
    status: status || 'upcoming',
    created_at
  };

  try {
    await docClient.send(new PutCommand({
      TableName: 'ggsc-events',
      Item: newEvent
    }));
    return res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    console.error("Create event error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 19. PUT /api/events/:id (Update an event, Auth required: admin, operations team, member)
app.put('/api/events/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operations team' && req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied: Only Admins, Operations Team, or Core Members can modify cards.' });
  }

  const { id } = req.params;
  const updates = req.body;

  try {
    const getRes = await docClient.send(new GetCommand({
      TableName: 'ggsc-events',
      Key: { id }
    }));
    const existing = getRes.Item;

    if (!existing) {
      return res.status(404).json({ error: 'Event card not found.' });
    }

    const updatedEvent = {
      ...existing,
      ...updates,
      id // preserve original partition key ID
    };

    await docClient.send(new PutCommand({
      TableName: 'ggsc-events',
      Item: updatedEvent
    }));

    return res.status(200).json({ success: true, event: updatedEvent });
  } catch (err) {
    console.error("Update event error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 20. DELETE /api/events/:id (Delete an event, Auth required: admin, operations team, member)
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operations team' && req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied: Only Admins, Operations Team, or Core Members can delete cards.' });
  }

  const { id } = req.params;

  try {
    await docClient.send(new DeleteCommand({
      TableName: 'ggsc-events',
      Key: { id }
    }));
    return res.status(200).json({ success: true, message: 'Event card deleted successfully.' });
  } catch (err) {
    console.error("Delete event error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 21. POST /api/upload-ticket-cloudinary (Upload ticket image to Cloudinary securely)
app.post('/api/upload-ticket-cloudinary', authenticateToken, async (req, res) => {
  const { ticketImage, eventName, recipientName, cloudName, apiKey, apiSecret } = req.body;
  if (!ticketImage) {
    return res.status(400).json({ error: 'Missing required parameter: ticketImage' });
  }

  // Use environment variables or server defaults to avoid exposing secret keys to client bundle
  const targetCloudName = cloudName || process.env.CLOUDINARY_CLOUD_NAME || 'e2qvanrx';
  const targetApiKey = apiKey || process.env.CLOUDINARY_API_KEY || '453893951347733';
  const targetApiSecret = apiSecret || process.env.CLOUDINARY_API_SECRET || 'H4U5yHil42FC0Su25JavgKl1eRs';

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const cleanEvent = (eventName || 'general').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
    const cleanParticipant = (recipientName || 'participant').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');

    const folder = cleanEvent;
    const public_id = `${cleanParticipant}_${cleanEvent}`;

    // Generate SHA-1 signature for Cloudinary upload (sorted keys: folder, public_id, timestamp)
    const stringToSign = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}${targetApiSecret}`;
    const cryptoModule = await import('crypto');
    const signature = cryptoModule.createHash('sha1').update(stringToSign).digest('hex');

    const formData = new URLSearchParams();
    formData.append('file', ticketImage);
    formData.append('api_key', targetApiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', folder);
    formData.append('public_id', public_id);
    formData.append('signature', signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${targetCloudName}/image/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    const cldData = await response.json();
    if (!response.ok || cldData.error) {
      throw new Error(cldData.error?.message || 'Cloudinary upload failed');
    }

    return res.status(200).json({
      success: true,
      url: cldData.secure_url || cldData.url,
      public_id: cldData.public_id
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload ticket to Cloudinary.' });
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
