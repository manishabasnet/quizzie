import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import JoinQuiz from './pages/JoinQuiz';
import CreateQuiz from './pages/CreateQuiz';
import ParticipantLobby from './pages/ParticipantLobby';
import HostLobby from './pages/HostLobby'; 


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
          </Routes>
      </Router>
    </div>
  )
}

export default App;
