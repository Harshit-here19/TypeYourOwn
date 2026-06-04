import { extractPdfText } from "../utils/pdfParser";
import { useState } from "react";

import styles from './StartScreen.module.css';

function StartScreen({ setText, setMode, demoText }) {
  const [paste, setPaste] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const text = await file.text();
      setText(text);
    }

    if (file.type === "application/pdf") {
      const text = await extractPdfText(file);
      setText(text);
    }

    setMode("typing");
  };

  return (
    <div className={styles.startScreen}>
      <h1>⌨️ Type Your Own</h1>

      <button
        className={styles.secondaryBtn}
        onClick={() => {
          setText(demoText);
          setMode("typing");
        }}
      >
        Try Demo Text
      </button>

      {/* Styled custom file uploader */}
      <label className={styles.fileUploadLabel}>
        📁 Upload .TXT or .PDF File
        <input 
          type="file" 
          accept=".txt,.pdf" 
          onChange={handleFile} 
          className={styles.fileInput}
        />
      </label>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <textarea
        className={styles.textarea}
        placeholder="Paste your custom text or code script here..."
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
      />

      <button
        className={styles.primaryBtn}
        onClick={() => {
          if (paste.trim()) {
            setText(paste);
            setMode("typing");
          }
        }}
      >
        Start Practice
      </button>
    </div>
  );
}

export default StartScreen;