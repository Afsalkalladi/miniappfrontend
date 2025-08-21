import React, { useState, useRef } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { XMarkIcon } from '@heroicons/react/24/outline';

const QRScannerComponent = ({ onScan, onClose, isScanning = false }) => {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  const handleScan = (result) => {
    if (result && result.text) {
      onScan(result.text);
    }
  };

  const handleError = (error) => {
    console.error('QR Scanner Error:', error);
    setError('Camera access denied or not available');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 m-4 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={isScanning}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                // Retry camera access
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <QrScanner
              ref={scannerRef}
              onDecode={handleScan}
              onError={handleError}
              constraints={{
                facingMode: 'environment',
                aspectRatio: 1
              }}
              containerStyle={{
                width: '100%',
                height: '100%'
              }}
              videoStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Position the QR code within the frame
          </p>
          {isScanning && (
            <p className="text-sm text-blue-600 mt-2">
              Processing...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerComponent;
