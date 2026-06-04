import { extractPdfText } from "../utils/pdfParser";

function TextLoader({
  setPracticeText,
  pastedText,
  setPastedText
}) {
  const handleFile = async e => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type === "text/plain") {
      const text = await file.text();
      setPracticeText(text);
    }

    if (file.type === "application/pdf") {
      const text = await extractPdfText(file);
      setPracticeText(text);
    }
  };

  return (
    <div className="loader">
      <input
        type="file"
        accept=".txt,.pdf"
        onChange={handleFile}
      />

      <textarea
        placeholder="Paste your own text..."
        value={pastedText}
        onChange={e => setPastedText(e.target.value)}
      />

      <button
        onClick={() => {
          if (pastedText.trim()) {
            setPracticeText(pastedText);
          }
        }}
      >
        Use Pasted Text
      </button>
    </div>
  );
}

export default TextLoader;