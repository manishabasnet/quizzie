import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function ParticipantLobby() {
  const { quizCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();

    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws'); // your websocket endpoint
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        client.subscribe('/topic/quizStarted', (message) => {
          console.log('Received quiz start event');
          navigate(`/play-quiz/${quizCode}`, { state: { name: state.name } });
        });
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [navigate, quizCode, state.name]);

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
