/**
 * Utility functions for parsing different QR code formats
 */

export const parseQRCode = (qrResult) => {
  console.log('🔍 Raw QR Result:', qrResult);
  
  // Extract the text content from different QR scanner result formats
  let qrText = '';
  
  if (typeof qrResult === 'string') {
    qrText = qrResult;
  } else if (qrResult && qrResult.text) {
    qrText = qrResult.text;
  } else if (qrResult && qrResult.data) {
    qrText = qrResult.data;
  } else if (Array.isArray(qrResult) && qrResult.length > 0) {
    qrText = qrResult[0].rawValue || qrResult[0].text || qrResult[0];
  } else {
    qrText = String(qrResult);
  }
  
  console.log('📝 Extracted QR Text:', qrText);
  
  return parseMessNumber(qrText);
};

export const parseMessNumber = (qrText) => {
  if (!qrText) {
    throw new Error('Empty QR code data');
  }
  
  let messNo = qrText.trim();
  console.log('🎯 Processing QR Text:', messNo);
  
  // Handle URL encoded format first
  if (messNo.includes('%7C') || messNo.includes('%')) {
    try {
      messNo = decodeURIComponent(messNo);
      console.log('🔓 URL Decoded:', messNo);
    } catch (error) {
      console.warn('⚠️ URL decode failed:', error);
    }
  }
  
  // Handle pipe-separated format: SAHARA_MESS|2025001|5|uuid
  if (messNo.includes('|')) {
    const parts = messNo.split('|');
    console.log('📊 QR Parts:', parts);
    
    if (parts.length >= 2) {
      // Usually the mess number is the second part
      const extractedMessNo = parts[1].trim();
      if (extractedMessNo && extractedMessNo !== '') {
        console.log('✅ Extracted mess number from pipe format:', extractedMessNo);
        return extractedMessNo;
      }
    }
    
    // Fallback: look for a part that looks like a mess number (numbers/alphanumeric)
    for (const part of parts) {
      const cleanPart = part.trim();
      if (cleanPart && /^[A-Z0-9]+$/i.test(cleanPart) && cleanPart.length >= 4) {
        console.log('✅ Found potential mess number:', cleanPart);
        return cleanPart;
      }
    }
  }
  
  // Handle JSON format
  if (messNo.startsWith('{') && messNo.endsWith('}')) {
    try {
      const qrData = JSON.parse(messNo);
      console.log('📋 Parsed JSON QR:', qrData);
      
      const jsonMessNo = qrData.mess_no || qrData.messNo || qrData.id || qrData.student_id;
      if (jsonMessNo) {
        console.log('✅ Extracted mess number from JSON:', jsonMessNo);
        return jsonMessNo;
      }
    } catch (error) {
      console.warn('⚠️ JSON parse failed:', error);
    }
  }
  
  // Handle comma-separated format
  if (messNo.includes(',')) {
    const parts = messNo.split(',');
    console.log('📊 Comma-separated parts:', parts);
    
    for (const part of parts) {
      const cleanPart = part.trim();
      if (cleanPart && /^[A-Z0-9]+$/i.test(cleanPart) && cleanPart.length >= 4) {
        console.log('✅ Found potential mess number in comma format:', cleanPart);
        return cleanPart;
      }
    }
  }
  
  // Handle colon-separated format (key:value)
  if (messNo.includes(':')) {
    const parts = messNo.split(':');
    if (parts.length === 2) {
      const key = parts[0].trim().toLowerCase();
      const value = parts[1].trim();
      
      if (key.includes('mess') || key.includes('id') || key.includes('student')) {
        console.log('✅ Extracted mess number from key-value format:', value);
        return value;
      }
    }
  }
  
  // If no special format detected, assume the entire string is the mess number
  // But validate it looks reasonable
  if (/^[A-Z0-9]+$/i.test(messNo) && messNo.length >= 4) {
    console.log('✅ Using entire QR as mess number:', messNo);
    return messNo;
  }
  
  // Last resort: extract any alphanumeric sequence that could be a mess number
  const matches = messNo.match(/[A-Z0-9]{4,}/gi);
  if (matches && matches.length > 0) {
    const potentialMessNo = matches[0];
    console.log('✅ Extracted potential mess number via regex:', potentialMessNo);
    return potentialMessNo;
  }
  
  console.error('❌ Could not extract mess number from QR:', messNo);
  throw new Error(`Could not extract mess number from QR code: ${messNo}`);
};

export const validateMessNumber = (messNo) => {
  if (!messNo || typeof messNo !== 'string') {
    return false;
  }
  
  const cleaned = messNo.trim();
  
  // Basic validation: should be alphanumeric and reasonable length
  return /^[A-Z0-9]{4,20}$/i.test(cleaned);
};

export const formatQRError = (originalQR, error) => {
  return {
    error: 'Failed to parse QR code',
    originalQR: originalQR,
    details: error.message,
    suggestions: [
      'Ensure the QR code is clearly visible',
      'Try scanning again with better lighting',
      'Check if the QR code contains the correct mess number format'
    ]
  };
};
