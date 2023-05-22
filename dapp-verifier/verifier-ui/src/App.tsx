import { useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Verifier from './pages/Verifier';
import DApp from './pages/DApp';
import Auth from './pages/Auth';
import NoPage from './pages/NoPage';

import {init} from './utils/Web3Client';

function App() {
  useEffect(() => {
    init();
  }, []);

  return (
    <Router>
    {<Navbar />}
    <Routes>
        <Route path='/' element={<Auth />} />
        <Route path='/auth' element={<Auth/>} />
        <Route path='/verifier' element={<Verifier/>} />
        <Route path='/dapp' element={<DApp/>} />
        <Route path='*' element={<NoPage/>} />
    </Routes>
    </Router>
  );
}

export default App;
