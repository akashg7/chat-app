// import "./userInfo.css"
// import { useUserStore } from "../../../lib/userStore";
// // import {UserCard} from "./userCard"
// import { useState } from "react";
// const UserInfo = ()=>{

//     const {currentUser} = useUserStore()
//     const [showUserCard , setShowUserCard] = useState(false)
//     const handleProfile = () => {
//         setShowUserCard(!showUserCard);
//       };
//     return (
//         <div className="UserInfo">
//             <div className="user" onClick={handleProfile}>
//                 <img src={currentUser.avatar || "./avatar.png" } alt="user picture"/>
//                 <h2>{currentUser.username}</h2>
//             </div>
//             {/* <div className="icons">
//                 <img src="./more.png" alt=""/>
//                 <img src="./video.png" alt=""/>
//                 <img src="./edit.png" alt=""/>
//             </div> */}
//             {showUserCard && (
//         <div className="userCard">
//           <h3>{currentUser.username}</h3>
//           <p>{currentUser.email}</p>
//         </div>
//             )}
//         </div>    
//         )
// }

// export default UserInfo;






import React, { useState } from 'react';
import './userInfo.css';
import { useUserStore } from "../../../lib/userStore";
import UserCard from "./userCard"

const UserInfo = () => {
  const [addUserCard , setUserCard] = useState(false)
  const { currentUser } = useUserStore();

  // Step 3: Create a state to control when to render the UserCard


  return (
    <div className="UserInfo">
      {/* User div that shows user info */}
      <div className="user" onClick={() => setUserCard((prev) => !prev)}>
        
        <img src={currentUser.avatar || "./avatar.png"} alt="user picture" />
        {/* </div> */}
        <h2>{currentUser.username}</h2>
      </div>

      {addUserCard && <UserCard userPhoto = {currentUser.avatar} user = {currentUser.username} email = {currentUser.email}/>}
    </div>
  );
};

export default UserInfo;
