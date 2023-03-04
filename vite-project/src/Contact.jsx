import React from 'react';
import Avatar from './Avatar';

const Contact = ({id,onclick,selectedUserId,username,flag}) => {
  return (
    <div onClick={()=> onclick(id)}
                key={id} className={`flex gap-2 items-center cursor-pointer border-b border-gray-100 ${selectedUserId === id ? 'bg-blue-50': ''}`}> 
                    
                    {selectedUserId === id && <div className=" w-1 bg-blue-500 h-12 rounded-r-md"></div>}
                    <div className='flex gap-2 items-center py-2 pl-4'>
                        <Avatar online={flag} userId={id} username={username}/>
                        <span className='text-gray-800'>{username}</span>
                    </div>
    </div>
  )
}

export default Contact;