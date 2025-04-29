import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function ParticipantLobby() {
  const { quizCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [participants, setParticipants] = useState([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/quiz/participants/${quizCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.participants) {
          setParticipants(Object.keys(data.participants));
        }
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchQuizStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/quiz/status/${quizCode}`);
      if (response.ok) {
        const data = await response.json();
        setStarted(data.started);
      }
    } catch (error) {
      console.error('Error checking quiz status:', error);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchQuizStatus();

    const interval = setInterval(() => {
      fetchParticipants();
      fetchQuizStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (started) {
      navigate(`/play-quiz/${quizCode}`, { state: { name: state.name } });
    }
  }, [started, navigate, quizCode, state.name]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Waiting for Host to Start...</h1>
      <p>Quiz Code: {quizCode}</p>
      <p>Player Name: {state.name}</p>

      <h2>Participants:</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {participants.map((name, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>{name}</li>
        ))}
      </ul>

      <p style={{ marginTop: '2rem' }}>Waiting for host to start the quiz...</p>
    </div>
  );
}

export default ParticipantLobby;
