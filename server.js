// Simple API Server for Onyx Launcher
// This server handles authentication requests from the launcher

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`\n[REQUEST] ${req.method} ${req.url}`);
  console.log('[HEADERS]', req.headers);
  console.log('[BODY]', req.body);
  next();
});

// ==========================================
// USER DATABASE - FIXED FOR RAILWAY
// ==========================================
const DEFAULT_RAILWAY_FILE = path.join(__dirname, 'users-railway.json');
const DEFAULT_RAILWAY_FILE = path.join(__dirname, 'users-railway.json');
const DEFAULT_LOCAL_FILE = 'C:\\Users\\webor\\Desktop\\bot_register\\users.json';

let BOT_USERS_FILE;
if (process.env.BOT_USERS_FILE) {
  BOT_USERS_FILE = process.env.BOT_USERS_FILE;
} else if (fs.existsSync(DEFAULT_RAILWAY_FILE)) {
  BOT_USERS_FILE = DEFAULT_RAILWAY_FILE;
} else {
  BOT_USERS_FILE = DEFAULT_LOCAL_FILE;
}

console.log('[DB] Using database file:', BOT_USERS_FILE);

let BOT_USERS_FILE;
if (process.env.BOT_USERS_FILE) {
  BOT_USERS_FILE = process.env.BOT_USERS_FILE;
} else if (fs.existsSync(DEFAULT_RAILWAY_FILE)) {
  BOT_USERS_FILE = DEFAULT_RAILWAY_FILE;
} else {
  BOT_USERS_FILE = DEFAULT_LOCAL_FILE;
}

console.log('[DB] Using database file:', BOT_USERS_FILE);

function loadUsers() {
  try {
    if (fs.existsSync(BOT_USERS_FILE)) {
      const data = fs.readFileSync(BOT_USERS_FILE, 'utf8');
      const usersData = JSON.parse(data);
      console.log(`[DB] ✓ Loaded ${Object.keys(usersData).length} users from bot database`);
      return usersData;
    } else {
      console.warn('[DB] ⚠ users.json not found at:', BOT_USERS_FILE);
      console.warn('[DB] Using fallback user database');
      return {};
    }
  } catch (error) {
    console.error('[DB] ✗ Error loading users.json:', error.message);
    return {};
  }
}

let usersDatabase = loadUsers();

setInterval(() => {
  try {
    if (fs.existsSync(BOT_USERS_FILE)) {
      const data = fs.readFileSync(BOT_USERS_FILE, 'utf8');
      usersDatabase = JSON.parse(data);
    }
  } catch (error) {
    console.error('[DB] ✗ Error reloading users:', error.message);
  }
}, 10000);

// ==========================================
// API ROUTES
// ==========================================

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Onyx Launcher API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/verify-login', (req, res) => {
  const { email, password } = req.body;

  console.log('[AUTH] Login attempt:', email);
  console.log('[DEBUG] Password received:', password);
  console.log('[DEBUG] Total users in database:', Object.keys(usersDatabase).length);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis'
    });
  }

  let foundUser = null;
  let userId = null;

  console.log('[DEBUG] Searching in users:');
  for (const [id, userData] of Object.entries(usersDatabase)) {
    console.log(`  - ID: ${id}, Email: ${userData.email}, Username: ${userData.username}`);

    if (userData.email === email) {
      console.log(`[DEBUG] Found matching email!`);
      console.log(`[DEBUG] Stored password: "${userData.password}"`);
      console.log(`[DEBUG] Provided password: "${password}"`);
      console.log(`[DEBUG] Passwords match: ${userData.password === password}`);

      if (userData.password === password) {
        foundUser = userData;
        userId = id;
        break;
      }
    }
  }

  if (foundUser) {
    console.log('[AUTH] ✓ Login successful:', foundUser.username);
    return res.json({
      success: true,
      user: {
        id: userId,
        email: foundUser.email,
        username: foundUser.username,
        discordId: foundUser.discordId || userId
      }
    });
  } else {
    console.log('[AUTH] ✗ Login failed: Invalid credentials');
    console.log('[DEBUG] No matching user found');
    return res.status(401).json({
      success: false,
      message: 'Email ou mot de passe invalide'
    });
  }
});

app.post('/api/register', (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      message: 'Tous les champs sont requis'
    });
  }

  res.status(501).json({
    success: false,
    message: 'Enregistrement désactivé - utilisez le bot Discord'
  });
});

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('   ONYX LAUNCHER API SERVER');
  console.log('========================================');
  console.log(`✓ Server started on port ${PORT}`);
  console.log(`✓ API URL: http://localhost:${PORT}`);
  console.log(`✓ Status: ONLINE`);
  console.log(`✓ Database: ${BOT_USERS_FILE}`);
  console.log(`✓ Users loaded: ${Object.keys(usersDatabase).length}`);
  console.log('\n[INFO] Syncing with bot database every 10 seconds');
  console.log('[INFO] Press Ctrl+C to stop the server');
  console.log('========================================\n');
});

process.on('SIGINT', () => {
  console.log('\n[INFO] Shutting down API server...');
  process.exit(0);
});
