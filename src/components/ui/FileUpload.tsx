import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar.tsx';

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export interface FileUploadProps {
  label?: string;
  helperText?: string;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'แนบเอกสารหรือไฟล์ประกอบ',
  helperText = 'รองรับไฟล์ PDF, DOCX, XLSX ขนาดไม่เกิน 25MB ต่อไฟล์',
  acceptedFormats = ['.pdf', '.docx', '.xlsx', '.png', '.jpg'],
  maxSizeMB = 25,
  onFilesSelected,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileList, setFileList] = useState<UploadedFileItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arrayFiles = Array.from(files);

    const newItems: UploadedFileItem[] = arrayFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 100,
      status: 'completed',
    }));

    setFileList((prev) => [...prev, ...newItems]);
    onFilesSelected?.(arrayFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (id: string) => {
    setFileList((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {label && (
        <span className="text-xs font-semibold text-slate-700 select-none">{label}</span>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2
          ${
            isDragOver
              ? 'border-[#D94F87] bg-[#FBE7EF]/30 scale-[0.99]'
              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-10 h-10 rounded-full bg-[#FBE7EF] text-[#B83B6F] flex items-center justify-center">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-700">
            <span className="text-[#D94F87] font-semibold hover:underline">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวางที่นี่
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
        </div>
      </div>

      {/* Uploaded File List */}
      {fileList.length > 0 && (
        <div className="space-y-2 mt-2">
          {fileList.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  <File className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#3A9D68]" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
