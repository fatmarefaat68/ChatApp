import React, { useContext } from 'react';
import { useState} from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { UserContext } from './Context/UserContext';

const RegisterAndLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('Register');
    const [redirect, setRedirect] = useState(false); //something new i added and the routes in routess
    const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);

    const handleSubmit = async(e)=> {
      e.preventDefault();
      const url = isLoginOrRegister === "Register" ? '/auth/register' : '/auth/login';
      axios.post(url, {username, password})
      .then(res => {
        setLoggedInUsername(username);
        setId(res.id);
        setRedirect(true);//something new i added
      })
      .catch(err => console.log(err.message));
}


if(redirect) {
  <Navigate to={'/chat'}/>
}



  return (
    <div className='bg-blue-50 h-screen flex items-center'>
        <form onSubmit={handleSubmit}
        className='w-64 mx-auto mb-12'>

            <input 
            value={username}
            onChange = {e => setUsername(e.target.value)}
            type="text" 
            placeholder='username'
            className='block w-full rounded-sm p-2 mb-2 border'/>

            <input
            value={password}
            onChange = {e => setPassword(e.target.value)}
            type="password" 
            placeholder='password'
            className='block w-full rounded-sm p-2 mb-2 border'/>

            <button 
            className='p-2 bg-blue-500 text-white w-full rounded-sm'>
              {isLoginOrRegister}
              </button>

            {isLoginOrRegister ==="Register" && 

            (<div className='text-center mt-2'>
                Already a member? 
                <button 
                onClick={()=> setIsLoginOrRegister("Login")}>
                  Login here
                  </button>
              </div>
            )}


              {isLoginOrRegister ==="Login" && 

              (<div className='text-center mt-2'>
                  Dont have an account? 
                  <button 
                  onClick={()=> setIsLoginOrRegister("Register")}>
                    Register
                    </button>
                </div>
              )}
            
        </form>
    </div>
  )
}

export default RegisterAndLogin;