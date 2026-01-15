import React from 'react';
import AuthGate from './components/auth/AuthGate';
import MainShell from './components/layout/MainShell';

const App: React.FC = () => {
    return (
        <AuthGate>
            <MainShell />
        </AuthGate>
    );
};

export default App;
