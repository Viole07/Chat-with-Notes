import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const chatBoxRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/upload', formData);
      setSessionId(response.data.sessionId);
      alert(`✅ File uploaded!`);
    } catch (err) {
      alert('❌ Upload failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!userMessage.trim() || !sessionId) return;

    const question = userMessage.trim();
    setChatHistory((prev) => [...prev, { role: 'user', text: question }]);
    setUserMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/chat', {
        sessionId,
        userMessage: question,
      });

      setChatHistory((prev) => [...prev, { role: 'assistant', text: response.data.answer }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: 'assistant', text: "❌ Couldn't get a response." }]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const themeStyles = {
    backgroundColor: darkMode ? '#121212' : '#f4f4f4',
    color: darkMode ? '#eee' : '#222',
  };

  const bubbleStyle = (role) => ({
    display: 'inline-block',
    backgroundColor: role === 'user' ? (darkMode ? '#004d40' : '#e1f5fe') : (darkMode ? '#4e342e' : '#fff8e1'),
    color: darkMode ? '#fff' : '#333',
    padding: '12px 16px',
    borderRadius: 10,
    margin: '4px 0',
    maxWidth: '75%',
    whiteSpace: 'pre-wrap',
  });

  return (
    <div style={{ position: 'relative' }}>

    <div style={{ ...themeStyles, minHeight: '100vh', padding: 0, margin: 0 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <div style={{ position: 'relative', marginTop: 10 }}>
  {/* Light/Dark Mode Toggle (top-right corner) */}
  <button
    onClick={() => setDarkMode((prev) => !prev)}
    style={{
      position: 'absolute',
      top: 0,
      right: 0,
      background: darkMode ? '#90caf9' : '#333',
      color: darkMode ? '#000' : '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '6px 12px',
      cursor: 'pointer',
    }}
  >
    {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
  </button>

  {/* Logo + Title (centered in one row) */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      marginTop: 10,
    }}
  >
    <img src="/logo.png" alt="Logo" style={{ width: 60, height: 60 }} />
    <h2 style={{ margin: 0 }}>Chat With Your Notes</h2>
  </div>
</div>



        {/* File Upload Section */}
        {!sessionId && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 50 }}>
            <input
              type="file"
              id="hidden-file"
              style={{ display: 'none' }}
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="hidden-file" style={{ cursor: 'pointer', fontSize: 40 }}>
            <img width="50" height="50" src="/upload-file.png" alt="upload-file-icon"/>
            </label>
            {file && (
              <button
                onClick={handleUpload}
                disabled={loading}
                style={{
                  marginTop: 10,
                  padding: '8px 16px',
                  borderRadius: 6,
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Upload
              </button>
            )}
            {file && <span style={{ marginTop: 6, fontSize: 14 }}>{file.name}</span>}
          </div>
        )}

        {/* Chat Section */}
        {sessionId && (
          <>
            <div
              ref={chatBoxRef}
              style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 15,
                height: '500px',
                overflowY: 'auto',
                marginTop: 30,
                background: darkMode ? '#1e1e1e' : '#ffffff',
              }}
            >
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  <div style={bubbleStyle(msg.role)}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && <p style={{ marginTop: 10 }}>⏳ Thinking...</p>}
            </div>

            {/* Chat input */}
            <div style={{ display: 'flex', marginTop: 15 }}>
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Ask a question..."
                style={{
                  flex: 1,
                  padding: 12,
                  fontSize: 16,
                  border: '1px solid #ccc',
                  borderRadius: 6,
                }}
                disabled={loading}
              />
              <button
                onClick={handleChat}
                disabled={loading || !userMessage.trim()}
                style={{
                  marginLeft: 10,
                  padding: '10px 20px',
                  borderRadius: 6,
                  background: '#388e3c',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Ask
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
}

export default App;
