import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Start from './pages/Start';
import Game from './pages/Game';
import Result from './pages/Result';
import Welcome from './pages/Welcome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/start" element={<Start />} />
        <Route path="/game" element={<Game />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;