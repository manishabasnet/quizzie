import { useNavigate } from 'react-router-dom';

function Main() {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate('/join');
  };

  const handleStartClick = () => {
    navigate('/create');
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to Quizzie!</h1>
      <button onClick={handleJoinClick} style={{ margin: "1rem", padding: "1rem 2rem" }}>
        Join Quiz
      </button>
      <button onClick={handleStartClick} style={{ margin: "1rem", padding: "1rem 2rem" }}>
        Host Quiz
      </button>
    </div>
  );
}

export default Main;
