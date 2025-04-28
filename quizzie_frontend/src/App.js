import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import JoinQuiz from './pages/JoinQuiz';
import CreateQuiz from './pages/CreateQuiz';


function App() {
  return (
    <div> 
        <Router>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/join" element={<JoinQuiz />} />
            <Route path="/create" element={<CreateQuiz />} />
          </Routes>
      </Router>
    </div>
  )
}

export default App;
