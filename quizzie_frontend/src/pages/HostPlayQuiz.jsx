import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function HostPlayQuiz() {
  const { quizCode } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const sock = new SockJS('http://localhost:8080/ws'); // Your backend WebSocket endpoint
    const stompClient = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to WebSocket (Host View)');
        
        // Subscribe to the quiz-specific topic
        stompClient.subscribe(`/topic/question/${quizCode}`, (message) => {
          const payload = JSON.parse(message.body);
          console.log('Received new question (host):', payload);
          setQuestionData(payload);
          setTimer(payload.timePerQuestion);
        });

        // Subscribe to leaderboard signal
        stompClient.subscribe(`/topic/leaderboard/${quizCode}`, () => {
          console.log('Received signal to show leaderboard (host)');
          navigate(`/leaderboard/${quizCode}`);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [quizCode, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev > 0 ? prev - 1 : 0); // protect timer from negative
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  if (!questionData) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Waiting for question...</div>;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Time Left: {timer} seconds</h2>

      <h1 style={{ marginBottom: '1.5rem' }}>{questionData.questionText}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {questionData.options.map((option, idx) => (
          <div
            key={idx}
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#f0f0f0',
              width: '300px',
              fontSize: '1rem',
              borderRadius: '8px'
            }}
          >
            {option}
          </div>
        ))}
      </div>

      <p style={{ marginTop: '2rem', color: 'gray' }}>Waiting for participants to answer...</p>
    </div>
  );
}

export default HostPlayQuiz;
