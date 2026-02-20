import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CameraModePage from './pages/CameraModePage';

// Detectar si la URL incluye el modo camara: /#camera o ?camera
const isCameraMode = () =>
  window.location.hash === '#camera' ||
  new URLSearchParams(window.location.search).has('camera');

function App() {
  const [user, setUser] = useState(null);
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

  if (cameraMode) return <CameraModePage />;

  return (
    <>
      {!user
        ? <AuthPage onLogin={setUser} />
        : <DashboardPage user={user} onLogout={() => setUser(null)} />
      }
    </>
  );
}

export default App;
