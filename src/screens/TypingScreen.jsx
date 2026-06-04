import { useEffect, useRef, useState } from "react";
import VirtualKeyboard from "../components/VirtualKeyboard";
import Stats from "../components/Stats";
import CongratsScreen from "./CongratsScreen";

import styles from "./TypingScreen.module.css";

const sanitizeText = (str) => {
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/\r/g, "")
    .replace(/\t/g, " ");
};

function TypingScreen({ text, goBack }) {
  const sanitizedText = sanitizeText(text);

  const [input, setInput] = useState("");
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  const charRefs = useRef([]);
  const idleTimeoutRef = useRef(null); // Keeps track of the idle timer cleanup

  // Handle Tab Focus/Blur
  useEffect(() => {
    const handleVisibility = () => setIsFocused(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const onBlur = () => setIsFocused(false);
    const onFocus = () => setIsFocused(true);

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // ⏱️ TIMER LOGIC (Strictly respects completion, focus, AND idle states)
  useEffect(() => {
    const interval = setInterval(() => {
      // 🛑 If user is idle, completed, or tabbed out, DO NOT increment the time
      if (!started || isCompleted || !isFocused || isIdle) return;

      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [started, isCompleted, isFocused, isIdle]);

  // ⌨️ KEYBOARD INPUT LISTENER
  useEffect(() => {
    if (isCompleted) return;

    const handleKey = (e) => {
      if (e.key === " " || e.key === "Backspace") {
        e.preventDefault();
      }

      // 1. Immediately wake up from idle on key press
      setIsIdle(false);

      // 2. Clear previous idle timer countdown
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

      // 3. Set a new countdown: if no key is hit for 3 seconds, set idle to true
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 3000);

      // Start the game on first keystroke
      if (!started) setStarted(true);

      if (e.key === "Backspace") {
        setInput((p) => p.slice(0, -1));
        return;
      }

      if (e.key.length === 1) {
        setInput((prev) => {
          const next = prev + e.key;
          if (next.length === sanitizedText.length) {
            setIsCompleted(true);
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [started, isCompleted, sanitizedText.length]);

  const currentIndex = input.length;

  // 🔥 AUTO SCROLL
  useEffect(() => {
    const el = charRefs.current[currentIndex];
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentIndex]);

  // STATS CALCULATION
  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === sanitizedText[i]) correct++;
  }

  const wpm = Math.round(correct / 5 / (time / 60 || 1));
  const accuracy = input.length
    ? Math.round((correct / input.length) * 100)
    : 100;

  // 🏆 CONGRATULATIONS SCREEN CONDITIONAL RENDER
  if (isCompleted) {
    return (
      <CongratsScreen
        wpm={wpm}
        accuracy={accuracy}
        time={time}
        goBack={goBack}
      />
    );
  }

  return (
    <div className={styles.typingScreen}>
      <div className={styles.header}>
        <button onClick={goBack} className={styles.backBtn}>
          ← Back
        </button>
        {isIdle && (
          <span className={styles.idleBadge}>⏸️ Timer Paused (Idle)</span>
        )}
      </div>

      {/* FIXED WINDOW */}
      <div className={styles.textContainer}>
        <div className={styles.textInner}>
          {sanitizedText.split("").map((char, i) => {
            let charClass = styles.char;
            const isCurrent = i === currentIndex;

            if (i < input.length) {
              charClass +=
                input[i] === char ? ` ${styles.correct}` : ` ${styles.wrong}`;
            }

            if (isCurrent) {
              charClass += ` ${styles.current}`;
            }

            return (
              <span
                key={i}
                className={charClass}
                ref={(el) => (charRefs.current[i] = el)}
              >
                {char}
                {isCurrent && <span className={styles.caret} />}
              </span>
            );
          })}
        </div>
      </div>

      <VirtualKeyboard input={input} text={sanitizedText} />
      <Stats wpm={wpm} accuracy={accuracy} />
    </div>
  );
}

export default TypingScreen;
