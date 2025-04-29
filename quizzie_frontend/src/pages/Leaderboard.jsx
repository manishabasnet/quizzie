import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Leaderboard() {
  const { quizCode } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/quiz/leaderboard/${quizCode}`);
      if (response.ok) {
        const data = await response.json();
        const participantEntries = Object.entries(data.participants || {});
        const sorted = participantEntries.sort((a, b) => b[1] - a[1]); // Sort by score descending
        setParticipants(sorted);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const checkNextQuestion = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/quiz/current-question/${quizCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.finished) {
          console.log('Quiz Finished. Staying on leaderboard.');
          // Stay on leaderboard
        } else {
          console.log('Next question available. Navigating to PlayQuiz.');
          navigate(`/play-quiz/${quizCode}`);
        }
      }
    } catch (error) {
      console.error('Error checking next question:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard(); // Initial fetch

    const leaderboardInterval = setInterval(fetchLeaderboard, 2000); // Refresh every 2 seconds

    const timer = setTimeout(() => {
      clearInterval(leaderboardInterval); // Stop refreshing
      checkNextQuestion(); // After 10 seconds, move to next question
    }, 10000);

    return () => {
      clearInterval(leaderboardInterval);
      clearTimeout(timer);
    };
  }, [quizCode, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Leaderboard</h1>
      <p>Quiz Code: {quizCode}</p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {participants.map(([name, score], idx) => (
          <li key={idx} style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
            {name}: {score} points
          </li>
        ))}
      </ul>

      <p style={{ marginTop: '2rem', color: 'gray' }}>Loading next question soon...</p>
    </div>
  );
}

export default Leaderboard;
