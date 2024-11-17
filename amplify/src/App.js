import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate  } from 'react-router-dom';
import DeviceList from './components/DeviceList'; 
import UpdateDevice from './components/UpdateDevice';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import UnauthorizedPage from './components/UnauthorizedPage';

function getNameFromEmail(email) {
    if (!email) return '';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function App() {
    const [isAuthorized, setIsAuthorized] = useState(null); // null for loading, true/false for authorization state
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const verifyUserGroup = async () => {
        try {
          // Fetch the authentication session to get tokens
          const authSession = await fetchAuthSession({ fetchTokens: true, forceRefresh: true });
          const { accessToken } = authSession.tokens;
  
          if (!accessToken) {
            throw new Error('No access token found');
          }

        // Directly retrieve the groups from the token payload
        const groups = accessToken.payload['cognito:groups'] || [];

        // Check if the user is part of the "AuthorizedUsers" group
        if (groups.includes('AuthorizedUsers')) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
        } catch (err) {
            console.error('Failed to verify user group:', err);
            setError('Failed to verify user group. Please try again.');
            setIsAuthorized(false);
        }
    };

    verifyUserGroup();
}, []);
  
    // Show a loading indicator while verifying the user's group
    if (isAuthorized === null) {
      return <p>Loading...</p>;
    }
  
    // Show an error message if something went wrong
    if (error) {
      return (
        <div>
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      );
    }
    return (
        <Authenticator>
            {({ signOut, user }) => (
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true, }}>
                    <div>
                    <h1>Welcome {getNameFromEmail(user.signInDetails?.loginId) || user.username}</h1>
                        <button onClick={signOut}>Sign Out</button>
                        {isAuthorized ? (
                            <Routes>
                                <Route path="/" element={isAuthorized ? <DeviceList /> : <Navigate to="/unauthorized" replace />}/>
                                <Route path="/update-device" element={<UpdateDevice />} />
                            </Routes>
                        ): ( 
                        <UnauthorizedPage />
                        )}       
                    </div>
                </Router>
            )}
        </Authenticator>
    );
}

