import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TelaInicial from './pages/TelaInicial';
import LoginUsuario from './pages/LoginUsuario';
import LoginOng from './pages/LoginOng';
import CadastrarUsuario from './pages/CadastrarUsuario';
import CadastrarOng from './pages/CadastrarOng';
import Catalogo from './pages/Catalogo';
import PerfilOng from './pages/PerfilOng';
import PerfilOngProprietario from './pages/PerfilOngProprietario';
import EdicaoOng from './pages/EdicaoOng';
import ProprietarioDoacoes from './pages/ProprietarioDoacoes';
import PerfilUsuario from './pages/PerfilUsuario';
import EdicaoUsuario from './pages/EdicaoUsuario';
import DeletarUsuario from './pages/DeletarUsuario';
import DeletarOng from './pages/DeletarOng';
import DoacoesUsuario from './pages/DoacoesUsuario';
import DoacaoTela from './pages/DoacaoTela';
import RecuperacaoSenha from './pages/RecuperacaoSenha';
import './pages/TelaInicial.css';
import './components/BotoesVermelhos.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TelaInicial/>} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/perfil-ong/:id" element={<PerfilOng />} />
        <Route path="/perfil-ong-proprietario" element={<PerfilOngProprietario />} />
        <Route path="/editar-perfil-ong" element={<EdicaoOng />} />
        <Route path="/verificar-doacoes-ong" element={<ProprietarioDoacoes />} />
        <Route path="/perfil-usuario" element={<PerfilUsuario />} />
        <Route path="/editar-perfil" element={<EdicaoUsuario />} />
        <Route path="/deletar-conta" element={<DeletarUsuario />} />
        <Route path="/excluir-conta-ong" element={<DeletarOng />} />
        <Route path="/minhas-doacoes" element={<DoacoesUsuario />} />
        <Route path="/doacao/:id" element={<DoacaoTela />} />
        <Route path="/recuperacao-senha" element={<RecuperacaoSenha />} />
        <Route path="/login-usuario" element={<LoginUsuario />} />
        <Route path="/login-ong" element={<LoginOng />} />
        <Route path="/cadastro-usuario" element={<CadastrarUsuario />} />
        <Route path="/cadastro-ong" element={<CadastrarOng />} />
      </Routes>
    </Router>
  );
}
