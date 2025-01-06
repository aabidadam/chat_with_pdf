import { XMarkIcon } from '@heroicons/react/24/outline';

export default function FileList({ files, onRemoveFile, onToggleFile }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow"
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={file.selected}
                onChange={() => onToggleFile(file.name)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">{file.name}</span>
            </div>
            <button
              onClick={() => onRemoveFile(file.name)}
              className="text-gray-400 hover:text-red-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}