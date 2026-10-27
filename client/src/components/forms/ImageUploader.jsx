import React, { useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({ onFileSelect, initialPreview = null }) {
  const [preview, setPreview] = useState(initialPreview);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5MB');
        return;
      }
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-2">
        Food Photograph
      </label>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-surface-200 h-52 bg-surface-100 group">
          <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 p-1.5 bg-surface-900/70 hover:bg-surface-900 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-surface-300 hover:border-primary-500 rounded-2xl cursor-pointer bg-surface-50/50 hover:bg-surface-50 transition-all group p-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 group-hover:bg-primary-100 text-primary-600 flex items-center justify-center mb-3 transition-colors">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-surface-800">
            Click to upload <span className="font-normal text-surface-500">or drag & drop</span>
          </p>
          <p className="text-xs text-surface-400 mt-1">PNG, JPG, or WEBP (Max 5MB)</p>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}
