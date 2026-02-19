import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // meta viewport fix for mobile
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
  }, []);

  return (
    <>
      {!user ? <AuthPage onLogin={setUser} /> : <DashboardPage user={user} onLogout={() => setUser(null)} />}
    </>
  );
}

export default App;
