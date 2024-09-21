import List from './components/list/List.jsx';
import Detail from "./components/detail/Detail.jsx"
import Chat from "./components/chat/Chat.jsx"
import Login from './components/login/Login.jsx'
import Notification from "./components/notification/Notification.jsx"
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/firebase.js";
import { useUserStore } from "./lib/userStore.js";
import { useChatStore } from "./lib/chatStore.js";
import useStore from './lib/useStore.js';

const App = () => {
  // const { activeComponent, setActiveComponent } = useStore();
  const {currentUser , isLoading , fetchUserInfo} = useUserStore()
  const {chatId} = useChatStore()
  useEffect(()=>{
    const unSub = onAuthStateChanged(auth , (user)=>{
       fetchUserInfo(user?.uid)
    })

    return ()=>{
      unSub()
    }
  } , [fetchUserInfo])
  console.log(currentUser)
  if (isLoading) return <div className="loading">Loading...</div>
  return (
    <div className='container'>
      { currentUser ? (    
        <>
           <List/>
            {chatId && <Chat/> } 
         {chatId && <Detail/>}
        </> ) : ( 
          <Login/>
      )}
      <Notification/>

    </div>
  )
}

export default App


// import Detail from "./components/detail/Detail.jsx"
// import Chat from "./components/chat/Chat.jsx"
// import React, { useState } from 'react';
// import ChatList from './components/list/chatList/ChatList.jsx';


// function App() {
//     const [showChatList, setShowChatList] = useState(true);
//     const [showChat, setShowChat] = useState(false);
//     const [showDetail, setShowDetail] = useState(false);

//     return (
//         <div className="appContainer">
//             {showChatList && (
//                 <ChatList
//                     onChatClick={() => {
//                         setShowChat(true);
//                         setShowChatList(false);
//                     }}
//                     onDetailClick={() => {
//                         setShowDetail(true);
//                         setShowChatList(false);
//                     }}
//                 />
//             )}

//             {showChat && (
//                 <Chat
//                     onBackClick={() => {
//                         setShowChatList(true);
//                         setShowChat(false);
//                     }}
//                     onDetailClick={() => {
//                         setShowDetail(true);
//                         setShowChat(false);
//                     }}
//                 />
//             )}

//             {showDetail && (
//                 <Detail
//                     onBackClick={() => {
//                         setShowChatList(true);
//                         setShowDetail(false);
//                     }}
//                 />
//             )}
//         </div>
//     );
// }

// export default App;




{/* <div className='container'>
{ currentUser ? (    
  <>
  
    <List/> 
   {chatId && <Chat/>}
   {chatId && <Detail/>}
  </> ) : ( 
    <Login/>
)}
<Notification/>

</div> */}