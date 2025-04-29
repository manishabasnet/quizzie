import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function HostLobby() {
  const { quizCode } = useParams();
  const { state } = useLocation(); // host's name
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/quiz/participants/${quizCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.participants) {
          setParticipants(Object.keys(data.participants));
        }
      } else {
        console.error('Failed to fetch participants');
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      await fetch(`http://localhost:8080/api/quiz/start/${quizCode}`, {
        method: 'POST',
      });

      // Move host to "play" page
      navigate(`/host-play-quiz/${quizCode}`, { state: { name: state.name } });
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Error starting quiz.');
    }
  };

  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000); // Refresh participants every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Host Lobby</h1>
      <p>Quiz Code: {quizCode}</p>
      <p>Host Name: {state.name}</p>

      <h2>Participants Joined:</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {participants.map((name, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>{name}</li>
        ))}
      </ul>

      <button 
        onClick={startQuiz} 
        style={{ marginTop: '2rem', padding: '1rem 2rem', fontSize: '1rem' }}
      >
        Start Quiz
      </button>
    </div>
  );
}

export default HostLobby;
