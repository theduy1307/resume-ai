
import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  acceptedTypes: string;
  onFileUpload: (file: File) => void;
  label: string;
}

const FileUpload = ({ acceptedTypes, onFileUpload, label }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
    // Reset the input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    const validTypes = acceptedTypes.split(',').map(type => type.trim().replace('.', ''));
    
    if (fileType && validTypes.includes(fileType)) {
      onFileUpload(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    } else {
      toast.error(`Invalid file type. Please upload ${acceptedTypes} files only.`);
    }
  };

  return (
    <div
      className={`upload-container ${isDragging ? 'active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      <div className="mt-4 text-xl font-medium">{label}</div>
      <p className="mt-2 text-sm text-muted-foreground">
        Kéo và thả file hoặc click để chọn
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Định dạng hỗ trợ: {acceptedTypes}
      </p>
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="mt-4"
      >
        Chọn file
      </Button>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept={acceptedTypes}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUpload;
