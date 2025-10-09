import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';


export default function LoginPage () { 
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();


  async function handleLogin(e) { 
    e.preventDefault();
    
    try { 
      await login({username, password});
      navigate('/secure');
    } catch (err) { 
      console.error(err);
    }
  }



  return (
    <div>
      <h1>Login Page</h1> 
      <form onSubmit={handleLogin}>
        <input
          placeholder='Username'
          type='text' 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder='Password'
          type='password'
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type='submit'>
          Login
        </button>
      </form> 
    </div>
  )
}


