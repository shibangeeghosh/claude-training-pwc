import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Shipment } from '../types/shipment';

interface FileUploadProps {
  onDataLoaded: (shipments: Shipment[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseExcelFile = (file: File) => {
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        const shipments: Shipment[] = parsedData.map((row: any, index: number) => ({
          id: row.id || `SHIP-${String(index + 1).padStart(5, '0')}`,
          destination: row.destination || row.Destination || 'Unknown',
          riskScore: parseFloat(row.riskScore || row.risk_score || row['Risk Score'] || 0),
          temperature: parseFloat(row.temperature || row.Temperature || 0),
          temperatureExcursion: row.temperatureExcursion === true || row.temperature_excursion === 'Yes',
          status: row.status || row.Status || 'In Transit',
          carrier: row.carrier || row.Carrier || 'Unknown',
          departureDate: row.departureDate || row.departure_date || row['Departure Date'] || '',
          estimatedArrival: row.estimatedArrival || row.estimated_arrival || row['Estimated Arrival'] || '',
          productType: row.productType || row.product_type || row['Product Type'] || 'Pharmaceutical',
        }));

        setFileName(file.name);
        onDataLoaded(shipments);
      } catch (err) {
        setError('Failed to parse Excel file. Please ensure it has the correct format.');
        console.error('Parse error:', err);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file.');
      setLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      parseExcelFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      parseExcelFile(file);
    }
  };

  const handleClear = () => {
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Upload size={28} className="text-blue-600" />
        Upload Shipment Data
      </h2>

      {!fileName ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-lg font-semibold text-slate-700 mb-2">
            Drag and drop your Excel file here
          </p>
          <p className="text-sm text-slate-500 mb-4">
            or click to browse your computer
          </p>
          <p className="text-xs text-slate-400">
            Supported formats: .xlsx, .xls
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-900">File loaded successfully</p>
              <p className="text-sm text-green-700">{fileName}</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-1 hover:bg-green-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-green-600" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mt-4 flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-slate-600">Parsing file...</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm">Expected Excel Format:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• ID, Destination, Risk Score, Temperature, Status</li>
          <li>• Optional: Temperature Excursion, Carrier, Departure Date, Product Type</li>
        </ul>
      </div>
    </div>
  );
};
