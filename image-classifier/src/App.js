import './App.css';

import ImageClassifier from './components/ImageClassifier';
import VideoUploader from './components/VideoUploader';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🚀 AI Classification System</h1>
          <p>✨ Image & Video Classification </p>
        </div>
        <div className="header-decoration"></div>
      </header>
      <main className="main-content">
        <div className="classifier-section">
          <div className="section-header">
            <h2>📸 Visual Analysis</h2>
            <p>Upload and classify images using advanced AI models</p>
          </div>
          <ImageClassifier />
        </div>
        <div className="divider">
          <div className="divider-glow"></div>
        </div>
        <div className="classifier-section">
          <div className="section-header">
            <h2>🎥 Video Analysis</h2>
            <p>Analyze video content frame by frame</p>
          </div>
          <VideoUploader />
        </div>
      </main>
      <footer className="App-footer">
        <p>
          🔗 Backend API: <code>http://localhost:8000</code> | 
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">📚 API Docs</a>
        </p>
      </footer>
    </div>
  );
}

export default App;