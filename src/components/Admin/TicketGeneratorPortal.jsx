import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import QRCode from 'qrcode';
import { supabase } from '../../lib/supabaseClient';
import { UPCOMING_EVENTS } from '../../data/eventsData';
import { FiUpload, FiSettings, FiSliders, FiPlay, FiList, FiCheckCircle, FiAlertCircle, FiCloud, FiMail, FiBookmark, FiTrash, FiRefreshCw } from 'react-icons/fi';

const DEFAULT_TEXT_TEMPLATE = `Hello {name},

We are excited to have you join us at the upcoming GGSC event!

Your personalized visual ticket containing your entry QR code has been generated and is attached to this email. Please carry a digital or printed copy of this ticket with you to the registration desk on the event day.

Important Event Guidelines:
- Please keep your QR code intact and clear.
- Do not share this ticket with anyone. Each ticket can only be scanned once.

See you at the event!

Best regards,
GGSC Organizing Committee
UEM Kolkata`;

export default function TicketGeneratorPortal() {
  const [csvRawData, setCsvRawData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [templateImage, setTemplateImage] = useState(null);
  const [imageName, setImageName] = useState('');
  
  // Selected Event from Upcoming Events dropdown
  const [selectedEvent, setSelectedEvent] = useState(UPCOMING_EVENTS[0]?.title || 'Cydropreneur');

  // Slider states for QR Code placement
  const [xPos, setXPos] = useState(100);
  const [yPos, setYPos] = useState(100);
  const [qrSize, setQrSize] = useState(150);

  // Skip options for response row slicing
  const [skipFirst, setSkipFirst] = useState(2);
  const [skipLast, setSkipLast] = useState(2);

  // Dynamic Column Mapping selections
  const [nameColumn, setNameColumn] = useState('');
  const [emailColumn, setEmailColumn] = useState('');
  const [selectedQrColumns, setSelectedQrColumns] = useState([]);

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState(localStorage.getItem('ggsc_smtp_host') || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(localStorage.getItem('ggsc_smtp_port') || '587');
  const [smtpSecure, setSmtpSecure] = useState(localStorage.getItem('ggsc_smtp_secure') === 'true');
  const [smtpUser, setSmtpUser] = useState(localStorage.getItem('ggsc_smtp_user') || '');
  const [smtpPass, setSmtpPass] = useState(localStorage.getItem('ggsc_smtp_pass') || '');
  const [smtpFromName, setSmtpFromName] = useState(localStorage.getItem('ggsc_smtp_from_name') || 'GGSC Organizing Team');

  // Cloudinary API Settings
  const [cldCloudName, setCldCloudName] = useState(localStorage.getItem('ggsc_cld_name') || '');
  const [cldApiKey, setCldApiKey] = useState(localStorage.getItem('ggsc_cld_key') || '');
  const [cldApiSecret, setCldApiSecret] = useState(localStorage.getItem('ggsc_cld_secret') || '');

  // Email Template Settings
  const [mailTemplate, setMailTemplate] = useState(localStorage.getItem('ggsc_mail_template') || DEFAULT_TEXT_TEMPLATE);

  // Presets State
  const [presets, setPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('ggsc_generator_presets');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [presetNameInput, setPresetNameInput] = useState('');

  // Queue states
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef(null);

  // Save Settings to localStorage on change
  useEffect(() => {
    localStorage.setItem('ggsc_smtp_host', smtpHost);
    localStorage.setItem('ggsc_smtp_port', smtpPort);
    localStorage.setItem('ggsc_smtp_secure', smtpSecure.toString());
    localStorage.setItem('ggsc_smtp_user', smtpUser);
    localStorage.setItem('ggsc_smtp_pass', smtpPass);
    localStorage.setItem('ggsc_smtp_from_name', smtpFromName);
    localStorage.setItem('ggsc_cld_name', cldCloudName);
    localStorage.setItem('ggsc_cld_key', cldApiKey);
    localStorage.setItem('ggsc_cld_secret', cldApiSecret);
    localStorage.setItem('ggsc_mail_template', mailTemplate);
  }, [smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFromName, cldCloudName, cldApiKey, cldApiSecret, mailTemplate]);

  // Update canvas preview
  useEffect(() => {
    if (!templateImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to the natural size of the image
    canvas.width = templateImage.naturalWidth;
    canvas.height = templateImage.naturalHeight;

    // Draw the ticket template
    ctx.drawImage(templateImage, 0, 0);

    // Draw the mock QR code box overlay (for visual preview)
    ctx.strokeStyle = '#4285F4';
    ctx.lineWidth = Math.max(2, templateImage.naturalWidth / 400);
    ctx.strokeRect(xPos, yPos, qrSize, qrSize);

    ctx.fillStyle = 'rgba(66, 133, 244, 0.15)';
    ctx.fillRect(xPos, yPos, qrSize, qrSize);

    ctx.fillStyle = '#4285F4';
    ctx.font = `bold ${Math.max(10, qrSize / 10)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QR CODE', xPos + qrSize / 2, yPos + qrSize / 2);
  }, [templateImage, xPos, yPos, qrSize]);

  // Save Current state as Preset
  const savePreset = () => {
    if (!presetNameInput.trim()) {
      alert('Please enter a name for the preset.');
      return;
    }

    let templateBase64 = '';
    if (templateImage) {
      const canvas = document.createElement('canvas');
      canvas.width = templateImage.naturalWidth;
      canvas.height = templateImage.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(templateImage, 0, 0);
      templateBase64 = canvas.toDataURL('image/jpeg', 0.85); // minor compression to stay in storage limit
    }

    const newPreset = {
      id: Date.now().toString(),
      name: presetNameInput.trim(),
      selectedEvent,
      csvRawData,
      csvHeaders,
      nameColumn,
      emailColumn,
      selectedQrColumns,
      skipFirst,
      skipLast,
      templateBase64,
      imageName,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      smtpFromName,
      cldCloudName,
      cldApiKey,
      cldApiSecret,
      mailTemplate,
      xPos,
      yPos,
      qrSize
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('ggsc_generator_presets', JSON.stringify(updatedPresets));
    setSelectedPresetId(newPreset.id);
    setPresetNameInput('');
    alert(`Preset "${newPreset.name}" saved!`);
  };

  // Load selected preset configuration
  const loadPreset = (presetId) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    setSelectedEvent(preset.selectedEvent || 'Cydropreneur');
    setCsvRawData(preset.csvRawData || []);
    setCsvHeaders(preset.csvHeaders || []);
    setNameColumn(preset.nameColumn || '');
    setEmailColumn(preset.emailColumn || '');
    setSelectedQrColumns(preset.selectedQrColumns || []);
    setSkipFirst(preset.skipFirst ?? 2);
    setSkipLast(preset.skipLast ?? 2);
    setImageName(preset.imageName || '');
    setXPos(preset.xPos ?? 100);
    setYPos(preset.yPos ?? 100);
    setQrSize(preset.qrSize ?? 150);

    setSmtpHost(preset.smtpHost || '');
    setSmtpPort(preset.smtpPort || '587');
    setSmtpSecure(preset.smtpSecure ?? false);
    setSmtpUser(preset.smtpUser || '');
    setSmtpPass(preset.smtpPass || '');
    setSmtpFromName(preset.smtpFromName || '');

    setCldCloudName(preset.cldCloudName || '');
    setCldApiKey(preset.cldApiKey || '');
    setCldApiSecret(preset.cldApiSecret || '');

    setMailTemplate(preset.mailTemplate || DEFAULT_TEXT_TEMPLATE);

    if (preset.templateBase64) {
      const img = new Image();
      img.onload = () => {
        setTemplateImage(img);
      };
      img.src = preset.templateBase64;
    } else {
      setTemplateImage(null);
    }

    if (preset.csvRawData && preset.csvRawData.length > 0) {
      const targetEmailCol = preset.emailColumn || '';
      const targetNameCol = preset.nameColumn || '';
      setLogs(preset.csvRawData.map(row => ({
        email: row[targetEmailCol] || '',
        name: row[targetNameCol] || '',
        status: 'ready',
        message: '',
        cldUrl: ''
      })));
    } else {
      setLogs([]);
    }
  };

  // Delete saved preset
  const deletePreset = (presetId) => {
    if (!window.confirm('Delete this preset?')) return;
    const updated = presets.filter(p => p.id !== presetId);
    setPresets(updated);
    localStorage.setItem('ggsc_generator_presets', JSON.stringify(updated));
    if (selectedPresetId === presetId) {
      setSelectedPresetId('');
    }
  };

  // CSV parsing handler with loose dynamic mapping
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawRows = results.data;
        if (rawRows.length === 0) {
          alert('CSV file is empty.');
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setCsvRawData(rawRows);

        // Auto-detect columns
        const findHeader = (patterns) => {
          return headers.find(h => patterns.some(p => h.toLowerCase().includes(p.toLowerCase())));
        };

        const detectedName = findHeader(['full name', 'fullname', 'name']) || headers[0] || '';
        const detectedEmail = findHeader(['email address', 'emailaddress', 'email']) || headers[1] || headers[0] || '';

        setNameColumn(detectedName);
        setEmailColumn(detectedEmail);
        setSelectedQrColumns(headers); // Default to including all columns in the QR payload
        
        // Populate initial logs queue
        setLogs(rawRows.map(row => ({
          email: row[detectedEmail] || '',
          name: row[detectedName] || '',
          status: 'ready',
          message: '',
          cldUrl: ''
        })));
      }
    });
  };

  // Toggle QR Payload Columns
  const handleToggleColumn = (header) => {
    if (selectedQrColumns.includes(header)) {
      setSelectedQrColumns(selectedQrColumns.filter(c => c !== header));
    } else {
      setSelectedQrColumns([...selectedQrColumns, header]);
    }
  };

  // Image template upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setTemplateImage(img);
        setXPos(Math.floor(img.naturalWidth * 0.1));
        setYPos(Math.floor(img.naturalHeight * 0.7));
        setQrSize(Math.floor(img.naturalWidth * 0.2));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Retries sending email only to the entries that failed
  const retryFailedEmails = async () => {
    if (isProcessing) return;
    
    const failedEntries = logs.filter(l => l.status === 'failed');
    if (failedEntries.length === 0) {
      alert('There are no failed entries in the queue to retry.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const smtpConfig = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPass,
      fromName: smtpFromName
    };

    const cloudinaryConfig = {
      cloudName: cldCloudName,
      apiKey: cldApiKey,
      apiSecret: cldApiSecret
    };

    let updatedLogs = [...logs];
    let completedRetries = 0;

    for (let i = 0; i < updatedLogs.length; i++) {
      if (updatedLogs[i].status !== 'failed') continue;

      const studentName = updatedLogs[i].name;
      const studentEmail = updatedLogs[i].email;

      // Locate corresponding raw CSV dataset row matching this email
      const rawRow = csvRawData.find(row => (row[emailColumn] || '').toLowerCase() === studentEmail.toLowerCase()) || {};

      updatedLogs[i] = { ...updatedLogs[i], message: 'Retrying: Rendering QR...' };
      setLogs([...updatedLogs]);

      try {
        const qrPayload = {};
        selectedQrColumns.forEach(col => {
          qrPayload[col] = rawRow[col] || '';
        });

        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
          margin: 1,
          width: qrSize,
          errorCorrectionLevel: 'L'
        });

        // Overlay onto Canvas
        const renderCanvas = document.createElement('canvas');
        renderCanvas.width = templateImage.naturalWidth;
        renderCanvas.height = templateImage.naturalHeight;
        const renderCtx = renderCanvas.getContext('2d');

        renderCtx.drawImage(templateImage, 0, 0);

        const qrImg = new Image();
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = qrDataUrl;
        });

        renderCtx.imageSmoothingEnabled = false;
        renderCtx.webkitImageSmoothingEnabled = false;
        renderCtx.mozImageSmoothingEnabled = false;
        renderCtx.msImageSmoothingEnabled = false;

        renderCtx.drawImage(qrImg, xPos, yPos, qrSize, qrSize);
        const finalTicketDataUrl = renderCanvas.toDataURL('image/jpeg', 0.85);

        // Upload to Cloudinary
        let cldPublicUrl = '';
        if (cldCloudName && cldApiKey && cldApiSecret) {
          updatedLogs[i] = { ...updatedLogs[i], message: 'Retrying: Uploading to Cloudinary...' };
          setLogs([...updatedLogs]);

          const cldRes = await fetch('/api/upload-ticket-cloudinary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticketImage: finalTicketDataUrl,
              eventName: selectedEvent,
              cloudinaryConfig
            })
          });

          const cldData = await cldRes.json();
          if (cldRes.ok) {
            cldPublicUrl = cldData.secure_url;
            updatedLogs[i] = { ...updatedLogs[i], cldUrl: cldPublicUrl };
          }
        }

        // Send Email
        updatedLogs[i] = { ...updatedLogs[i], message: 'Retrying: Connecting to SMTP...' };
        setLogs([...updatedLogs]);

        const response = await fetch('/api/send-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: studentEmail,
            recipientName: studentName,
            ticketImage: finalTicketDataUrl,
            smtpConfig,
            mailTemplate
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || 'Server rejected email dispatch.');
        }

        updatedLogs[i] = { ...updatedLogs[i], status: 'sent', message: 'Email sent successfully on retry!' };
      } catch (err) {
        console.error(`Retry failed for ${studentEmail}:`, err);
        updatedLogs[i] = { ...updatedLogs[i], status: 'failed', message: err.message || 'Retry failed.' };
      }

      setLogs([...updatedLogs]);
      completedRetries++;
      setProgress(Math.round((completedRetries / failedEntries.length) * 100));
    }

    setIsProcessing(false);
  };

  // Triggers batch distribution
  const startDistribution = async () => {
    if (csvRawData.length === 0) {
      alert('Please upload a participants CSV list.');
      return;
    }
    if (!templateImage) {
      alert('Please upload a visual ticket template image.');
      return;
    }
    if (!nameColumn || !emailColumn) {
      alert('Please configure Name and Email column mappings.');
      return;
    }
    if (!smtpUser || !smtpPass) {
      alert('Please configure SMTP Sender credentials.');
      return;
    }

    // Apply row slicing boundaries
    let dataToProcess = [...csvRawData];
    if (skipFirst > 0 || skipLast > 0) {
      const endLimit = Math.max(skipFirst, dataToProcess.length - skipLast);
      dataToProcess = dataToProcess.slice(skipFirst, endLimit);
    }

    if (dataToProcess.length === 0) {
      alert('No rows left to process after applying skip range slicing.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const smtpConfig = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPass,
      fromName: smtpFromName
    };

    const cloudinaryConfig = {
      cloudName: cldCloudName,
      apiKey: cldApiKey,
      apiSecret: cldApiSecret
    };

    // Reset logs tracker to match active processed items
    let updatedLogs = dataToProcess.map(row => ({
      email: row[emailColumn] || '',
      name: row[nameColumn] || '',
      status: 'ready',
      message: '',
      cldUrl: ''
    }));
    setLogs(updatedLogs);

    for (let i = 0; i < dataToProcess.length; i++) {
      const rawRow = dataToProcess[i];
      const studentName = rawRow[nameColumn] || '';
      const studentEmail = rawRow[emailColumn] || '';
      
      updatedLogs[i] = { ...updatedLogs[i], status: 'mailing', message: 'Rendering QR code...' };
      setLogs([...updatedLogs]);

      try {
        // Compile ONLY the selected columns into the QR code payload JSON
        const qrPayload = {};
        selectedQrColumns.forEach(col => {
          qrPayload[col] = rawRow[col] || '';
        });

        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
          margin: 1,
          width: qrSize,
          errorCorrectionLevel: 'L'
        });

        // Overlay onto Canvas
        const renderCanvas = document.createElement('canvas');
        renderCanvas.width = templateImage.naturalWidth;
        renderCanvas.height = templateImage.naturalHeight;
        const renderCtx = renderCanvas.getContext('2d');

        renderCtx.drawImage(templateImage, 0, 0);

        const qrImg = new Image();
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = qrDataUrl;
        });

        renderCtx.imageSmoothingEnabled = false;
        renderCtx.webkitImageSmoothingEnabled = false;
        renderCtx.mozImageSmoothingEnabled = false;
        renderCtx.msImageSmoothingEnabled = false;

        renderCtx.drawImage(qrImg, xPos, yPos, qrSize, qrSize);
        // Compress as JPEG to keep payload lightweight
        const finalTicketDataUrl = renderCanvas.toDataURL('image/jpeg', 0.85);

        // Upload to Cloudinary in event-specific folder via Serverless API
        let cldPublicUrl = '';
        if (cldCloudName && cldApiKey && cldApiSecret) {
          updatedLogs[i] = { ...updatedLogs[i], message: `Uploading ticket to Cloudinary (${selectedEvent})...` };
          setLogs([...updatedLogs]);

          const cldRes = await fetch('/api/upload-ticket-cloudinary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticketImage: finalTicketDataUrl,
              eventName: selectedEvent,
              cloudinaryConfig
            })
          });

          const cldData = await cldRes.json();
          if (cldRes.ok) {
            cldPublicUrl = cldData.secure_url;
            updatedLogs[i] = { ...updatedLogs[i], cldUrl: cldPublicUrl };
          } else {
            console.warn('Cloudinary upload error:', cldData.error);
          }
        }

        // Send Email via Nodemailer
        updatedLogs[i] = { ...updatedLogs[i], message: 'Connecting to SMTP & sending email...' };
        setLogs([...updatedLogs]);

        const response = await fetch('/api/send-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: studentEmail,
            recipientName: studentName,
            ticketImage: finalTicketDataUrl,
            smtpConfig,
            mailTemplate
          })
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || 'Server rejected email dispatch.');
        }

        updatedLogs[i] = { ...updatedLogs[i], status: 'sent', message: 'Email sent successfully!' };
      } catch (err) {
        console.error(`Error sending to ${studentEmail}:`, err);
        updatedLogs[i] = { ...updatedLogs[i], status: 'failed', message: err.message || 'Processing error.' };
      }

      setLogs([...updatedLogs]);
      setProgress(Math.round(((i + 1) / dataToProcess.length) * 100));
    }

    setIsProcessing(false);
  };

  const hasFailedLogs = logs.some(l => l.status === 'failed');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Configuration Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-neutral-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Registration Portal: Ticket Generator & Distributor
        </h2>
        <p className="text-neutral-500 mt-1">Select event, upload CSV, map fields, customize email template, and distribute tickets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Uploads & Configurations */}
        <div className="space-y-6 lg:col-span-1">
          {/* Preset Management Card */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiBookmark className="text-amber-500" /> Workspace Presets
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Load Preset</label>
                <div className="flex gap-2">
                  <select
                    value={selectedPresetId}
                    onChange={(e) => {
                      setSelectedPresetId(e.target.value);
                      loadPreset(e.target.value);
                    }}
                    className="block w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900 font-semibold"
                  >
                    <option value="">-- Select Saved Preset --</option>
                    {presets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {selectedPresetId && (
                    <button
                      onClick={() => deletePreset(selectedPresetId)}
                      className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all flex items-center justify-center flex-shrink-0"
                      title="Delete Preset"
                    >
                      <FiTrash size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-neutral-200/50 pt-3">
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Save Current State as Preset</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Workshop Preset 1"
                    value={presetNameInput}
                    onChange={(e) => setPresetNameInput(e.target.value)}
                    className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-1.5 text-xs focus:outline-none text-neutral-900"
                  />
                  <button
                    onClick={savePreset}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload & Column Selector Card */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiUpload className="text-blue-500" /> Event & Source Assets
            </h3>
            
            {/* Event Dropdown selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Select Upcoming Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                disabled={isProcessing}
                className="block w-full rounded-xl border border-neutral-200 bg-white/70 py-2.5 px-3 text-xs text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {UPCOMING_EVENTS.map(evt => (
                  <option key={evt.id} value={evt.title}>
                    {evt.title} ({evt.date})
                  </option>
                ))}
              </select>
            </div>

            {/* CSV upload */}
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
                  <FiCheckCircle /> Loaded {csvRawData.length} response rows
                </p>
              )}
            </div>

            {/* CSV Header Selectors & Mapping Options */}
            {csvHeaders.length > 0 && (
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/50 space-y-3">
                <h4 className="text-xs font-extrabold text-neutral-700 uppercase tracking-wider">CSV Data Field Mapping</h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1">Mailing Name Column</label>
                  <select
                    value={nameColumn}
                    onChange={(e) => setNameColumn(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-900 focus:outline-none"
                  >
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1">Mailing Email Column</label>
                  <select
                    value={emailColumn}
                    onChange={(e) => setEmailColumn(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-900 focus:outline-none"
                  >
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Include in QR Code Checkboxes */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1">Include in QR Code Data:</label>
                  <div className="max-h-[120px] overflow-y-auto space-y-1.5 border border-neutral-200 rounded-lg p-2 bg-white">
                    {csvHeaders.map(header => (
                      <label key={header} className="flex items-center gap-2 text-neutral-600 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedQrColumns.includes(header)}
                          onChange={() => handleToggleColumn(header)}
                          className="h-3.5 w-3.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{header}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Row Skip Limits */}
            {csvRawData.length > 0 && (
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-neutral-100/50 rounded-xl border border-neutral-200/50">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1">Skip First Rows</label>
                  <input
                    type="number"
                    min="0"
                    value={skipFirst}
                    onChange={(e) => setSkipFirst(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    disabled={isProcessing}
                    className="block w-full rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 mb-1">Skip Last Rows</label>
                  <input
                    type="number"
                    min="0"
                    value={skipLast}
                    onChange={(e) => setSkipLast(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    disabled={isProcessing}
                    className="block w-full rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Template image upload */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Ticket Template Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isProcessing}
                className="block w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
              />
              {templateImage && (
                <p className="text-xs text-green-600 font-bold mt-1.5 flex items-center gap-1 truncate">
                  <FiCheckCircle /> Loaded: {imageName} ({templateImage.naturalWidth}x{templateImage.naturalHeight}px)
                </p>
              )}
            </div>
          </div>

          {/* Email Template Card */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiMail className="text-blue-500" /> Email Message Body
            </h3>
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 mb-1">Plain Text (Use {`{name}`} & {`{email}`} variable placeholders)</label>
              <textarea
                value={mailTemplate}
                onChange={(e) => setMailTemplate(e.target.value)}
                disabled={isProcessing}
                rows={8}
                className="block w-full rounded-xl border border-neutral-200 bg-white/60 p-3.5 font-sans text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button 
                type="button" 
                onClick={() => setMailTemplate(DEFAULT_TEXT_TEMPLATE)}
                className="text-[10px] text-neutral-500 hover:text-neutral-800 underline mt-1 block"
              >
                Reset to default plain text
              </button>
            </div>
          </div>
        </div>

        {/* Center/Right side: Preview Canvas & Placement sliders */}
        <div className="space-y-6 lg:col-span-2">
          {/* Canvas editor panel */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                <FiSliders className="text-blue-500" /> Interactive Canvas Placement
              </h3>
              {templateImage && !isProcessing && (
                <button
                  onClick={startDistribution}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                >
                  <FiPlay size={12} /> Start Distribution
                </button>
              )}
            </div>

            {/* Slider configuration panel */}
            {templateImage ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-100/50 rounded-2xl border border-neutral-200/50">
                <div>
                  <div className="flex justify-between text-xs font-bold text-neutral-500 mb-1">
                    <span>X Coordinates</span>
                    <span>{xPos} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={templateImage ? templateImage.naturalWidth - qrSize : 1000}
                    value={xPos}
                    onChange={(e) => setXPos(parseInt(e.target.value, 10))}
                    disabled={isProcessing}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-neutral-500 mb-1">
                    <span>Y Coordinates</span>
                    <span>{yPos} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={templateImage ? templateImage.naturalHeight - qrSize : 1000}
                    value={yPos}
                    onChange={(e) => setYPos(parseInt(e.target.value, 10))}
                    disabled={isProcessing}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-neutral-500 mb-1">
                    <span>QR Code Size</span>
                    <span>{qrSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max={templateImage ? Math.min(templateImage.naturalWidth, templateImage.naturalHeight) / 2 : 400}
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value, 10))}
                    disabled={isProcessing}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="p-10 border-2 border-dashed border-neutral-300 rounded-3xl text-center text-neutral-400 bg-neutral-50/50">
                Upload a ticket template background to enable visual slider settings.
              </div>
            )}

            {/* Preview Box */}
            {templateImage && (
              <div className="border border-neutral-200 rounded-3xl overflow-auto p-4 flex justify-center bg-neutral-900/10 max-h-[450px]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto shadow-md rounded-lg border border-neutral-300"
                  style={{ maxHeight: '380px' }}
                />
              </div>
            )}
          </div>

          {/* Cloudinary API Storage Card */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiCloud className="text-purple-600" /> Cloudinary Storage API
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Cloud Name</label>
                <input
                  type="text"
                  value={cldCloudName}
                  onChange={(e) => setCldCloudName(e.target.value)}
                  disabled={isProcessing}
                  placeholder="e.g. ggsc-cloud"
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">API Key</label>
                <input
                  type="text"
                  value={cldApiKey}
                  onChange={(e) => setCldApiKey(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Cloudinary API Key"
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">API Secret</label>
                <input
                  type="password"
                  value={cldApiSecret}
                  onChange={(e) => setCldApiSecret(e.target.value)}
                  disabled={isProcessing}
                  placeholder="••••••••••••••••"
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* SMTP Credentials Card */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiSettings className="text-green-600" /> SMTP Emailer Config
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  disabled={isProcessing}
                  placeholder="smtp.gmail.com"
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900"
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
                    placeholder="587"
                    className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900"
                  />
                </div>
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="secure-toggle"
                    checked={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.checked)}
                    disabled={isProcessing}
                    className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="secure-toggle" className="ml-1.5 text-[10px] font-semibold text-neutral-600">SSL/TLS</label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Sender Email</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  disabled={isProcessing}
                  placeholder="organizer@gmail.com"
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Password / App Password</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  disabled={isProcessing}
                  placeholder="••••••••••••"
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  disabled={isProcessing}
                  placeholder="GGSC Committee"
                  className="block w-full rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs and distribution status card */}
      {logs.length > 0 && (
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <FiList className="text-neutral-600" /> Mailing Queue Logs
            </h3>
            <div className="flex gap-2 items-center">
              {hasFailedLogs && !isProcessing && (
                <button
                  onClick={retryFailedEmails}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-sm"
                >
                  <FiRefreshCw size={11} className="animate-spin-slow" /> Retry Failed Only
                </button>
              )}
              {isProcessing && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md animate-pulse">
                  Mailing Status: {progress}%
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {isProcessing && (
            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Log List View */}
          <div className="max-h-[220px] overflow-y-auto space-y-2 border border-neutral-100 rounded-2xl p-3 bg-neutral-50/50">
            {logs.map((log, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-xs p-2 rounded-xl bg-white border border-neutral-100"
              >
                <div>
                  <span className="font-bold text-neutral-800">{log.name}</span>
                  <span className="text-neutral-400 font-mono ml-2">({log.email})</span>
                  {log.cldUrl && (
                    <a href={log.cldUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-purple-600 underline truncate max-w-xs mt-0.5">
                      Cloudinary Image: {log.cldUrl}
                    </a>
                  )}
                  {log.message && <p className="text-[10px] text-neutral-500 mt-0.5">{log.message}</p>}
                </div>
                <div>
                  {log.status === 'ready' && (
                    <span className="text-neutral-400 bg-neutral-100 px-2.5 py-0.5 rounded-full font-bold">Ready</span>
                  )}
                  {log.status === 'mailing' && (
                    <span className="text-blue-500 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold animate-pulse">Sending...</span>
                  )}
                  {log.status === 'sent' && (
                    <span className="text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-bold">Delivered</span>
                  )}
                  {log.status === 'failed' && (
                    <span className="text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-0.5" title={log.message}>
                      <FiAlertCircle size={10} /> Failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
