import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TelaInicial from './pages/TelaInicial';
import LoginUsuario from './pages/LoginUsuario';
import LoginOng from './pages/LoginOng';
import CadastrarUsuario from './pages/CadastrarUsuario';
import CadastrarOng from './pages/CadastrarOng';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaInicial/>} />
        <Route path="/login-usuario" element={<LoginUsuario />} />
        <Route path="/login-ong" element={<LoginOng />} />
        <Route path="/cadastro-usuario" element={<CadastrarUsuario />} />
        <Route path="/cadastro-ong" element={<CadastrarOng />} />
      </Routes>
    </Router>
  );
}
