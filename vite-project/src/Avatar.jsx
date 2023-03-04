import React from 'react'

const Avatar = ({userId,username,online}) => {

    const colors = ['bg-red-200', 'bg-blue-200',
                    'bg-green-200', 'bg-purple-200',
                    'bg-yellow-200', 'bg-teal-200',
                    'bg-pink-200'];
    
    const userIdBase10 = parseInt(userId, 16);
    const colorInd = userIdBase10 % colors.length;
    const color = colors[colorInd];
    console.log(color);
    

  return (
    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
        <span className='opacity-60'>{username[0].toUpperCase()}</span>
        {online && (
          <div className='absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white'></div>
        )}
        
        {!online && ( 
          <div className='absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white'></div>
        )} 
    </div>
  )
}

export default Avatar