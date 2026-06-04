function TypingArea({
  text,
  input,
  setInput
}) {
  return (
    <div className="typing-wrapper">
      <div className="text-display">
        {text.split("").map((char, index) => {
          let className = "";

          if (index < input.length) {
            className =
              input[index] === char
                ? "correct"
                : "incorrect";
          }

          return (
            <span
              key={index}
              className={className}
            >
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        className="typing-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Start typing..."
      />
    </div>
  );
}

export default TypingArea;