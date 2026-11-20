import { useState, type FC } from 'react';
import type { UsuarioSistema } from './types/usuario';
import { apiAuth } from './services/api';
import { Login } from './pages/Login';
import { PainelMaster } from './pages/PainelMaster';
import { PainelGestor } from './pages/PainelGestor';
import { PortalPrestador } from './pages/PortalPrestador';

export const App: FC = () => {
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(() =>
    apiAuth.getSessao()
  );

  const handleLogout = () => {
    apiAuth.logout();
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  if (usuario.perfil === 'MASTER') {
    return <PainelMaster usuario={usuario} onLogout={handleLogout} />;
  }

  if (usuario.perfil === 'GESTOR') {
    return <PainelGestor usuario={usuario} onLogout={handleLogout} />;
  }

  return <PortalPrestador usuario={usuario} onLogout={handleLogout} />;
};

export default App;