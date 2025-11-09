import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-mc3qquemjh0al6qu.us.auth0.com"
      clientId="Eq7pMkeEP0mBuFpl4mry7ZtzXYYmHfQN"
      authorizationParams={{
        redirect_uri: window.location.origin,
        // audience: `https://interview-d.us.auth0.com/api/v2/`,
        // scope: "openid profile email offline_access"
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
