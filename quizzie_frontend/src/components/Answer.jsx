import { useState, useEffect } from 'react';

function AnswerComponent({ questionData, onSubmitAnswer }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    // Record when the question is shown
    setStartTime(Date.now());
  }, [questionData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedOption) {
      alert('Please select an option!');
      return;
    }

    const endTime = Date.now();
    const timeTakenSeconds = Math.floor((endTime - startTime) / 1000);

    const answerResult = {
      selectedAnswer: selectedOption,
      correctAnswer: questionData.correctAnswer,
      timeTaken: timeTakenSeconds,
      isCorrect: selectedOption === questionData.correctAnswer
    };

    // Send back to parent (like QuizPage)
    onSubmitAnswer(answerResult);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{questionData.questionText}</h2>

      <form onSubmit={handleSubmit}>
        {questionData.options.map((option, idx) => (
          <div key={idx} style={{ marginBottom: '1rem' }}>
            <label>
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedOption === option}
                onChange={(e) => setSelectedOption(e.target.value)}
                style={{ marginRight: '0.5rem' }}
              />
              {option}
            </label>
          </div>
        ))}

        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Submit Answer
        </button>
      </form>
    </div>
  );
}

export default AnswerComponent;
