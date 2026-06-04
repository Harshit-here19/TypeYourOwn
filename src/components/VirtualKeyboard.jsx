import { useState, useEffect, useMemo } from "react";
import styles from "./VirtualKeyboard.module.css";

function VirtualKeyboard({ input, text }) {
  const [activeCode, setActiveCode] = useState(null);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isCapsActive, setIsCapsActive] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentIndex = input.length;
  const currentExpectedChar = text?.[currentIndex] || null;

  // 1. Memoize the static layout structure so it never re-allocates on render cycles
  const keyboardLayout = useMemo(() => [
    [
      { code: "Tab", display: "tab", type: "mod" },
      { code: "KeyQ", display: "q" }, { code: "KeyW", display: "w" }, { code: "KeyE", display: "e" },
      { code: "KeyR", display: "r" }, { code: "KeyT", display: "t" }, { code: "KeyY", display: "y" },
      { code: "KeyU", display: "u" }, { code: "KeyI", display: "i" }, { code: "KeyO", display: "o" },
      { code: "KeyP", display: "p" }, { code: "Backspace", display: "backspace", type: "mod" },
    ],
    [
      { code: "CapsLock", display: "caps", type: "mod" },
      { code: "KeyA", display: "a" }, { code: "KeyS", display: "s" }, { code: "KeyD", display: "d" },
      { code: "KeyF", display: "f" }, { code: "KeyG", display: "g" }, { code: "KeyH", display: "h" },
      { code: "KeyJ", display: "j" }, { code: "KeyK", display: "k" }, { code: "KeyL", display: "l" },
      { code: "Semicolon", display: ";" }, { code: "Quote", display: "'" }, { code: "Enter", display: "enter", type: "mod" },
    ],
    [
      { code: "ShiftLeft", display: "shift", type: "mod" },
      { code: "KeyZ", display: "z" }, { code: "KeyX", display: "x" }, { code: "KeyC", display: "c" },
      { code: "KeyV", display: "v" }, { code: "KeyB", display: "b" }, { code: "KeyN", display: "n" },
      { code: "KeyM", display: "m" }, { code: "Comma", display: "," }, { code: "Period", display: "." },
      { code: "Slash", display: "/" }, { code: "ShiftRight", display: "shift", type: "mod" },
    ],
    [{ code: "Space", display: "Space", type: "spacebar" }],
  ], []);

  // 2. Memoize Character-to-Code mapping dictionary
  const targetKeyCode = useMemo(() => {
    if (!currentExpectedChar) return null;
    if (currentExpectedChar === " ") return "Space";
    const specialKeys = { ";": "Semicolon", "'": "Quote", ",": "Comma", ".": "Period", "/": "Slash" };
    return specialKeys[currentExpectedChar] || `Key${currentExpectedChar.toUpperCase()}`;
  }, [currentExpectedChar]);

  // 3. Keep errors perfectly linked to text stream mutation (prevents stuck error states)
  useEffect(() => {
    if (currentIndex === 0) {
      setHasError(false);
      return;
    }
    const lastTypedIdx = currentIndex - 1;
    setHasError(input[lastTypedIdx] !== text[lastTypedIdx]);
  }, [currentIndex, input, text]);

  // 4. Physical Keyboard Sync Loop
  useEffect(() => {
    let timeoutId;

    const handleKeyDown = (e) => {
      setActiveCode(e.code);

      if (e.code === "ShiftLeft" || e.code === "ShiftRight") setIsShiftActive(true);
      if (e.code === "CapsLock") setIsCapsActive(e.getModifierState("CapsLock"));

      // Safety Reset: Clear any stuck animations if the user holds down keys
      clearTimeout(timeoutId);
    };

    const handleKeyUp = (e) => {
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") setIsShiftActive(false);
      
      // Smooth press animation release window
      timeoutId = setTimeout(() => {
        setActiveCode(null);
      }, 90); 
    };

    // Window blur safety: Reset all keys if user tabs out of app mid-typing
    const handleBlur = () => {
      setActiveCode(null);
      setIsShiftActive(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      clearTimeout(timeoutId);
    };
  }, []);

  const displayAsUppercase = isShiftActive !== isCapsActive;
  const isCompleted = text && currentIndex >= text.length;

  return (
    <div className={styles.keyboardContainer}>
      <div className={styles.keyboardDeck}>
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((keyItem) => {
              const isTarget = keyItem.code === targetKeyCode;
              const isPhysicallyPressed = keyItem.code === activeCode;
              
              // Handle active modifiers toggles 
              const isModifierActive = 
                (keyItem.code.startsWith("Shift") && isShiftActive) ||
                (keyItem.code === "CapsLock" && isCapsActive);

              // Setup dynamic base layer layout design styles
              let keyClasses = `${styles.key}`;
              if (keyItem.type === "mod") keyClasses += ` ${styles.modKey} ${styles[keyItem.code]}`;
              if (keyItem.type === "spacebar") keyClasses += ` ${styles.spacebar}`;

              // Contextual State Prioritization (Error > Success > Target Suggestion)
              if (isPhysicallyPressed) {
                keyClasses += hasError ? ` ${styles.errorActive}` : ` ${styles.successActive}`;
              } else if (isModifierActive) {
                keyClasses += ` ${styles.modifierToggled}`;
              } else if (isTarget && !isCompleted) {
                keyClasses += ` ${styles.nextTarget}`;
              }

              const label = keyItem.type
                ? keyItem.display
                : displayAsUppercase
                ? keyItem.display.toUpperCase()
                : keyItem.display.toLowerCase();

              return (
                <div key={keyItem.code} className={keyClasses}>
                  <span className={styles.keycap}>{label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualKeyboard;