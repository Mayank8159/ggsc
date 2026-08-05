import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../lib/apiClient';
import { Html5Qrcode } from 'html5-qrcode';
import * as XLSX from 'xlsx';
import { FiCamera, FiRefreshCw, FiCheck, FiX, FiAlertCircle, FiDownload, FiUserCheck, FiTrash2 } from 'react-icons/fi';

export default function AttendancePortal() {
  const [scannerActive, setScannerActive] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'duplicate' | 'error'
  const [scanMessage, setScanMessage] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [volunteerUser, setVolunteerUser] = useState(null);

  const qrReaderRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    // Get logged-in user details
    apiClient.get('/api/me').then((data) => {
      if (data?.profile) setVolunteerUser(data.profile);
    }).catch(err => console.error("Error fetching me in AttendancePortal:", err));

    fetchRecentLogs();

    // 5-second background polling
    const interval = setInterval(() => {
      fetchRecentLogs();
    }, 5000);

    // Cleanup scanner on unmount
    return () => {
      clearInterval(interval);
      stopScanner();
    };
  }, []);

  // Fetch recent check-ins from centralised DynamoDB database
  const fetchRecentLogs = async () => {
    try {
      const data = await apiClient.get('/api/attendance');
      setRecentLogs(data.records || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setRecentLogs([]);
    }
  };

  const handleRefresh = async () => {
    await fetchRecentLogs();
  };

  const handleDeleteEntry = async (email) => {
    if (!window.confirm(`Are you sure you want to delete check-in entry for ${email}?`)) {
      return;
    }

    try {
      await apiClient.delete(`/api/attendance/${email}`);
      fetchRecentLogs();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete check-in entry.');
    }
  };

  // Start HTML5 Camera QR Code scanner
  const startScanner = async () => {
    setScannerActive(true);
    setScanStatus('idle');
    setScanMessage('');
    setStudentDetails(null);

    // Wait for the DOM element to mount
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode('reader-element');
        scannerInstanceRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' }, // Enforces rear/back camera
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            }
          },
          onScanSuccess,
          onScanFailure
        );
      } catch (err) {
        console.error('Failed to start camera scanner:', err);
        setScanStatus('error');
        setScanMessage('Failed to access device camera. Make sure permissions are granted and HTTP/HTTPS is secure.');
        setScannerActive(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerInstanceRef.current && scannerInstanceRef.current.isScanning) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScannerActive(false);
  };

  // Triggered when QR Code is successfully read
  const onScanSuccess = async (decodedText) => {
    // 1. Temporarily pause scanning to prevent multiple hits
    await stopScanner();
    setScanStatus('verifying');
    setScanMessage('Verifying ticket details in backend...');

    try {
      // 2. Parse decoded QR JSON string
      let decodedData;
      try {
        decodedData = JSON.parse(decodedText);
      } catch {
        // Handle plain email string scan fallback
        if (decodedText && decodedText.includes('@')) {
          decodedData = {
            email: decodedText.trim(),
            name: decodedText.split('@')[0]
          };
        } else {
          throw new Error('Invalid QR code format. Ticket structure is corrupted.');
        }
      }

      // Fuzzy key search to extract fields from custom CSV mapping layouts
      const findValue = (patterns) => {
        if (typeof decodedData !== 'object' || decodedData === null) return undefined;
        const key = Object.keys(decodedData).find(k => patterns.some(p => k.toLowerCase().includes(p.toLowerCase())));
        return key ? decodedData[key] : undefined;
      };

      const email = findValue(['email address', 'emailaddress', 'email']) || decodedData.email;
      const name = findValue(['full name', 'fullname', 'name']) || decodedData.name;
      const year = findValue(['year of study', 'yearofstudy', 'year']);
      const phone_number = findValue(['phone number', 'phonenumber', 'phone']);
      const enrolment_number = findValue(['enrollment number', 'enrollmentnumber', 'enrolment']);
      const sectionValue = findValue(['sec & roll', 'sec and roll', 'section', 'roll']);
      const position = findValue(['department', 'dept', 'position']);

      if (!email || !name) {
        throw new Error('Corrupted QR data. Essential fields name/email are missing.');
      }

      let roll_number = '';
      let section = sectionValue || '';
      if (sectionValue) {
        const match = sectionValue.toString().match(/[- ](\d+)$/);
        if (match) {
          roll_number = match[1];
        }
      }

      // Set matched student details for UI render
      setStudentDetails({
        name,
        email,
        year,
        section,
        roll_number,
        enrolment_number,
        phone_number,
        position
      });



      // 3. Attempt insert into centralized database
      try {
        await apiClient.post('/api/attendance', {
          email: email.toString().trim().toLowerCase(),
          name,
          year,
          section,
          roll_number,
          enrolment_number,
          phone_number,
          position,
          scanned_by: volunteerUser?.id || null
        });

        // Success check-in!
        setScanStatus('success');
        setScanMessage('Attendance successfully verified!');
        fetchRecentLogs();
      } catch (err) {
        if (err.message.includes('Duplicate scan') || err.message.includes('already been checked-in')) {
          setScanStatus('duplicate');
          setScanMessage('Already checked in today.');
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error(err);
      setScanStatus('error');
      setScanMessage(err.message || 'Verification failed. Database rejected operation.');
    }
  };

  const onScanFailure = (error) => {
    // Silently continue scanning while frames change, standard html5-qrcode behavior
  };

  // Export to CSV
  const exportToCSV = () => {
    if (recentLogs.length === 0) {
      alert('No attendance data available to export.');
      return;
    }

    const headers = ['Name', 'Email', 'Enrollment Number', 'Roll Number', 'Year', 'Section', 'Phone', 'Position', 'Scanned At'];
    const rows = recentLogs.map(log => [
      log.name,
      log.email,
      log.enrolment_number || '',
      log.roll_number || '',
      log.year || '',
      log.section || '',
      log.phone_number || '',
      log.position || '',
      new Date(log.scanned_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GGSC_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel (.xlsx) using SheetJS
  const exportToExcel = () => {
    if (recentLogs.length === 0) {
      alert('No attendance data available to export.');
      return;
    }

    const formattedData = recentLogs.map((log, idx) => ({
      'S.No': idx + 1,
      'Full Name': log.name,
      'Email ID': log.email,
      'Enrollment No': log.enrolment_number,
      'Roll Number': log.roll_number,
      'Year': log.year,
      'Section': log.section,
      'Phone Number': log.phone_number,
      'Position': log.position,
      'Scan Timestamp': new Date(log.scanned_at).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
    
    // Auto-fit column widths
    const maxLens = Object.keys(formattedData[0]).map(key => 
      Math.max(key.length, ...formattedData.map(row => (row[key] || '').toString().length))
    );
    worksheet['!cols'] = maxLens.map(len => ({ wch: len + 3 }));

    XLSX.writeFile(workbook, `GGSC_Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Configuration Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Attendance & Verification Portal
          </h2>
          <p className="text-neutral-500 mt-1">Scan visitor QR code tickets using smartphone camera or export the master sheet logs.</p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 transition-all shadow-sm"
          >
            <FiDownload size={13} /> Export CSV
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow"
            style={{ background: 'linear-gradient(135deg, #34A853, #1A73E8)' }}
          >
            <FiDownload size={13} /> Export Excel (.xlsx)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Scanner Control & Result Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider w-full text-left">
              Mobile Scanner Window
            </h3>

            {/* Video Viewport / Feed Box */}
            <div className="w-full aspect-square max-w-[280px] bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden relative flex items-center justify-center">
              <style>{`
                #reader-element {
                  border: none !important;
                  width: 100% !important;
                  height: 100% !important;
                }
                #reader-element video {
                  object-fit: cover !important;
                  width: 100% !important;
                  height: 100% !important;
                  border-radius: 16px;
                }
                #reader-element__video_flow {
                  width: 100% !important;
                  height: 100% !important;
                }
                #reader-element__scan_region {
                  width: 100% !important;
                  height: 100% !important;
                }
              `}</style>
              {scannerActive ? (
                <div id="reader-element" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 text-neutral-500 space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                    <FiCamera size={22} />
                  </div>
                  <p className="text-xs font-semibold">Camera scanner deactivated.</p>
                  <button
                    onClick={startScanner}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow"
                  >
                    Activate Camera
                  </button>
                </div>
              )}
            </div>

            {/* Scanning Controls */}
            {scannerActive && (
              <button
                onClick={stopScanner}
                className="px-5 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-200 hover:bg-neutral-300 transition-all"
              >
                Close Camera
              </button>
            )}

            {/* Verification Status Cards */}
            {scanStatus !== 'idle' && (
              <div className="w-full p-4 rounded-2xl border transition-all text-center space-y-3">
                {scanStatus === 'verifying' && (
                  <div className="text-blue-600 space-y-1">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-2" />
                    <p className="text-sm font-bold">{scanMessage}</p>
                  </div>
                )}

                {scanStatus === 'success' && studentDetails && (
                  <div className="text-green-700 space-y-1.5">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200 mb-1">
                      <FiCheck size={20} />
                    </div>
                    <p className="text-sm font-extrabold">{scanMessage}</p>
                    <p className="text-xs text-neutral-800 font-semibold">{studentDetails.name}</p>
                    <p className="text-[10px] text-neutral-500 font-mono truncate">{studentDetails.email}</p>
                    <button
                      onClick={startScanner}
                      className="mt-2 px-3 py-1.5 text-[10px] font-bold text-white bg-green-600 rounded-lg"
                    >
                      Scan Next Ticket
                    </button>
                  </div>
                )}

                {scanStatus === 'duplicate' && studentDetails && (
                  <div className="text-amber-700 space-y-1.5">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200 mb-1">
                      <FiAlertCircle size={20} />
                    </div>
                    <p className="text-sm font-extrabold">Already Checked In</p>
                    <p className="text-xs text-neutral-500">{scanMessage}</p>
                    <p className="text-xs text-neutral-800 font-semibold mt-1">{studentDetails.name}</p>
                    <button
                      onClick={startScanner}
                      className="mt-2 px-3 py-1.5 text-[10px] font-bold text-white bg-amber-600 rounded-lg"
                    >
                      Dismiss & Scan Next
                    </button>
                  </div>
                )}

                {scanStatus === 'error' && (
                  <div className="text-red-700 space-y-1.5">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200 mb-1">
                      <FiX size={20} />
                    </div>
                    <p className="text-sm font-extrabold">Verification Denied</p>
                    <p className="text-xs text-red-600/80 leading-snug">{scanMessage}</p>
                    <button
                      onClick={startScanner}
                      className="mt-2 px-3 py-1.5 text-[10px] font-bold text-white bg-red-600 rounded-lg"
                    >
                      Try Scan Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Logs Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <FiUserCheck className="text-blue-500" /> Live Verification feed ({recentLogs.length} Checked-in)
              </h3>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-neutral-100/50 rounded-xl transition-all text-neutral-500"
                title="Refresh Logs"
              >
                <FiRefreshCw size={14} />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="max-h-[460px] overflow-y-auto space-y-2.5 border border-neutral-100 rounded-2xl p-3 bg-neutral-50/50">
              {recentLogs.length === 0 ? (
                <p className="text-xs text-neutral-500 italic text-center py-10">No entries logged yet. Activate scanning to verify registrations.</p>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center text-xs p-3.5 rounded-xl bg-white border border-neutral-100 shadow-sm"
                  >
                    <div>
                      <p className="font-extrabold text-neutral-800 text-sm">{log.name}</p>
                      <p className="text-neutral-400 font-semibold">{log.email}</p>
                      <p className="text-[10px] text-neutral-500 mt-1 flex flex-wrap gap-x-2">
                        <span>Roll: {log.roll_number || 'N/A'}</span>
                        <span>•</span>
                        <span>Enroll: {log.enrolment_number || 'N/A'}</span>
                        <span>•</span>
                        <span>Year: {log.year || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Verified</span>
                        <p className="text-[10px] text-neutral-400 mt-1.5 font-semibold font-mono">
                          {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {volunteerUser?.role === 'oops' && (
                        <button
                          onClick={() => handleDeleteEntry(log.email)}
                          className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-all rounded-lg"
                          title="Delete check-in entry"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
