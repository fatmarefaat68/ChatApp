import React, { useContext } from 'react';
import RegisterAndLogin from './RegisterAndLogin';
import Chat from './Chat';
import { Route, Routes } from "react-router-dom";
import { UserContext } from './Context/UserContext';


const Routess = () => {

  const {username} = useContext(UserContext);

  if(username){
    return <Chat />;
  }

  return (
  //  <Routes>
  //     <Route index element={<RegisterAndLogin />} />
  //     <Route path='/chat' element={<Chat />} />
  //  </Routes>
      // <Chat />
      <RegisterAndLogin />
  )
}

export default Routess;