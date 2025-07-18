import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  X, 
  CheckCircle, 
  Camera, 
  Scan,
  Building
} from 'lucide-react';

interface CheckInQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (boothId: string) => void;
}

export function CheckInQRScanner({
  isOpen,
  onClose,
  onScanComplete
}: CheckInQRScannerProps) {
  const [scanStatus, setScanStatus] = useState<'scanning' | 'success' | 'error'>('scanning');
  const [scannedBoothId, setScannedBoothId] = useState<string | null>(null);

  // Simulate a successful scan after 3 seconds
  React.useEffect(() => {
    if (isOpen && scanStatus === 'scanning') {
      const timer = setTimeout(() => {
        const mockBoothId = 'A1';
        setScannedBoothId(mockBoothId);
        setScanStatus('success');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, scanStatus]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl overflow-hidden shadow-xl max-w-md w-full"
      >
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <h2 className="text-lg font-semibold">Scan Booth QR Code</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {scanStatus === 'scanning' && (
            <div className="space-y-6">
              <div className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden">
                {/* Camera viewfinder overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-indigo-500 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500"></div>
                  </div>
                </div>
                
                {/* Scanning animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 bg-indigo-500 opacity-50 animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-16 w-16 text-gray-300" />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600">Position the QR code within the frame to scan</p>
                <p className="mt-1 text-sm text-gray-500">QR codes are available at each booth</p>
              </div>
            </div>
          )}

          {scanStatus === 'success' && (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Successfully Checked In!</h3>
                <p className="mt-1 text-gray-600">
                  You've checked in at <span className="font-medium">TechCorp</span> booth {scannedBoothId}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">TechCorp</p>
                    <p className="text-xs text-gray-500">Booth {scannedBoothId}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (scannedBoothId) {
                      onScanComplete(scannedBoothId);
                    }
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Add Notes
                </button>
              </div>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-10 w-10 text-red-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Scan Failed</h3>
                <p className="mt-1 text-gray-600">
                  Unable to recognize the QR code. Please try again.
                </p>
              </div>
              
              <button
                onClick={() => setScanStatus('scanning')}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <Scan className="h-4 w-4 inline-block mr-1.5" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}