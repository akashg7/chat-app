// import React from 'react';
// import './userCard.css';  

// const UserCard = ({ userPhoto, user, email }) => {
//   return (
//     <div className="userCard">

//       <img src={userPhoto} className="profile-picture" alt="user profile"/>
//       <h1 className="profile-name">{user}</h1>
//       <h1 className="profile-email">{email}</h1> {/* Separate class for email */}
//       
        
//     </div>
//   );
// };

// export default UserCard;


import React, { useEffect, useRef, useState } from 'react';
import './userCard.css';
import {auth} from "../../firebase"

const UserCard = ({ userPhoto, user, email }) => {
  const [isVisible, setIsVisible] = useState(true);  // Control the visibility of the card
  const cardRef = useRef(null);  // Reference to the user card

  // This effect listens for clicks outside the userCard
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the clicked element is outside the card
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsVisible(false);  // Hide the card
      }
    };

    // Attach the event listener to the whole document
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cardRef]);

  return (
    <>
      {/* Conditionally render the card based on visibility */}
      {isVisible && (
        <div className="userCard" ref={cardRef}>
          <img src={userPhoto} className="profile-picture" alt="user profile" />
          <h1 className="profile-name">{user}</h1>
          <h1 className="profile-email">{email}</h1>
          <h1 className='profile-email'> About : I love Swimming</h1>

          <button className="logout" onClick={()=>auth.signOut()}>Logout</button>

        </div>
      )}
    </>
  );
};

export default UserCard;



