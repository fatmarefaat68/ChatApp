import axios from "axios";
// import { useContext } from 'react';
// import { UserContext } from './Context/UserContext';
import Routess from './Routess';

function App() {

  axios.defaults.baseURL = "http://localhost:4040";
  axios.defaults.withCredentials = true;

  // const {username}= useContext(UserContext);
  // console.log(username);
  return (
      <Routess /> 
  )
}

export default App
