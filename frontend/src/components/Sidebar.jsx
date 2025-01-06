import FileUpload from './FileUpload';
import FileList from './FileList';

export default function Sidebar({ files, onFileUpload, onRemoveFile, onToggleFile, handleUpload }) {
  return (
    <div className="w-80 bg-white p-6 rounded-l-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Upload PDFs</h2>
      <FileUpload onFileUpload={onFileUpload} />
      {files.length > 0 && (
        <FileList
          files={files}
          onRemoveFile={onRemoveFile}
          onToggleFile={onToggleFile}
        />
      )}

      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4" onClick={handleUpload}>Upload</button>
    </div>
  );
}