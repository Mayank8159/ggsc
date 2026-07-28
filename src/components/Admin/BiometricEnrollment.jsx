import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { registerBiometric } from '../../services/webauthn';
import { FiTrash2, FiPlus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Fingerprint } from 'lucide-react';

const MOCK_PROFILES = [
  { id: 'mock-uid-admin', email: 'admin@ggsc.org', display_name: 'Super Admin', role: 'admin' },
  { id: 'mock-uid-oops', email: 'oops@ggsc.org', display_name: 'Oops Lead', role: 'oops' },
  { id: 'mock-uid-member', email: 'member@ggsc.org', display_name: 'Core Member', role: 'member' },
  { id: 'mock-uid-volunteer', email: 'volunteer@ggsc.org', display_name: 'Volunteer Scanner', role: 'volunteer' }
];

export default function BiometricEnrollment() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  
  // List of all system profiles/members (accessible by Admin/Oops)
  const [profiles, setProfiles] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  const [credentials, setCredentials] = useState([]);
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check WebAuthn support
    if (!window.PublicKeyCredential) {
      setIsSupported(false);
    }
    
    // Check mock mode
    const mockRole = localStorage.getItem('ggsc_mock_role');
    const mockEmail = localStorage.getItem('ggsc_mock_email');

    if (mockRole) {
      const emailVal = mockEmail || `${mockRole}@ggsc.org`;
      const mockUser = {
        id: `mock-uid-${mockRole}`,
        email: emailVal,
        role: mockRole,
        user_metadata: { display_name: emailVal.split('@')[0] }
      };
      setCurrentUser(mockUser);
      setCurrentUserRole(mockRole);
      
      // Seed default profiles in mock mode
      setProfiles(MOCK_PROFILES);
      // Pre-select the current active user by default
      const defaultId = mockUser.id;
      setSelectedMemberId(defaultId);
      loadCredentialsForUser(defaultId, true);
      return;
    }

    // Live session setup
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        const liveUser = data.user;
        setCurrentUser(liveUser);
        
        // Fetch role from profiles
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', liveUser.id)
          .maybeSingle();

        const role = prof?.role || 'volunteer';
        setCurrentUserRole(role);

        // Fetch all members list if admin/oops
        if (role === 'admin' || role === 'oops') {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, email, display_name, role')
            .order('display_name', { ascending: true });
          
          if (profs) setProfiles(profs);
        } else {
          // If member or volunteer, they can only manage their own credentials
          setProfiles([{
            id: liveUser.id,
            email: liveUser.email,
            display_name: liveUser.user_metadata?.display_name || liveUser.email.split('@')[0],
            role: role
          }]);
        }

        setSelectedMemberId(liveUser.id);
        loadCredentialsForUser(liveUser.id, false);
      }
    });
  }, []);

  // Fetch credentials dynamically when selected member changes
  const handleMemberChange = (memberId) => {
    setSelectedMemberId(memberId);
    const isMock = localStorage.getItem('ggsc_mock_role') || !import.meta.env.VITE_SUPABASE_URL;
    loadCredentialsForUser(memberId, isMock);
  };

  const loadCredentialsForUser = async (userId, isMock) => {
    setError('');
    setSuccess('');
    if (isMock) {
      const savedCreds = localStorage.getItem('ggsc_mock_biometric_creds');
      const allCreds = savedCreds ? JSON.parse(savedCreds) : [];
      // Filter credentials registered for this specific user
      setCredentials(allCreds.filter(c => c.user_id === userId));
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('webauthn_credentials')
        .select('id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setCredentials(data || []);
    } catch (err) {
      console.error('Error fetching credentials:', err);
    }
  };

  const getSelectedMemberObject = () => {
    return profiles.find(p => p.id === selectedMemberId) || {
      id: selectedMemberId,
      email: currentUser?.email || '',
      display_name: currentUser?.user_metadata?.display_name || ''
    };
  };

  // Verifies password and registers biometric credential
  const handleRegisterBiometrics = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Active session not found. Please log in again.');
      return;
    }
    if (!password) {
      setError('Password verification is required before enrolling biometrics.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const isMock = localStorage.getItem('ggsc_mock_role') || !import.meta.env.VITE_SUPABASE_URL;
    const targetMember = getSelectedMemberObject();

    if (isMock) {
      setIsVerifying(false);
      setPassword('');
      setLoading(false);

      try {
        // Trigger browser WebAuthn biometric prompt (registers for selected member)
        const enrolledCred = await registerBiometric(targetMember.email, targetMember.id);

        const savedCreds = localStorage.getItem('ggsc_mock_biometric_creds');
        const currentCreds = savedCreds ? JSON.parse(savedCreds) : [];

        const newCred = {
          id: enrolledCred.id,
          user_id: targetMember.id,
          created_at: new Date().toISOString()
        };

        const updatedCreds = [newCred, ...currentCreds];
        localStorage.setItem('ggsc_mock_biometric_creds', JSON.stringify(updatedCreds));
        
        // Refresh logs view for this user
        setCredentials(updatedCreds.filter(c => c.user_id === targetMember.id));
        setSuccess(`Biometrics registered successfully for ${targetMember.display_name}!`);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Biometric enrollment failed.');
      }
      return;
    }

    try {
      // Re-authenticate the active admin user session
      const { error: reauthErr } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password
      });

      if (reauthErr) {
        throw new Error('Re-authentication failed. Please check your admin password.');
      }

      setIsVerifying(false);
      setPassword(''); // clear password

      // Trigger WebAuthn fingerprint scanner for the selected target member
      const enrolledCred = await registerBiometric(targetMember.email, targetMember.id);

      // Write credential to table linked to target user id
      const { error: dbErr } = await supabase
        .from('webauthn_credentials')
        .insert({
          id: enrolledCred.id,
          user_id: targetMember.id,
          public_key: enrolledCred.publicKeyPem,
          counter: 0
        });

      if (dbErr) {
        if (dbErr.code === '23505') {
          throw new Error('This biometric device is already registered to this member\'s account.');
        }
        throw dbErr;
      }

      setSuccess(`Fingerprint registered successfully for ${targetMember.display_name}!`);
      loadCredentialsForUser(targetMember.id, false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Biometric enrollment failed.');
    } finally {
      setLoading(false);
    }
  };

  // Remove enrolled credential
  const handleDeleteCredential = async (credId) => {
    if (!window.confirm('Are you sure you want to remove this biometric login?')) return;
    
    setError('');
    setSuccess('');
    const targetMember = getSelectedMemberObject();
    const isMock = localStorage.getItem('ggsc_mock_role') || !import.meta.env.VITE_SUPABASE_URL;

    if (isMock) {
      const savedCreds = localStorage.getItem('ggsc_mock_biometric_creds');
      const currentCreds = savedCreds ? JSON.parse(savedCreds) : [];
      const updatedCreds = currentCreds.filter(c => c.id !== credId);
      
      localStorage.setItem('ggsc_mock_biometric_creds', JSON.stringify(updatedCreds));
      setCredentials(updatedCreds.filter(c => c.user_id === targetMember.id));
      setSuccess('Biometric key removed successfully.');
      return;
    }

    try {
      const { error: deleteErr } = await supabase
        .from('webauthn_credentials')
        .delete()
        .eq('id', credId);

      if (deleteErr) throw deleteErr;

      setSuccess('Biometric key removed successfully.');
      loadCredentialsForUser(targetMember.id, false);
    } catch (err) {
      setError(err.message || 'Failed to remove credentials.');
    }
  };

  if (!isSupported) {
    return (
      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-800 flex gap-3">
        <FiAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-base">Biometrics Unsupported</h3>
          <p className="text-sm mt-1">WebAuthn biometrics are not supported on this browser or platform. Ensure you are using HTTPS and a compatible modern browser (Chrome, Edge, Safari, Firefox) with fingerprint capability.</p>
        </div>
      </div>
    );
  }

  const targetMemberObj = getSelectedMemberObject();

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Fingerprint className="text-blue-500" /> Biometric Enrollment Hub
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Centralized enrollment workstation. Select a team member to register or remove their biometric fingerprint keys.
          </p>
        </div>

        {/* Member Directory Dropdown selection */}
        {profiles.length > 1 && (
          <div className="p-4 bg-neutral-100/50 rounded-2xl border border-neutral-200/40">
            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">Select Team Member to Manage</label>
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="block w-full max-w-md rounded-xl border border-neutral-200 bg-white py-2.5 px-3 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.display_name} ({p.email}) - {p.role.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

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

        {/* Register Actions */}
        {!isVerifying ? (
          <button
            onClick={() => {
              setIsVerifying(true);
              setError('');
              setSuccess('');
            }}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all shadow hover:shadow-md"
            style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}
          >
            <FiPlus size={16} /> Register Fingerprint for {targetMemberObj.display_name}
          </button>
        ) : (
          <form onSubmit={handleRegisterBiometrics} className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-4">
            <h4 className="text-sm font-bold text-neutral-800">Administrator Authorization</h4>
            <p className="text-xs text-neutral-500">Please enter your active administrator password to authorize biometric scanning for <strong>{targetMemberObj.display_name}</strong>.</p>
            <div className="space-y-3">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="block w-full max-w-sm rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Scan Fingerprint'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false);
                    setPassword('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-200 hover:bg-neutral-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Registered Devices List */}
        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Enrolled Biometric Keys ({targetMemberObj.display_name})</h3>
          {credentials.length === 0 ? (
            <p className="text-xs text-neutral-500 italic">No fingerprints registered for this member. Register one above to enable biometric logins for them.</p>
          ) : (
            <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden bg-white/60">
              {credentials.map((cred, idx) => (
                <div key={cred.id} className="flex items-center justify-between p-4 hover:bg-neutral-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500">
                      <Fingerprint size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800">Biometric Authenticator #{idx + 1}</p>
                      <p className="text-xs text-neutral-400">Enrolled on: {cred.created_at ? new Date(cred.created_at).toLocaleDateString() : 'N/A'} {cred.created_at ? new Date(cred.created_at).toLocaleTimeString() : ''}</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">ID: {cred.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCredential(cred.id)}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove key"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
