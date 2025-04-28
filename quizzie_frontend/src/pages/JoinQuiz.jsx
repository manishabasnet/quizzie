import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function JoinPage() {
  const [role, setRole] = useState('participant');
  const [name, setName] = useState('');
  const [quizCode, setQuizCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!name || !quizCode) {
      alert('Please fill in all fields!');
      return;
    }

    try {
      if (role === 'host') {
        // Update host name in DB
        await fetch('http://localhost:8080/api/quiz/join-host', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizCode,
            hostName: name
          })
        });
        navigate(`/host-lobby/${quizCode}`, { state: { name } });
      } else {
        // Add participant to DB
        await fetch('http://localhost:8080/api/quiz/join-participant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizCode,
            participantName: name
          })
        });
        navigate(`/participant-lobby/${quizCode}`, { state: { name } });
      }
    } catch (error) {
      console.error('Error joining quiz:', error);
      alert('Error joining quiz!');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Join Quiz</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '0.5rem', width: '60%' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter Quiz Code"
          value={quizCode}
          onChange={(e) => setQuizCode(e.target.value)}
          style={{ padding: '0.5rem', width: '60%' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            name="role"
            value="host"
            checked={role === 'host'}
            onChange={() => setRole('host')}
            style={{ marginRight: '0.5rem' }}
          />
          Host
        </label>

        <label style={{ marginLeft: '1rem' }}>
          <input
            type="radio"
            name="role"
            value="participant"
            checked={role === 'participant'}
            onChange={() => setRole('participant')}
            style={{ marginRight: '0.5rem' }}
          />
          Participant
        </label>
      </div>

      <button onClick={handleJoin} style={{ padding: '1rem 2rem' }}>
        Join
      </button>
    </div>
  );
}

export default JoinPage;
