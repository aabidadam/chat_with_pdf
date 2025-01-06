import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Notification from './components/Notification';
import useNotification from './hooks/useNotification';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const { notification, showNotification, hideNotification } = useNotification();

  const handleFileUpload = (newFiles) => {
    const fileObjects = newFiles.map(file => ({
      name: file.name,
      selected: true,
      file
    }));
    setFiles(prev => [...prev, ...fileObjects]);
    // showNotification(`Successfully uploaded ${newFiles.length} file(s)`);
  };


  const handleRemoveFile = (fileName) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    showNotification('File removed');
  };


  const handleToggleFile = (fileName) => {
    setFiles(prev => prev.map(file => 
      file.name === fileName 
        ? { ...file, selected: !file.selected }
        : file
    ));
  };


  const handleSendMessage = (message) => {
    const selectedFiles = files.filter(file => file.selected);
    
    if (selectedFiles.length === 0) {
      showNotification('Please select at least one PDF file', 'error');
      return;
    }
    
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    
    
    fetch('http://localhost:8000/chat', {
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message, file_names: selectedFiles.map(file => file.name) })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.answer);
      setMessages(prev => [...prev, { text: data.answer, isUser: false }]);
    })
    .catch(error => console.error('Error:', error));
  };


  const handleUpload = () => {
    const fileFormData = new FormData();
    files.forEach(file => {
      fileFormData.append('files', file.file);
      showNotification(`Successfully uploaded ${file.name}`);
    });
    
    fetch('http://localhost:8000/upload_pdfs', {
      method: 'POST',
      body: fileFormData
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  };
  return (
    <div className="h-screen bg-gray-100">
      <div className="flex h-screen">
        <Sidebar
          files={files}
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
          onToggleFile={handleToggleFile}
          handleUpload={handleUpload}
        />
        
        <main className="flex-1 p-6">
          <div className="h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Chat with Your PDFs</h1>
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 overflow-hidden flex flex-col">
              <ChatInterface 
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </main>
      </div>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}

export default App;