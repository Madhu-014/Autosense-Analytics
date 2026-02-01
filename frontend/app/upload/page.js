'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Upload Data</h1>
        <p className="text-slate-600 mb-8">Upload a CSV or XLSX file to generate interactive charts and insights.</p>
        
        <FileUpload onFileUpload={setUploadedFile} />
        
        {uploadedFile && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">File Uploaded</h2>
            <p className="text-slate-600">{uploadedFile.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
