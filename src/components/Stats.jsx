function Stats({ wpm, accuracy }) {
  return (
    <div className="stats">
      <div>
        <h3>{wpm}</h3>
        <span>WPM</span>
      </div>

      <div>
        <h3>{accuracy}%</h3>
        <span>Accuracy</span>
      </div>
    </div>
  );
}

export default Stats;