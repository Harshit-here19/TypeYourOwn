import styles from "./CongratsScreen.module.css";

function CongratsScreen({ wpm, accuracy, time, goBack }) {
  return (
    <div className={styles.congratsWindow}>
      <h2>🎉 Congratulations!</h2>
      <p>You have successfully finished the typing test.</p>

      <div className={styles.finalStats}>
        <div>
          <h3>{wpm}</h3>
          <p>WPM</p>
        </div>

        <div>
          <h3>{accuracy}%</h3>
          <p>Accuracy</p>
        </div>

        <div>
          <h3>{time}s</h3>
          <p>Total Time</p>
        </div>
      </div>

      <button className={styles.actionBtn} onClick={goBack}>
        Practice Another Text
      </button>
    </div>
  );
}

export default CongratsScreen;