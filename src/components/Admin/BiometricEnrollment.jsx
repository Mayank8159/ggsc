import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { registerBiometric } from '../../services/webauthn';
import { FiTrash2, FiPlus, FiAlertCircle, FiCheckCircle, FiUpload } from 'react-icons/fi';
import { Fingerprint } from 'lucide-react';
import Papa from 'papaparse';

const MOCK_PROFILES = [
  { id: '1a111111-1111-4111-a111-111111111111', email: 'debojeetbanerjee06@gmail.com', display_name: 'Debojeet Baneerjee', role: 'admin', position: 'Secretary' },
  { id: '2b222222-2222-4222-a222-222222222222', email: 'swastikmanna2006@gmail.com', display_name: 'Swastik Manna', role: 'admin', position: 'Vice chairperson' },
  { id: '3c333333-3333-4333-a333-333333333333', email: 'tridibeshsen2002@gmail.com', display_name: 'Tridibesh Sen', role: 'operations team', position: 'Webdev' },
  { id: '4d444444-4444-4444-a444-444444444444', email: 'diptodeepbofficial@gmail.com', display_name: 'Diptodeep Biswas', role: 'operations team', position: 'Webdev' },
  { id: '5e555555-5555-4555-a555-555555555555', email: 'mayankfhacker@gmail.com', display_name: 'Mayank Kumar Sharma', role: 'operations team', position: 'Webdev Lead' }
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
    


    // Live session setup
    apiClient.get('/api/me').then(async (data) => {
      if (data?.profile) {
        const liveUser = data.profile;
        setCurrentUser(liveUser);
        setCurrentUserRole(liveUser.role);

        // Fetch all members list if admin/operations team
        if (liveUser.role === 'admin' || liveUser.role === 'operations team') {
          const profilesData = await apiClient.get('/api/profiles');
          if (profilesData?.profiles) setProfiles(profilesData.profiles);
        } else {
          // If member or volunteer, they can only manage their own credentials
          setProfiles([{
            id: liveUser.id,
            email: liveUser.email,
            display_name: liveUser.display_name,
            role: liveUser.role
          }]);
        }

        setSelectedMemberId(liveUser.id);
        loadCredentialsForUser(liveUser.id, false);
      }
    }).catch(err => console.error("Error setting up biometric session:", err));
  }, []);

  // Fetch credentials dynamically when selected member changes
  const handleMemberChange = (memberId) => {
    setSelectedMemberId(memberId);
    loadCredentialsForUser(memberId);
  };

  const loadCredentialsForUser = async (userId) => {
    setError('');
    setSuccess('');

    try {
      const data = await apiClient.get(`/api/webauthn?userId=${userId}`);
      setCredentials(data.credentials || []);
    } catch (err) {
      console.error('Error fetching credentials:', err);
    }
  };



  const getSelectedMemberObject = () => {
    return profiles.find(p => p.id === selectedMemberId) || {
      id: selectedMemberId,
      email: currentUser?.email || '',
      display_name: currentUser?.display_name || ''
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

    const expectedPassword = currentUserRole === 'admin' ? 'AdminBioAuth2026' : 'OopsBioAuth2026';
    if (password !== expectedPassword) {
      setError('Invalid biometric setup authorization password.');
      setLoading(false);
      return;
    }

    const targetMember = getSelectedMemberObject();

    try {
      setIsVerifying(false);
      setPassword(''); // clear password

      // Trigger WebAuthn fingerprint scanner for the selected target member
      const enrolledCred = await registerBiometric(targetMember.email, targetMember.id);

      // Write credential to table linked to target user id
      await apiClient.post('/api/webauthn', {
        id: enrolledCred.id,
        user_id: targetMember.id,
        public_key: enrolledCred.publicKeyPem,
        setupPassword: expectedPassword
      });

      setSuccess(`Fingerprint registered successfully for ${targetMember.display_name}!`);
      loadCredentialsForUser(targetMember.id);
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

    try {
      await apiClient.delete(`/api/webauthn/${credId}`);
      setSuccess('Biometric key removed successfully.');
      loadCredentialsForUser(targetMember.id);
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
              className="block w-full rounded-xl border border-neutral-200 bg-white py-2.5 px-3 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.display_name} ({p.email}) - {p.position || 'No Position'} ({p.role.toUpperCase()})
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
                <div key={cred.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-neutral-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500 flex-shrink-0">
                      <Fingerprint size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-neutral-800">Biometric Authenticator #{idx + 1}</p>
                      <p className="text-xs text-neutral-400">Enrolled on: {cred.created_at ? new Date(cred.created_at).toLocaleDateString() : 'N/A'} {cred.created_at ? new Date(cred.created_at).toLocaleTimeString() : ''}</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate w-full max-w-[200px] xs:max-w-xs sm:max-w-md" title={cred.id}>ID: {cred.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCredential(cred.id)}
                    className="self-end sm:self-auto p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
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
