import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configuration for the external backend
  // Priority: VITE_API_URL (if it looks like an absolute URL), or BACKEND_URL, or a placeholder
  let backendTarget = process.env.VITE_API_URL || process.env.BACKEND_URL;
  
  // If VITE_API_URL is just '/api', it's not a real target URL
  if (backendTarget === '/api' || !backendTarget) {
    backendTarget = process.env.BACKEND_URL || 'https://fintosoft.net/'; // Fallback
  }

  app.use(cors());
  app.use(express.json());
  
  // In-memory data storage
  const users: any[] = [];
  const permissions: any[] = [];
  const resetTokens: Map<string, string> = new Map(); // token -> email

  // API Request Logging
  app.use('/api', (req, res, next) => {
    console.log(`[Local API Request] ${req.method} ${req.url}`);
    next();
  });

  // Auth Routes
  app.post('/api/auth/register-admin', (req, res) => {
    const { username, email, password } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      username,
      email,
      password, // In a real app, hash this
      roleId: "69c5884b51b72171118729a7", // Default admin role ID
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    res.json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          roleId: newUser.roleId
        },
        token: 'mock-jwt-token-' + newUser._id
      }
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, username, password } = req.body;
    const identifier = email || username;
    
    const user = users.find(u => u.email === identifier || u.username === identifier);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          roleId: user.roleId
        },
        token: 'mock-jwt-token-' + user._id
      }
    });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    resetTokens.set(token, email);

    console.log(`[Auth] Password reset token for ${email}: ${token}`);

    res.json({
      success: true,
      message: 'Password reset token generated (see server logs)',
      token: token // Normally sent via email
    });
  });

  app.post('/api/auth/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    
    const email = resetTokens.get(token);
    if (!email) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = users.find(u => u.email === email);
    if (user) {
      user.password = newPassword;
      resetTokens.delete(token);
      return res.json({ success: true, message: 'Password reset successfully' });
    }

    res.status(404).json({ success: false, message: 'User not found' });
  });

  // Permissions Routes
  app.post('/api/permissions/create/:roleId', (req, res) => {
    const { roleId } = req.params;
    const { module, page, allowAll } = req.body;
    
    const newPermission = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      roleId,
      module,
      page,
      allowAll: allowAll || false,
      add: true,
      delete: true,
      edit: true,
      read: true,
      __v: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    permissions.push(newPermission);

    res.json({
      success: true,
      message: 'Role permission saved successfully',
      data: newPermission
    });
  });

  app.get('/api/permissions/list/:roleId', (req, res) => {
    const { roleId } = req.params;
    const rolePermissions = permissions.filter(p => p.roleId === roleId);
    
    res.json({
      success: true,
      message: 'Role permissions retrieved successfully',
      data: rolePermissions
    });
  });

  app.delete('/api/permissions/delete/:id', (req, res) => {
    const { id } = req.params;
    const index = permissions.findIndex(p => p._id === id);
    
    if (index !== -1) {
      permissions.splice(index, 1);
      return res.json({
        success: true,
        message: 'Permission record deleted successfully'
      });
    }

    res.status(404).json({ success: false, message: 'Permission record not found' });
  });

  // Local Health Check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'ERP Proxy Server is running',
      target: backendTarget,
      timestamp: new Date().toISOString()
    });
  });

  // Proxy /api requests to the external backend
  // This allows the frontend to call /api/... and have it forwarded to the real server
  if (backendTarget && !backendTarget.startsWith('/')) {
    console.log(`[Server] Setting up proxy for /api -> ${backendTarget}`);
    app.use('/api', createProxyMiddleware({
      target: backendTarget,
      changeOrigin: true,
      secure: false, // Set to false if using self-signed certs or ngrok
      on: {
        proxyReq: (proxyReq, req, res) => {
          // ngrok compatibility: skip the browser warning page
          proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          
          // Ensure the Authorization header is passed through
          const authHeader = req.headers['authorization'];
          if (authHeader) {
            proxyReq.setHeader('Authorization', authHeader);
          }
        },
        error: (err, req, res) => {
          console.error('[Proxy Error]', err.message);
          if (res && 'writeHead' in res) {
            res.writeHead(502, {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Backend server is unreachable via proxy',
              error: err.message
            }));
          }
        }
      }
    }));
  } else {
    console.warn('[Server] No external backend target configured. /api requests will only hit local handlers.');
  }

  // Vite static assets and HMR in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ERP System Server running at http://localhost:${PORT}`);
    console.log(`Configured backend target: ${backendTarget}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
