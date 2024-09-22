import { useUserStore } from "../../lib/userStore.js";
import { useChatStore } from "../../lib/chatStore.js";
import { db } from "../firebase.js";
import { doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { auth } from "../firebase.js";
import "./detail.css";
import React, { useEffect, useRef, useState } from "react";
import "../list/chatList/addUser/addUser.css";
// import {auth} from "../../firebase"

const Detail = ({ mode , set , reff }) => {
  // const isMobile = window.innerWidth <= 768;
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();
  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

//   const [isVisible, setIsVisible] = useState(true); // Control the visibility of the card
//   const cardRef = useRef(null); // Reference to the user card

//   // This effect listens for clicks outside the userCard
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Check if the clicked element is outside the card
//       if (cardRef.current && !cardRef.current.contains(event.target)) {
//         setIsVisible(false); // Hide the card
//       }
//     };

//     // Attach the event listener to the whole document
//     document.addEventListener("mousedown", handleClickOutside);

//     // Cleanup event listener on component unmount
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [cardRef]);

  return (
    <>
 { mode && (
    <>
    {/* Conditionally render the card based on visibility */}
    

   
  
  <div className="detail" ref={reff}>
      <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <h2>{user?.username}</h2>
          <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="info">

          <button onClick={handleBlock} >{
              isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "Unblock" : "Block User"
              }</button>
          {/* <button className="logout" onClick={()=>auth.signOut()}>Logout</button> */}
      </div>
  </div>
  </>
  )}
  </>

  );
};

export default Detail;

