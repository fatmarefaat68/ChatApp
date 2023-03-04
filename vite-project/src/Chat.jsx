import React, { useRef } from 'react'
import { useEffect, useState, useContext } from 'react';
import Avatar from './Avatar';
import Logo from './Logo';
import axios from 'axios';
import { UserContext } from './Context/UserContext';
import {uniqBy} from "lodash";
import Contact from './Contact';

const Chat = () => {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');//msg in input field
    const [messages, setMessages] = useState([]); // to show the msg
    const {username, id,setId,setUsername} = useContext(UserContext);
    const [offlinePeople, setOfflinePeople] = useState({}); // to show offline people
    const refDiv = useRef();
    // for no duplicate
    const showOnlinePeople = (peopleArr) => {
        const people = {};
        peopleArr.forEach(({userId,username})=> {
            //not adding me //not working all thee time
            if(userId !== id)
                people[userId] = username;
        });
        setOnlinePeople(people);
        // console.log(onlinePeople);
    };

    const handleMessage = (e) => {
        const messageData = JSON.parse(e.data);
        console.log(e, messageData)
        //online people
        if('online' in messageData) { 
            showOnlinePeople(messageData.online);
        } 
        // sending message to online person
        else if('text' in messageData) {
            console.log(messages);
            setMessages(prev => ([...prev,{...messageData}]))
        }
    };

    const connectToWs = ()=> {
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);
        ws.addEventListener('message',handleMessage);
        ws.addEventListener('close',() => {
            setTimeout(() => {
                console.log("disconnected... try to connecy");
                connectToWs();
            },1000);
        });
    }

    useEffect(()=> {
        connectToWs();
    }, []);

    useEffect(()=> {
        axios.get("/auth/people").then(response => {
        const offlinePeopleArr = response.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id));
        const offlinePeoples = {};
        offlinePeopleArr.map(p => {
            offlinePeoples[p._id] = p.username;
        })
        // console.log({offlinePeoples, onlinePeople});
        setOfflinePeople(offlinePeoples);
        });
    },[onlinePeople]);

    const sendMessage = (e,file = null) => {
        if(e) e.preventDefault();

        // console.log(newMessageText);
        ws.send(JSON.stringify({
                recipient: selectedUserId,
                text: newMessageText,
                file
            }));
            // console.log(file);
        
        setNewMessageText('');
        setMessages(prev => ([...prev, {text: newMessageText,
            sender: id,
        recipient:selectedUserId,
        _id:Date.now()}]));//outGoing messages
    }

    const sendFile = (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        // console.log(reader);
        //run after we read the data
        reader.onload = () => {
            sendMessage(null,{
                name: e.target.files[0].name,
                data:reader.result});
        }
    }

    //changing in messages to scroll down
    useEffect(() =>{
        const div = refDiv.current;
        if(div)
        div.scrollIntoView({behavior:'smooth',block:'end'})
    },[messages]);

    //to fetch the messages from db
    useEffect(()=>{
        if(selectedUserId){
            axios.get('/messages/'+selectedUserId)
            .then((response)=> {
                // console.log(response);
                const {data} = response;
                setMessages(data);
            })
        }

    },[selectedUserId]);

    const logout = () => {
        axios.post('/auth/logout').then(()=> {
            // for killing the connection so dont try to send ping pong
            // setWs(null);
        
            setId(null);
            setUsername(null);
        });
    }

   

    const messagesWithoutDups = uniqBy(messages, '_id');

  return (
    <div className='flex h-screen'>

        <div className="bg-white w-1/3 flex flex-col">

        <div className='flex-grow'>
            <Logo />
            {Object.keys(onlinePeople).map(id =>(
                <Contact key={id} id={id} selectedUserId={selectedUserId} onclick={()=> setSelectedUserId(id)} username={onlinePeople[id]} flag={true}/>
            ))}
            {Object.keys(offlinePeople).map(id =>(
            <Contact key={id} id={id} selectedUserId={selectedUserId} onclick={()=> setSelectedUserId(id)} username={offlinePeople[id]} flag={false}/>
            ))}
        </div>
            
        <div className='p-2 text-center flex justify-center cursor-pointer'>
            <span className='text-sm mr-2 text-gray-600 flex items-center'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
                {username}
            </span>
            <button onClick={logout}
            className='text-sm bg-blue-200 py-1 px-2 text-gray-600 rounded-sm border'>Logout</button>
        </div>
        </div>

        {/* //end */}



        <div className="flex flex-col bg-blue-50 w-2/3 p-2">
            <div className="flex-grow">
                {!selectedUserId && (
                    <div className='flex items-center justify-center h-full text-gray-400'>
                        &larr;  Select a person from the sidebar
                    </div>
                )}

                {!!selectedUserId && (
                    <div className='relative h-full'>
                        <div className='overflow-y-scroll absolute top-0 right-0 left-0 bottom-2'>
                        {messagesWithoutDups.map(message => (
                            
                            <div key={message._id}
                            className={(message.sender === id ? 'text-right': 'text-left')}>
                                <div 
                                className={'inline-block text-left p-2 my-2 rounded-md text-sm '+ (message.sender === id? 'bg-blue-500 text-white':'bg-white text-gray-500' )}
                                >{message.text}
                                {message.file && (
                                    <div>
                                        <a href={axios.defaults.baseURL + '/' + message.file }>
                                            {message.file}
                                        </a>
                                    </div>
                                )}
                                    {/* {console.log(messages)}; */}
                                </div>
                            </div>
                        ))}
                    <div ref={refDiv}></div>
                    </div>
                    </div>
                    
                )}
                
            </div>
            
            {!!selectedUserId && (
                <form className='flex gap-2' onSubmit={sendMessage}>
                    <input type="text"
                    placeholder='Type your message here'
                    value={newMessageText}
                    onChange={e => setNewMessageText(e.target.value)}
                    className='bg-white border rounded-sm p-2 flex-grow' />

                    <label 
                    className='bg-blue-200 rounded-sm p-2 text-gray-700 cursor-pointer border border-blue-200'>
                        <input type="file" className='hidden' onChange={sendFile}/>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                        </svg>
                    </label>


                    <button type='submit'
                    className='bg-blue-500 rounded-sm p-2 text-white'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            )}

        </div>
    </div>
  )
}

export default Chat;