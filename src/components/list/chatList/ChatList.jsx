import { useState, useEffect } from "react";
import AddUser from "./addUser/addUser";
import "./chatList.css";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const ChatList = () => {

  const [chats, setChats] = useState([]);
  const [addMode, setMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId , changeChat } = useChatStore();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const items = res.data().chats

      const promises = items.map( async (item)=>{

        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const user = userDocSnap.data() 

        return {...item , user}        
      })

      const chatData = await Promise.all(promises)

      setChats(chatData.sort((a , b)=>b.updatedAt - a.updatedAt))
    });

    return () => {
      unsub();
    };
  }, [currentUser.id]);
  console.log(chats);

  const handleSelect = async (chat)=>{

    const userChats = chats.map((item)=>{
      const {user , ...rest} = item
      return rest
    })

    const chatIndex = userChats.findIndex(
      (item)=>item.chatId === chat.chatId)

    userChats[chatIndex].isSeen = true
    


    const userChatsRef = doc(db, "userchats", currentUser.id);

      try{
        await updateDoc(userChatsRef , {
          chats : userChats, 

        })
        changeChat(chat.chatId , chat.user)
      }catch(err){
        console.log(err)
      }

    

    // const userChatsSnapshot = await getDoc(userChatsRef);

    // if (userChatsSnapshot.exists()) {
    //   const userChatsData = userChatsSnapshot.data();

    //   const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

    //   userChatsData.chats[chatIndex].isSeen = true;


    //   await updateDoc(userChatsRef, {
    //     chats: userChatsData.chats,
    //   });
    // }

    
  }

  const filteredChats = chats.filter((c) => c.user.username.toLowerCase().includes(input.toLowerCase()))

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="Search" onChange={(e)=> setInput(e.target.value)} />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div className="item" key={chat.chatId} 
        onClick={() => { handleSelect(chat) }} 
        style={{
          backgroundColor : chat?.isSeen ? "transparent" : "#5183fe"
        }}
        >
          <img src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : 
            chat.user.avatar || "./avatar.png"} 
            alt="Avatar" />
          <div className="texts">
            <span>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username }</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
