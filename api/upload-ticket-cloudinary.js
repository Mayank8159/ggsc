import { v2 as cloudinary } from 'cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { ticketImage, eventName, cloudinaryConfig } = req.body;

  if (!ticketImage || !eventName) {
    return res.status(400).json({ error: 'Missing required parameters: ticketImage or eventName' });
  }

  // Use provided credentials or fallback to server environment variables
  const cloudName = cloudinaryConfig?.cloudName || process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = cloudinaryConfig?.apiKey || process.env.VITE_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = cloudinaryConfig?.apiSecret || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[Mock Cloudinary] Cloudinary API credentials missing. Returning local preview data URL as fallback.');
    return res.status(200).json({ 
      success: true,
      isMock: true,
      secure_url: ticketImage,
      public_id: `mock_ticket_${Date.now()}`
    });
  }

  try {
    // Configure Cloudinary SDK dynamically
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    // Sanitize folder name
    const sanitizedEventFolder = `ggsc-events/${eventName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Perform API upload
    const uploadResponse = await cloudinary.uploader.upload(ticketImage, {
      folder: sanitizedEventFolder,
      resource_type: 'image',
      overwrite: true
    });

    return res.status(200).json({
      success: true,
      secure_url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    });
  } catch (error) {
    console.error('Cloudinary API upload error:', error);
    return res.status(500).json({ error: `Cloudinary upload failed: ${error.message}` });
  }
}
