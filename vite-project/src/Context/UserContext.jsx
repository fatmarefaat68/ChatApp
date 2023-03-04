import { createContext, useEffect, useState } from "react";
import axios from 'axios';

export const UserContext = createContext({});

export const UserContextProvider = ({children}) => {
    const [username,setUsername] = useState(null);
    const [id,setId] = useState(null);

    useEffect(()=>{
        axios.get('/auth/profile', {withCredentials:true})
        .then(response => {
            setId(response.data.userId);
            setUsername(response.data.username);
        })
        .catch(err => {});
    },[]);

    return (
        <UserContext.Provider value={{username,setUsername,id,setId}}>
            {children}
        </UserContext.Provider>
    );
} 
