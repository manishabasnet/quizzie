import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function PlayQuiz() {
  const { quizCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    // Poll backend until quiz officially starts
    const checkStartStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/quiz/status/${quizCode}`);
        if (response.ok) {
          const data = await response.json();
          if (data.started) {
            setQuizStarted(true);
          }
        }
      } catch (error) {
        console.error('Error checking quiz start status', error);
      }
    };

    const interval = setInterval(checkStartStatus, 3000);
    return () => clearInterval(interval);
  }, [quizCode]);

  // Connect to WebSocket after quiz starts
  useEffect(() => {
    if (!quizStarted) return;

    const sock = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');

        stompClient.subscribe(`/topic/question/${quizCode}`, (message) => {
          const payload = JSON.parse(message.body);
          console.log('Received new question:', payload);
          setQuestionData(payload);
          setTimer(payload.timePerQuestion);
          setSelectedOption('');
          setSubmitted(false);
        });

        stompClient.subscribe(`/topic/leaderboard/${quizCode}`, () => {
          console.log('Received leaderboard signal');
          navigate(`/leaderboard/${quizCode}`);
        });
      }
    });

    stompClient.activate();
    setClient(stompClient);

    return () => stompClient.deactivate();
  }, [quizStarted, quizCode, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0 && !submitted) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !submitted && questionData) {
      // Auto-submit when time runs out
      handleSubmit();
    }
  }, [timer, submitted, questionData]);

  // After submission, wait 2 seconds then move to leaderboard
  useEffect(() => {
    if (submitted) {
      const timeout = setTimeout(() => {
        navigate(`/leaderboard/${quizCode}`);
      }, 2000); // Wait 2 seconds after submitting
      return () => clearTimeout(timeout);
    }
  }, [submitted, navigate, quizCode]);

  const handleSubmit = async () => {
    if (submitted || !questionData) return;
    setSubmitted(true);

    try {
      const timeTaken = questionData.timePerQuestion - timer;
      await fetch(`http://localhost:8080/api/quiz/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizCode,
          playerName: state.name,
          selectedOption: selectedOption || null,
          timeTaken
        })
      });

      console.log('Answer submitted successfully');
      // (Navigation to leaderboard is handled separately in useEffect after 2s)
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (!quizStarted) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Waiting for host to start...</div>;
  }

  if (!questionData) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Waiting for question...</div>;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Time Left: {timer} seconds</h2>

      <h1 style={{ marginBottom: '1.5rem' }}>{questionData.questionText}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {questionData.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(option)}
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: selectedOption === option ? '#4CAF50' : '#f0f0f0',
              width: '300px',
              fontSize: '1rem'
            }}
            disabled={submitted}
          >
            {option}
          </button>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          style={{ padding: '1rem 2rem', fontSize: '1.2rem', marginTop: '1rem' }}
        >
          Submit Answer
        </button>
      )}

      {submitted && <p style={{ marginTop: '1rem', color: 'green' }}>Answer Submitted! Redirecting...</p>}
    </div>
  );
}

export default PlayQuiz;
