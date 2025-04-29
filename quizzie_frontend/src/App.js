import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import JoinQuiz from './pages/JoinQuiz';
import CreateQuiz from './pages/CreateQuiz';
import ParticipantLobby from './pages/ParticipantLobby';
import HostLobby from './pages/HostLobby'; 
import PlayQuiz from './pages/PlayQuiz';              // Player Playing Quiz
import HostPlayQuiz from './pages/HostPlayQuiz';      // Host View While Playing
import Leaderboard from './pages/Leaderboard';        // Final Leaderboard


function App() {
  return (
    <div> 
        <Router>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/join" element={<JoinQuiz />} />
            <Route path="/create" element={<CreateQuiz />} />
            <Route path="/participant-lobby/:quizCode" element={<ParticipantLobby />} />  {/* ✅ ADD THIS */}
            <Route path="/host-lobby/:quizCode" element={<HostLobby />} />
            <Route path="/play-quiz/:quizCode" element={<PlayQuiz />} />
            <Route path="/host-play-quiz/:quizCode" element={<HostPlayQuiz />} />
            <Route path="/leaderboard/:quizCode" element={<Leaderboard />} />
          </Routes>
      </Router>
    </div>
  )
}

export default App;
