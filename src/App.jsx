import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CameraModePage from './pages/CameraModePage';

// Detectar si la URL incluye el modo camara: /#camera o ?camera
const isCameraMode = () =>
  window.location.hash === '#camera' ||
  new URLSearchParams(window.location.search).has('camera');

function App() {
  const [auth, setAuth] = useState(() => {
    // Recuperar sesion guardada al recargar la pagina
    try {
      const saved = sessionStorage.getItem('omni_auth');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [cameraMode] = useState(isCameraMode);

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
  }, []);

  // CameraModePage lee su propio token desde la URL
  if (cameraMode) return <CameraModePage />;

  return (
    <>
      {!auth
        ? <AuthPage onLogin={(userData) => {
              const newAuth = { user: userData, token: userData.token };
              sessionStorage.setItem('omni_auth', JSON.stringify(newAuth));
              setAuth(newAuth);
            }} />
        : <DashboardPage user={auth.user} token={auth.token} onLogout={() => {
              sessionStorage.removeItem('omni_auth');
              setAuth(null);
            }} />
      }
    </>
  );
}

export default App;
