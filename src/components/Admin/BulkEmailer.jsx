import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { FiUpload, FiPlay, FiCheckCircle, FiAlertCircle, FiMail, FiBookmark, FiTrash, FiRefreshCw, FiCopy, FiInfo, FiSend, FiList } from 'react-icons/fi';
import { apiClient } from '../../lib/apiClient';

const DEFAULT_EMAIL_TEMPLATE = `Hello {FULL NAME},

We are pleased to reach out to you from the Google Gemini Student Community at UEM Kolkata.

This is a bulk update regarding your registration/attendance details:
Email: {EMAIL}

Please keep an eye out for further updates.

Best regards,
GGSC Organizing Committee`;

export default function BulkEmailer({ userRole, userEmail }) {
  const role = userRole || localStorage.getItem('ggsc_mock_role') || 'admin';
  const activeEmail = userEmail || localStorage.getItem('ggsc_mock_email') || 'admin@ggsc.org';

  const [csvRawData, setCsvRawData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [parseMeta, setParseMeta] = useState(null);
  
  // SMTP settings (shared with Ticket Generator using local storage)
  const [smtpHost, setSmtpHost] = useState(localStorage.getItem('ggsc_smtp_host') || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(localStorage.getItem('ggsc_smtp_port') || '587');
  const [smtpSecure, setSmtpSecure] = useState(localStorage.getItem('ggsc_smtp_secure') === 'true');
  const [smtpUser, setSmtpUser] = useState(localStorage.getItem('ggsc_smtp_user') || '');
  const [smtpPass, setSmtpPass] = useState(localStorage.getItem('ggsc_smtp_pass') || '');
  const [smtpFromName, setSmtpFromName] = useState(localStorage.getItem('ggsc_smtp_from_name') || 'GGSC Organizing Team');

  // Email Config
  const [emailSubject, setEmailSubject] = useState(localStorage.getItem('ggsc_emailer_subject') || 'GGSC Announcement');
  const [mailTemplate, setMailTemplate] = useState(localStorage.getItem('ggsc_emailer_template') || DEFAULT_EMAIL_TEMPLATE);

  // CSV Mappings
  const [nameColumn, setNameColumn] = useState('');
  const [emailColumn, setEmailColumn] = useState('');

  // Queue and status state
  const [recipients, setRecipients] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copyNotification, setCopyNotification] = useState('');

  // Save specific email config to localStorage on change
  useEffect(() => {
    localStorage.setItem('ggsc_emailer_subject', emailSubject);
    localStorage.setItem('ggsc_emailer_template', mailTemplate);
  }, [emailSubject, mailTemplate]);

  // Sync SMTP config changes to localStorage
  useEffect(() => {
    localStorage.setItem('ggsc_smtp_host', smtpHost);
    localStorage.setItem('ggsc_smtp_port', smtpPort);
    localStorage.setItem('ggsc_smtp_secure', smtpSecure.toString());
    localStorage.setItem('ggsc_smtp_user', smtpUser);
    localStorage.setItem('ggsc_smtp_pass', smtpPass);
    localStorage.setItem('ggsc_smtp_from_name', smtpFromName);
  }, [smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFromName]);

  // Parse CSV
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    parseCsvFile(file);
  };

  const parseCsvFile = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h ? h.trim() : '',
      complete: (results) => {
        try {
          const rawRows = results.data || [];
          if (rawRows.length === 0) {
            alert('CSV file is empty.');
            return;
          }

          const headers = (results.meta.fields || [])
            .map(h => h ? String(h).trim() : '')
            .filter(h => h !== '');
          setCsvHeaders(headers);

          // Auto detect name and email columns dynamically
          const detectedEmail = headers.find(h => {
            const lower = String(h).toLowerCase();
            return lower.includes('email') || lower.includes('e-mail') || lower.includes('mail');
          }) || headers[1] || headers[0] || '';

          const detectedName = headers.find(h => {
            const lower = String(h).toLowerCase();
            return lower.includes('name') && h !== detectedEmail;
          }) || headers.find(h => h !== detectedEmail) || headers[0] || '';

          setNameColumn(detectedName);
          setEmailColumn(detectedEmail);

          // Clean rows to verify they are valid objects and contain some values
          const cleanRows = rawRows.filter(row => {
            if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
            return Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== '');
          });

          setCsvRawData(cleanRows);
          setParseMeta({
            delimiter: results.meta.delimiter,
            errors: results.errors || []
          });

          // Populate local recipient list with extra raw properties
          const validRecipients = cleanRows.map((row, idx) => ({
            id: idx,
            name: (detectedName && row[detectedName]) ? String(row[detectedName]).trim() : 'Recipient',
            email: (detectedEmail && row[detectedEmail]) ? String(row[detectedEmail]).trim() : '',
            status: 'ready', // 'ready' | 'sending' | 'success' | 'failed'
            message: '',
            rawData: row
          }));

          setRecipients(validRecipients);
        } catch (error) {
          console.error('Error handling parsed CSV:', error);
          alert('Failed to process CSV file contents: ' + error.message);
        }
      },
      error: (err) => {
        console.error('Papa.parse error:', err);
        alert('Failed to read CSV file: ' + err.message);
      }
    });
  };

  // Re-read CSV from raw memory to reload and reset statuses
  const handleRefresh = () => {
    if (csvRawData.length === 0) return;
    try {
      setRecipients(csvRawData.map((row, idx) => ({
        id: idx,
        name: (nameColumn && row[nameColumn]) ? String(row[nameColumn]).trim() : 'Recipient',
        email: (emailColumn && row[emailColumn]) ? String(row[emailColumn]).trim() : '',
        status: 'ready',
        message: '',
        rawData: row
      })));
      setProgress(0);
    } catch (err) {
      console.error('Error refreshing CSV list:', err);
    }
  };

  // Delete individual recipient
  const handleDeleteRow = (id) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  // Clear everything
  const handleClearAll = () => {
    setCsvRawData([]);
    setCsvHeaders([]);
    setRecipients([]);
    setProgress(0);
    setParseMeta(null);
  };

  // Copy token helper
  const copyToken = (header) => {
    const token = `{${header}}`;
    navigator.clipboard.writeText(token);
    setCopyNotification(token);
    setTimeout(() => setCopyNotification(''), 2000);
  };

  // Template compiler
  const compileTemplate = (template, rowData) => {
    if (!rowData) return template;
    let result = template;
    Object.keys(rowData).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'gi');
      result = result.replace(regex, rowData[key] || '');
    });
    return result;
  };

  // HTML email wrapper (matches portal themes)
  const wrapEmailHtml = (plainText, recipientName) => {
    const bodyHtml = plainText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, '<br />');

    return `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 580px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background-color: #ffffff;">
        <div style="margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px;">
          <span style="font-size: 16px; font-weight: bold; color: #4285F4;">Google Gemini Student Community</span>
        </div>
        <div style="font-size: 14px; color: #374151;">${bodyHtml}</div>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; text-align: center;">
          This is an automated dispatch from the GGSC Organizing Team. Please do not reply.
        </div>
      </div>
    `;
  };

  // Trigger Bulk Send
  const startBulkEmail = async (targetFailedOnly = false) => {
    if (recipients.length === 0) {
      alert('No recipients available. Please upload a CSV first.');
      return;
    }

    if (!smtpUser || !smtpPass || !smtpHost || !smtpPort) {
      alert('Please fill out all SMTP Configuration details.');
      return;
    }

    setIsProcessing(true);

    const smtpConfig = {
      host: role === 'oops' ? smtpHost : 'smtp.gmail.com',
      port: role === 'oops' ? smtpPort : (smtpSecure ? '465' : '587'),
      secure: smtpSecure,
      user: role === 'oops' ? smtpUser : activeEmail,
      pass: smtpPass,
      fromName: role === 'oops' ? smtpFromName : 'GGSC Organizing Team'
    };

    const updated = [...recipients];
    const indicesToProcess = updated
      .map((r, i) => ({ item: r, originalIndex: i }))
      .filter(x => !targetFailedOnly || x.item.status === 'failed');

    for (let i = 0; i < indicesToProcess.length; i++) {
      const { originalIndex } = indicesToProcess[i];
      const recipient = updated[originalIndex];

      // Update status to sending
      updated[originalIndex] = { ...recipient, status: 'sending', message: 'Sending email...' };
      setRecipients([...updated]);

      const compiledSubject = compileTemplate(emailSubject, recipient.rawData);
      const compiledBody = compileTemplate(mailTemplate, recipient.rawData);
      const htmlBody = wrapEmailHtml(compiledBody, recipient.name);

      try {
        await apiClient.post('/api/send-email', {
          recipientEmail: recipient.email,
          subject: compiledSubject,
          htmlBody,
          smtpConfig
        });

        updated[originalIndex] = { ...recipient, status: 'success', message: 'Email sent successfully!' };
      } catch (err) {
        console.error(`Error sending to ${recipient.email}:`, err);
        updated[originalIndex] = { ...recipient, status: 'failed', message: err.message || 'SMTP Connection Error' };
      }

      setRecipients([...updated]);
      setProgress(Math.round(((i + 1) / indicesToProcess.length) * 100));
    }

    setIsProcessing(false);
  };

  const renderLargeGridLayout = () => {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Registration Portal: Bulk Emailer
          </h2>
          <p className="text-neutral-500 mt-1">Upload CSV, map mailing details, select custom variable tags, and dispatch bulk templates.</p>
        </div>

        {/* Top Section: Upload Source Assets */}
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2 mb-3">
              <FiUpload className="text-blue-500" /> Source Assets & Column Mapping
            </h3>
            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Participants CSV / Sheet</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              disabled={isProcessing}
              className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
            />
            {csvRawData.length > 0 && (
              <p className="text-xs text-green-600 font-bold mt-1.5 flex items-center gap-1">
                <FiCheckCircle /> Loaded {csvRawData.length} records
              </p>
            )}
            {parseMeta && (
              <div className="text-[10px] text-neutral-400 bg-neutral-50/50 p-2.5 rounded-xl border border-neutral-200/40 font-mono space-y-1 mt-2">
                <div>Detected Delimiter: "{parseMeta.delimiter || 'unknown'}"</div>
                {parseMeta.errors && parseMeta.errors.length > 0 && (
                  <div className="text-red-500 font-bold">Parse Errors: {parseMeta.errors.map(e => e.message).join(', ')}</div>
                )}
              </div>
            )}
          </div>

          {/* Auto-Matched columns */}
          {csvHeaders.length > 0 && (
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/50 flex flex-col justify-center">
              <h4 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider mb-2">Auto-Matched Columns</h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-neutral-700">
                <div className="py-1 border-b border-neutral-200/40">
                  <span className="text-neutral-400 font-medium block">Name Column:</span>
                  <span className="font-bold text-neutral-800">{nameColumn || 'Not Found'}</span>
                </div>
                <div className="py-1 border-b border-neutral-200/40">
                  <span className="text-neutral-400 font-medium block">Email Column:</span>
                  <span className="font-bold text-neutral-800">{emailColumn || 'Not Found'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Section: Side-by-Side large columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Spacious Template Editor (Rewriteable) */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiMail className="text-blue-500" /> Dispatch Subject & Body Template
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  disabled={isProcessing}
                  placeholder="e.g. Welcome to GGSC, {FULL NAME}!"
                  className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Email Body (Plain Text)</label>
                <textarea
                  value={mailTemplate}
                  onChange={(e) => setMailTemplate(e.target.value)}
                  disabled={isProcessing}
                  rows={14}
                  className="block w-full rounded-xl border border-neutral-200 bg-white p-4 font-sans text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setMailTemplate(DEFAULT_EMAIL_TEMPLATE)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-800 underline mt-1 block"
                >
                  Reset to default template
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Discovered Variables (Detailed grid) & Restricted SMTP Settings */}
          <div className="space-y-6">
            
            {/* Discovered Variables (Large grid display) */}
            {csvHeaders.length > 0 && (
              <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                  <FiBookmark className="text-amber-500" /> Discovered Variables
                </h3>
                <p className="text-[10px] text-neutral-400">Click a variable button to copy it. Paste it anywhere in your subject or body template to replace dynamically per person.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-[160px] overflow-y-auto pr-1">
                  {csvHeaders.map(header => (
                    <button
                      key={header}
                      onClick={() => copyToken(header)}
                      className="px-2.5 py-2 text-[10px] font-bold rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300 transition-all flex items-center justify-between gap-1"
                      title={`Click to copy {${header}}`}
                    >
                      <span className="truncate">{`{${header}}`}</span>
                      <FiCopy size={10} className="flex-shrink-0" />
                    </button>
                  ))}
                </div>

                {copyNotification && (
                  <p className="text-[10px] text-green-600 font-bold mt-2 animate-pulse">
                    Copied {copyNotification} to clipboard!
                  </p>
                )}
              </div>
            )}

            {/* Restricted SMTP Config Card */}
            <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                <FiSend className="text-purple-500" /> SMTP Emailer Config
              </h3>
              
              <div className="space-y-4">
                <div className="text-[11px] text-neutral-500 bg-neutral-100/50 p-3 rounded-2xl border border-neutral-200/20">
                  Gmail credentials will be used automatically. Login email: <span className="font-bold text-neutral-800">{activeEmail}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1">Gmail App Password</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Enter 16-character Gmail App Password"
                    className="block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-500">Security Connection Mode:</span>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-700 font-bold cursor-pointer bg-neutral-50 hover:bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200/50 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={smtpSecure}
                      onChange={(e) => {
                        setSmtpSecure(e.target.checked);
                        setSmtpPort(e.target.checked ? '465' : '587');
                      }}
                      disabled={isProcessing}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{smtpSecure ? 'Secure SSL/TLS (Port 465)' : 'Unsecure STARTTLS (Port 587)'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Full Width Recipients Queue */}
        {recipients.length > 0 && (
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                  <FiList className="text-blue-500" /> Recipients Queue ({recipients.length} entries)
                </h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">Filter out rows, refresh variables, or start dispatch.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-all border border-neutral-200"
                  title="Reset statuses and reload variables from CSV memory"
                >
                  <FiRefreshCw className={isProcessing ? 'animate-spin' : ''} size={12} /> Refresh
                </button>

                <button
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-200"
                >
                  <FiTrash size={12} /> Clear All
                </button>

                {hasFailedLogs && (
                  <button
                    onClick={() => startBulkEmail(true)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-sm"
                  >
                    <FiPlay size={12} /> Resend Failed
                  </button>
                )}

                <button
                  onClick={() => startBulkEmail(false)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                >
                  <FiPlay size={12} /> Start Bulk Emailing
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            {isProcessing && (
              <div className="space-y-1.5 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex justify-between items-center text-xs font-bold text-blue-700">
                  <span>Processing Email Dispatches...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Grid Scroll container */}
            <div className="overflow-x-auto border border-neutral-200/50 rounded-2xl bg-white/70">
              <table className="min-w-full text-xs">
                <thead className="bg-neutral-50/80 border-b border-neutral-200/60 text-neutral-500 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Variables Preview</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {recipients.map((recipient, i) => (
                    <tr key={recipient.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-neutral-400">{i + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-neutral-800">{recipient.name}</td>
                      <td className="px-4 py-2.5 font-medium">{recipient.email}</td>
                      <td className="px-4 py-2.5 text-neutral-500 max-w-[200px] truncate" title={recipient.rawData ? JSON.stringify(recipient.rawData) : ''}>
                        {recipient.rawData ? Object.entries(recipient.rawData)
                          .filter(([k]) => k && k !== nameColumn && k !== emailColumn)
                          .map(([k, v]) => `${k}:${v}`)
                          .join(' | ') : ''}
                      </td>
                      <td className="px-4 py-2.5">
                        {recipient.status === 'ready' && (
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-bold text-[9px] uppercase tracking-wider">
                            Ready
                          </span>
                        )}
                        {recipient.status === 'sending' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 w-max">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                            Sending
                          </span>
                        )}
                        {recipient.status === 'success' && (
                          <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 w-max border border-green-200">
                            <FiCheckCircle size={10} /> Success
                          </span>
                        )}
                        {recipient.status === 'failed' && (
                          <div className="flex flex-col gap-1 mt-1">
                            <span
                              className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 w-max border border-red-200 cursor-help"
                              title={recipient.message}
                            >
                              <FiAlertCircle size={10} /> Failed
                            </span>
                            <span className="text-[9px] text-red-500 font-bold max-w-[150px] leading-tight block truncate" title={recipient.message}>
                              {recipient.message}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => handleDeleteRow(recipient.id)}
                          disabled={isProcessing}
                          className="p-1 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 transition-all inline-flex items-center justify-center"
                          title="Exclude this recipient"
                        >
                          <FiTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const hasFailedLogs = recipients.some(r => r.status === 'failed');

  if (role !== 'oops') {
    return renderLargeGridLayout();
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-neutral-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Registration Portal: Bulk Emailer
        </h2>
        <p className="text-neutral-500 mt-1">Upload CSV, map mailing details, select custom variable tags, and dispatch bulk templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Uploads & Variables Mapping */}
        <div className="space-y-6 lg:col-span-1">
          {/* File Upload Card */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiUpload className="text-blue-500" /> Source Assets
            </h3>

            {/* CSV File input */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Participants CSV / Sheet</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={isProcessing}
                className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
              />
              {csvRawData.length > 0 && (
                <p className="text-xs text-green-600 font-bold mt-1.5 flex items-center gap-1">
                  <FiCheckCircle /> Loaded {csvRawData.length} records
                </p>
              )}
              {parseMeta && (
                <div className="text-[10px] text-neutral-400 bg-neutral-50/50 p-2.5 rounded-xl border border-neutral-200/40 font-mono space-y-1 mt-2">
                  <div>Detected Delimiter: "{parseMeta.delimiter || 'unknown'}"</div>
                  {parseMeta.errors && parseMeta.errors.length > 0 && (
                    <div className="text-red-500 font-bold">Parse Errors: {parseMeta.errors.map(e => e.message).join(', ')}</div>
                  )}
                </div>
              )}
            </div>

            {/* Column Mapping Status (Auto matched) */}
            {csvHeaders.length > 0 && (
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/50 space-y-2">
                <h4 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Auto-Matched Columns</h4>
                <div className="flex flex-col gap-1.5 text-xs text-neutral-700">
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200/40">
                    <span className="text-neutral-400 font-medium">Name Column:</span>
                    <span className="font-bold text-neutral-800">{nameColumn || 'Not Found'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-400 font-medium">Email Column:</span>
                    <span className="font-bold text-neutral-800">{emailColumn || 'Not Found'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Extracted Variables Token Box */}
          {csvHeaders.length > 0 && (
            <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                <FiBookmark className="text-amber-500" /> Discovered Variables
              </h3>
              <p className="text-[10px] text-neutral-400">Click a variable below to copy it. Paste it in your template to replace dynamically per person.</p>
              
              <div className="flex flex-wrap gap-1.5 pt-1">
                {csvHeaders.map(header => (
                  <button
                    key={header}
                    onClick={() => copyToken(header)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:border-neutral-300 transition-all flex items-center gap-1"
                    title={`Click to copy {${header}}`}
                  >
                    <FiCopy size={10} />
                    <span>{`{${header}}`}</span>
                  </button>
                ))}
              </div>

              {copyNotification && (
                <p className="text-[10px] text-green-600 font-bold mt-2 animate-pulse">
                  Copied {copyNotification} to clipboard!
                </p>
              )}
            </div>
          )}

          {/* SMTP Configuration Card */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiSend className="text-purple-500" /> SMTP Emailer Config
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  disabled={isProcessing}
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1">SMTP Port</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    disabled={isProcessing}
                    className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="flex items-end pb-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smtpSecure}
                      onChange={(e) => setSmtpSecure(e.target.checked)}
                      disabled={isProcessing}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    SSL/TLS
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Username (Email)</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  disabled={isProcessing}
                  placeholder="e.g. user@gmail.com"
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Password / App Password</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  disabled={isProcessing}
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Sender Display Name</label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  disabled={isProcessing}
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right side: Editor & Recipient Grid */}
        <div className="space-y-6 lg:col-span-2">
          {/* Template Editor Card */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiMail className="text-blue-500" /> Dispatch Subject & Body Template
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  disabled={isProcessing}
                  placeholder="e.g. Welcome to GGSC, {FULL NAME}!"
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Email Body (Plain Text)</label>
                <textarea
                  value={mailTemplate}
                  onChange={(e) => setMailTemplate(e.target.value)}
                  disabled={isProcessing}
                  rows={8}
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 p-4 font-sans text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setMailTemplate(DEFAULT_EMAIL_TEMPLATE)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-800 underline mt-1 block"
                >
                  Reset to default template
                </button>
              </div>
            </div>
          </div>

          {/* Recipients Grid Card */}
          {recipients.length > 0 && (
            <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                    <FiList className="text-blue-500" /> Recipients Queue ({recipients.length} entries)
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Filter out rows, refresh variables, or start dispatch.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-all border border-neutral-200"
                    title="Reset statuses and reload variables from CSV memory"
                  >
                    <FiRefreshCw className={isProcessing ? 'animate-spin' : ''} size={12} /> Refresh
                  </button>

                  <button
                    onClick={handleClearAll}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-200"
                  >
                    <FiTrash size={12} /> Clear All
                  </button>

                  {hasFailedLogs && (
                    <button
                      onClick={() => startBulkEmail(true)}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-sm"
                    >
                      <FiPlay size={12} /> Resend Failed
                    </button>
                  )}

                  <button
                    onClick={() => startBulkEmail(false)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <FiPlay size={12} /> Start Bulk Emailing
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              {isProcessing && (
                <div className="space-y-1.5 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex justify-between items-center text-xs font-bold text-blue-700">
                    <span>Processing Email Dispatches...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Grid Scroll container */}
              <div className="overflow-x-auto border border-neutral-200/50 rounded-2xl bg-white/70">
                <table className="min-w-full text-xs">
                  <thead className="bg-neutral-50/80 border-b border-neutral-200/60 text-neutral-500 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Variables Preview</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {recipients.map((recipient, i) => (
                      <tr key={recipient.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-neutral-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-bold text-neutral-800">{recipient.name}</td>
                        <td className="px-4 py-2.5 font-medium">{recipient.email}</td>
                        <td className="px-4 py-2.5 text-neutral-500 max-w-[200px] truncate" title={recipient.rawData ? JSON.stringify(recipient.rawData) : ''}>
                          {recipient.rawData ? Object.entries(recipient.rawData)
                            .filter(([k]) => k && k !== nameColumn && k !== emailColumn)
                            .map(([k, v]) => `${k}:${v}`)
                            .join(' | ') : ''}
                        </td>
                        <td className="px-4 py-2.5">
                          {recipient.status === 'ready' && (
                            <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-bold text-[9px] uppercase tracking-wider">
                              Ready
                            </span>
                          )}
                          {recipient.status === 'sending' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 w-max">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                              Sending
                            </span>
                          )}
                          {recipient.status === 'success' && (
                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 w-max border border-green-200">
                              <FiCheckCircle size={10} /> Success
                            </span>
                          )}
                          {recipient.status === 'failed' && (
                            <div className="flex flex-col gap-1 mt-1">
                              <span
                                className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 w-max border border-red-200 cursor-help"
                                title={recipient.message}
                              >
                                <FiAlertCircle size={10} /> Failed
                              </span>
                              <span className="text-[9px] text-red-500 font-bold max-w-[150px] leading-tight block truncate" title={recipient.message}>
                                {recipient.message}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => handleDeleteRow(recipient.id)}
                            disabled={isProcessing}
                            className="p-1 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 transition-all inline-flex items-center justify-center"
                            title="Exclude this recipient"
                          >
                            <FiTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
