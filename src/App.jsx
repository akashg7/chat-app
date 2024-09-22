import List from './components/list/List.jsx';
import Chat from "./components/chat/Chat.jsx"
import Login from './components/login/Login.jsx'
import Notification from "./components/notification/Notification.jsx"
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/firebase.js";
import { useUserStore } from "./lib/userStore.js";
import { useChatStore } from "./lib/chatStore.js";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [back, setBack] = useState(false);  // Control whether to show List or Chat

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  useEffect(() => {
    if (chatId) {
      setBack(false);  // Reset back when chatId changes
    }
  }, [chatId]);

  if (isLoading) return <div class="loader"></div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          {/* Show List when back is true or when chatId is null */}
          {back || !chatId ? (
            <List />
          ) : (
            <Chat setBack={setBack} />
          )}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;

{/* <div className='container'>
{ currentUser ? (    
  <>
     <List/>
      {chatId && <Chat/> } 
   {chatId && <Detail/>}
  </> ) : ( 
    <Login/>
)}
<Notification/>

</div> */}

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