import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CameraModePage from './pages/CameraModePage';

// Detectar si la URL incluye el modo camara: /#camera o ?camera
const isCameraMode = () =>
  window.location.hash === '#camera' ||
  new URLSearchParams(window.location.search).has('camera');

function App() {
  const [auth, setAuth] = useState(null); // { user, token }
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
        ? <AuthPage onLogin={(userData) => setAuth({ user: userData, token: userData.token })} />
        : <DashboardPage user={auth.user} token={auth.token} onLogout={() => setAuth(null)} />
      }
    </>
  );
}

export default App;
