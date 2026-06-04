import { useState } from "react";
import StartScreen from "./screens/StartScreen";
import TypingScreen from "./screens/TypingScreen";
import demoText from "./data/demoText";

import "./App.css";

function App() {
  const [mode, setMode] = useState("start");
  const [text, setText] = useState("");

  return (
    <div className="app">
      {mode === "start" && (
        <StartScreen
          setText={setText}
          setMode={setMode}
          demoText={demoText}
        />
      )}

      {mode === "typing" && (
        <TypingScreen
          text={text}
          goBack={() => setMode("start")}
        />
      )}
    </div>
  );
}

export default App;