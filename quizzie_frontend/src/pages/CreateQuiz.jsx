import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateQuiz() {
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [quizCode, setQuizCode] = useState('');
  const navigate = useNavigate();

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === 'questionText') {
      updatedQuestions[index].questionText = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      updatedQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = value;
    }
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const quizData = {
      title: quizTitle,
      description: quizDescription,
      timePerQuestion: parseInt(timePerQuestion),
      questions: questions
    };

    try {
      const response = await fetch('http://localhost:8080/api/quiz/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        const data = await response.text();
        setQuizCode(data);

        // Also create participant DB
        await fetch('http://localhost:8080/api/quiz/create-participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizCode: data,
            host: '',
            participants: {}
          })
        });

      } else {
        alert('Failed to create quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error creating quiz');
    }
  };

  if (quizCode) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Quiz Created Successfully!</h2>
        <h3>Share this Code:</h3>
        <div style={{ fontSize: '2rem', margin: '1rem' }}>{quizCode}</div>

        <button onClick={() => navigate('/join')} style={{ padding: '1rem 2rem', marginTop: '2rem' }}>
          Go to Join Page
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Create New Quiz</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Quiz Title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <textarea
            placeholder="Quiz Description"
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="number"
            placeholder="Time per question (seconds)"
            value={timePerQuestion}
            onChange={(e) => setTimePerQuestion(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <h2>Questions</h2>

        {questions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
            <input
              type="text"
              placeholder={`Question ${idx + 1}`}
              value={q.questionText}
              onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
            />
            {q.options.map((option, optionIdx) => (
              <input
                key={optionIdx}
                type="text"
                placeholder={`Option ${optionIdx + 1}`}
                value={option}
                onChange={(e) => handleQuestionChange(idx, `option-${optionIdx}`, e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
              />
            ))}
            <input
              type="text"
              placeholder="Correct Answer"
              value={q.correctAnswer}
              onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
        ))}

        <button type="button" onClick={addQuestion} style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}>
          Add Another Question
        </button>

        <br />

        <button type="submit" style={{ padding: '1rem 2rem' }}>
          Submit Quiz
        </button>
      </form>
    </div>
  );
}

export default CreateQuiz;
