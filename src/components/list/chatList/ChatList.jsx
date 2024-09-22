import { useState, useEffect, useRef } from "react";
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
  const { chatId, changeChat } = useChatStore();
  const addUserRef = useRef(null);  // Reference for AddUser component
  const plusIconRef = useRef(null); // Reference for the plus icon

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const items = res.data().chats;

      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.data();

        return { ...item, user };
      });

      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unsub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {

    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      // changeChat(null, null)
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if clicked outside AddUser component and the plus icon
      if (
        addUserRef.current &&
        !addUserRef.current.contains(event.target) &&
        plusIconRef.current &&
        !plusIconRef.current.contains(event.target)
      ) {
        setMode(false); // Hide AddUser component
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src="./plus.png"
          alt=""
          className="add"
          ref={plusIconRef} // Ref for the plus icon
          onClick={() => setMode((prev) => !prev)} // Toggle addMode
        />
      </div>

      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => {
            handleSelect(chat);
          }} 
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt="Avatar"
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            {chat.lastMessage.length > 30 ? (
              <p>{chat.lastMessage.slice(0, 30) + "..."}</p>
            ) : (
              <p>{chat.lastMessage}</p>
            )}
          </div>
        </div>
      ))}

      {addMode && <AddUser reff={addUserRef} />}
    </div>
  );
};

export default ChatList;
