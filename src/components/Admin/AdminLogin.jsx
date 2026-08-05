import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';
import { authenticateBiometric } from '../../services/webauthn';
import { FiLock, FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Fingerprint } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('volunteer'); // default role
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if browser/device supports WebAuthn and platform biometrics
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setBiometricSupported(available);
        })
        .catch(() => setBiometricSupported(false));
    }
  }, []);

  // Standard password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password || !role) {
      setError('Please fill in email, password, and select your role.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await apiClient.post('/api/login', {
        email: email.trim().toLowerCase(),
        password,
        role // 'admin' | 'member' | 'volunteer' | 'oops'
      });

      // Establish the session locally if tokens exist
      const { session } = data;
      if (session?.access_token) {
        apiClient.setToken(session.access_token);
      }

      setSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // Biometric fingerprint login
  const handleBiometricLogin = async () => {
    if (!email) {
      setError('Please enter your email to login with biometrics.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Fetch challenge and registered credentials from our serverless API
      const resData = await apiClient.post('/api/get-biometric-challenge', { 
        email: email.trim().toLowerCase() 
      });

      const { challenge, challengeToken, credentialIds } = resData;

      // 2. Perform WebAuthn assertion (biometric scanning)
      // Pass all registered credential IDs
      const assertionPayload = await authenticateBiometric(credentialIds, challenge);

      // 3. Send signature verification request to serverless verify endpoint
      const verifyData = await apiClient.post('/api/verify-biometric', {
        email: email.trim().toLowerCase(),
        challengeToken,
        assertion: assertionPayload,
      });

      // 4. Authenticate the client session dynamically using returned session tokens
      const { session } = verifyData;
      if (session?.access_token) {
        apiClient.setToken(session.access_token);
      }

      setSuccess('Biometrics verified! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Biometric verification failed.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
      <div className="w-full max-w-md space-y-8 p-8 rounded-3xl" style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white select-none"
               style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}>
            <FiLock size={26} />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-neutral-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            GGSC Admin Portal
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Sign in to manage event tickets and attendance
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-xl text-red-600 bg-red-50 border border-red-200">
            <FiAlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-xl text-green-700 bg-green-50 border border-green-200">
            <FiCheckCircle size={16} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handlePasswordLogin}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Select Portal Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded-2xl border border-neutral-200 bg-white/50 py-3 px-3 text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="volunteer">Volunteer</option>
                <option value="oops">Oops team</option>
              </select>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', display: 'flex', alignItems: 'center' }} className="pointer-events-none text-neutral-400">
                  <FiMail size={16} />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-neutral-200 bg-white/50 py-3 pl-10 pr-3 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                  placeholder="admin@ggsc.org"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', display: 'flex', alignItems: 'center' }} className="pointer-events-none text-neutral-400">
                  <FiLock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-neutral-200 bg-white/50 py-3 pl-10 pr-3 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl py-3 text-sm font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #4285F4, #34A853)',
              }}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Sign In with Password'
              )}
            </button>

            {/* Biometric Button */}
            {biometricSupported && (
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 py-3 text-sm font-bold text-neutral-700 transition-all shadow-sm hover:shadow"
              >
                <Fingerprint size={18} className="text-blue-500" />
                Login with Fingerprint
              </button>
            )}
            {/* Back to Home Button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-400 bg-transparent py-2.5 text-xs font-bold text-neutral-500 hover:text-neutral-600 transition-all mt-1"
            >
              ← Back to Main Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
