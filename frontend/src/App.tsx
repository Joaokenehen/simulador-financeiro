import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Start from './pages/Start';
import Perks from './pages/Perks';
import Game from './pages/Game';
import Result from './pages/Result';
import Welcome from './pages/Welcome';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b', // bg-slate-800
            color: '#f8fafc', // text-slate-50
            border: '1px solid #334155', // border-slate-700
            borderRadius: '16px',
            fontWeight: 'bold',
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // red-500
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/start" element={<Start />} />
        <Route path="/perks" element={<Perks />} />
        <Route path="/game" element={<Game />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;