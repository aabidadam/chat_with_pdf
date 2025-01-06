import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function FileUpload({ onFileUpload }) {
  const onDrop = useCallback((acceptedFiles) => {
    onFileUpload(acceptedFiles);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      <DocumentArrowUpIcon className="h-12 w-12 mx-auto text-gray-400" />
      {isDragActive ? (
        <p className="mt-2 text-gray-600">Drop your PDF files here...</p>
      ) : (
        <p className="mt-2 text-gray-600">
          Drag & drop PDF files here, or click to select files
        </p>
      )}
    </div>
  );
}