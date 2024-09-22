import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  doc,
  getDoc,
  onSnapshot,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import ChatList from "../list/chatList/ChatList";
import Detail from "../detail/Detail";
const Chat = ({ setBack }) => {
  const [open, setOpen] = useState(true);

  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const [addMode, setMode] = useState(false);
  const addUserRef = useRef(null); // Reference for AddUser component
  const plusIconRef = useRef(null); // Reference for the plus icon

  // const [back , setBack] = useState(false)

  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => unSub();
  }, [chatId]);

  console.log(chat);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");
  };
  const handleBack = () => {
    return <ChatList />;
  };

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
  const buttons = {
    backgroundColor: "black",
    borderRadius: "50%", // Using 50% for circular shape
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
        <img style={{height:'30px' , width:'25px' , cursor:'pointer'}} src = {"https://cdn-icons-png.flaticon.com/256/9312/9312240.png"}
        onClick={() => setBack(true)}
        />
          {/* <button >Back</button> */}
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor.</p>
          </div>
        </div>
        <div className="icons">
          {/* <img src="./phone.png"/> */}
          {/* <img src="./video.png"/> */}
          <div className="info" style={buttons}>
            <img
              src="./info.png"
              ref={plusIconRef} // Ref for the plus icon
              onClick={() => setMode((prev) => !prev)} // Toggle addMode
            />
          </div>
        </div>
      </div>
      <div className="centre">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser.id ? "message own" : "message"
            }
            key={message?.createdAt}
          >
            <div className="text">
              {message.img && <img src={message.img} alt="sent" />}
              <p>{message.text}</p>
              {/* <span>1 min ago</span> */}
            </div>
          </div>
        ))}

        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}> </div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <div className="info">
              <img
                style={{
                  backgroundColor: "black",
                  // borderRadius: "50%", 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                src="./img.png"
                alt=""
              />
            </div>
          </label>
          <input
            type="file"
            id="file"
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            style={{ display: "none" }}
            onChange={handleImg}
          />
          {/* <img src="./camera.png" alt="" /> */}
          {/* <img src="./mic.png" alt="" /> */}
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a Message!"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="info" style={buttons}>
          <div className="emoji">
            <img
              style={buttons}
              src="./emoji.png"
              alt=""
              onClick={() => setOpen((prev) => !prev)}
            />

            <div className="picker">
              <EmojiPicker  open={!open} onEmojiClick={handleEmoji} />
            </div>
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        > 
          Send
        </button>
      </div>
      {addMode && <Detail mode={addMode} set={setMode} reff={addUserRef} />}
    </div>
  );
};

export default Chat;

// import Detail from "../detail/Detail"
// import { useEffect, useRef, useState } from "react";
// import "./chat.css";
// import EmojiPicker from "emoji-picker-react";
// import { doc, getDoc, onSnapshot, arrayUnion, updateDoc } from "firebase/firestore";
// import { db } from "../firebase";
// import { useChatStore } from "../../lib/chatStore";
// import { useUserStore } from "../../lib/userStore";
// import upload from "../../lib/upload";

// const Chat = () => {

//   const [open, setOpen] = useState(true);
//   const [chat, setChat] = useState();
//   const [text, setText] = useState("");
//   const [addMode, setMode] = useState(false);

//   const addUserRef = useRef(null);  // Reference for AddUser component
//   const plusIconRef = useRef(null); // Reference for the plus icon

//   const [img, setImg] = useState({
//     file: null,
//     url: "",
//   });

//   const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
//   const { currentUser } = useUserStore();

//   const endRef = useRef(null);

//   // Scroll to the bottom when messages are updated
//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chat?.messages]);

//   // Fetch the chat data
//   useEffect(() => {
//     const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
//       setChat(res.data());
//     });
//     return () => unSub();
//   }, [chatId]);

//   const handleEmoji = (e) => {
//     setText((prev) => prev + e.emoji);
//     setOpen(false);
//   };

//   const handleImg = (e) => {
//     if (e.target.files[0]) {
//       setImg({
//         file: e.target.files[0],
//         url: URL.createObjectURL(e.target.files[0]),
//       });
//     }
//   };

//   const handleSend = async () => {
//     if (text === "" && !img.file) return;

//     let imgUrl = null;
//     try {
//       if (img.file) {
//         imgUrl = await upload(img.file);
//       }
//       await updateDoc(doc(db, "chats", chatId), {
//         messages: arrayUnion({
//           senderId: currentUser.id,
//           text,
//           createdAt: new Date(),
//           ...(imgUrl && { img: imgUrl }),
//         }),
//       });

//       const userIDs = [currentUser.id, user.id];
//       userIDs.forEach(async (id) => {
//         const userChatsRef = doc(db, "userchats", id);
//         const userChatsSnapshot = await getDoc(userChatsRef);

//         if (userChatsSnapshot.exists()) {
//           const userChatsData = userChatsSnapshot.data();
//           const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

//           userChatsData.chats[chatIndex].lastMessage = text;
//           userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
//           userChatsData.chats[chatIndex].updatedAt = Date.now();

//           await updateDoc(userChatsRef, {
//             chats: userChatsData.chats,
//           });
//         }
//       });
//     } catch (err) {
//       console.log(err);
//     }

//     setImg({
//       file: null,
//       url: "",
//     });

//     setText("");
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Check if clicked outside AddUser component and the plus icon
//       if (
//         addUserRef.current &&
//         !addUserRef.current.contains(event.target) &&
//         plusIconRef.current &&
//         !plusIconRef.current.contains(event.target)
//       ) {
//         setMode(false); // Hide AddUser component
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="chat">
//       <div className="top">
//         <div className="user">
//           {/* <button  className="back-button">
//             Back
//           </button> */}
//           <img src={user?.avatar || "./avatar.png"} alt="" />
//           <div className="texts">
//             <span>{user?.username}</span>
//             <p>Lorem ipsum dolor.</p>
//           </div>
//         </div>
//         <div className="icons">
//           {/* <img src="./phone.png"/> */}
//           {/* <img src="./video.png"/> */}
//           <img src="./info.png" alt="Info" onClick={() => setMode((prev) => !prev)}/>
//         </div>
//       </div>
//       <div className="centre">
//         {chat?.messages?.map((message) => (
//           <div
//             className={message.senderId === currentUser.id ? "message own" : "message"}
//             key={message?.createdAt}
//           >
//             <div className="text">
//               {message.img && <img src={message.img} alt="sent" />}
//               <p>{message.text}</p>
//               {/* <span>1 min ago</span> */}
//             </div>
//           </div>
//         ))}

//         {img.url && (
//           <div className="message own">
//             <div className="texts">
//               <img src={img.url} alt="" />
//             </div>
//           </div>
//         )}
//         <div ref={endRef}> </div>
//         {/* {showUserCard && <UserCard username={currentUser.username} email={currentUser.email} />} */}

//       </div>
//       <div className="bottom">
//         <div className="icons">
//           <label htmlFor="file">
//             <img src="./img.png" alt="" />
//           </label>
//           <input
//             type="file"
//             id="file"
//             disabled={isCurrentUserBlocked || isReceiverBlocked}
//             style={{ display: "none" }}
//             onChange={handleImg}
//           />
//           <img src="./camera.png" alt="" />
//           <img src="./mic.png" alt="" />
//         </div>
//         <input
//           type="text"
//           placeholder={
//             isCurrentUserBlocked || isReceiverBlocked
//               ? "You cannot send a Message!"
//               : "Type a message..."
//           }
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           disabled={isCurrentUserBlocked || isReceiverBlocked}
//         />
//         <div className="emoji">
//           <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
//           <div className="picker">
//             <EmojiPicker open={!open} onEmojiClick={handleEmoji} />
//           </div>
//         </div>
//         <button
//           className="sendButton"
//           onClick={handleSend}
//           disabled={isCurrentUserBlocked || isReceiverBlocked}
//         >
//           Send
//         </button>
//       </div>
//             {addMode && <Detail reff={addUserRef} />}
//     </div>
//   );
// };

// export default Chat;

// import Detail from "../detail/Detail";
// import { useEffect, useRef, useState } from "react";
// import "./chat.css";
// import EmojiPicker from "emoji-picker-react";
// import { doc, getDoc, onSnapshot, arrayUnion, updateDoc } from "firebase/firestore";
// import { db } from "../firebase";
// import { useChatStore } from "../../lib/chatStore";
// import { useUserStore } from "../../lib/userStore";
// import upload from "../../lib/upload";

// const Chat = () => {
//   const [open, setOpen] = useState(true);
//   const [chat, setChat] = useState();
//   const [text, setText] = useState("");
//   const [addMode, setMode] = useState(false); // State to toggle Detail component

//   const addUserRef = useRef(null);  // Reference for AddUser component
//   const plusIconRef = useRef(null); // Reference for the plus icon

//   const [img, setImg] = useState({
//     file: null,
//     url: "",
//   });

//   const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
//   const { currentUser } = useUserStore();

//   const endRef = useRef(null);

//   // Scroll to the bottom when messages are updated
//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chat?.messages]);

//   // Fetch the chat data
//   useEffect(() => {
//     const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
//       setChat(res.data());
//     });
//     return () => unSub();
//   }, [chatId]);

//   const handleEmoji = (e) => {
//     setText((prev) => prev + e.emoji);
//     setOpen(false);
//   };

//   const handleImg = (e) => {
//     if (e.target.files[0]) {
//       setImg({
//         file: e.target.files[0],
//         url: URL.createObjectURL(e.target.files[0]),
//       });
//     }
//   };

//   const handleSend = async () => {
//     if (text === "" && !img.file) return;

//     let imgUrl = null;
//     try {
//       if (img.file) {
//         imgUrl = await upload(img.file);
//       }
//       await updateDoc(doc(db, "chats", chatId), {
//         messages: arrayUnion({
//           senderId: currentUser.id,
//           text,
//           createdAt: new Date(),
//           ...(imgUrl && { img: imgUrl }),
//         }),
//       });

//       const userIDs = [currentUser.id, user.id];
//       userIDs.forEach(async (id) => {
//         const userChatsRef = doc(db, "userchats", id);
//         const userChatsSnapshot = await getDoc(userChatsRef);

//         if (userChatsSnapshot.exists()) {
//           const userChatsData = userChatsSnapshot.data();
//           const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

//           userChatsData.chats[chatIndex].lastMessage = text;
//           userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
//           userChatsData.chats[chatIndex].updatedAt = Date.now();

//           await updateDoc(userChatsRef, {
//             chats: userChatsData.chats,
//           });
//         }
//       });
//     } catch (err) {
//       console.log(err);
//     }

//     setImg({
//       file: null,
//       url: "",
//     });

//     setText("");
//   };

//   // Hide the Detail component if clicked outside it
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Check if clicked outside AddUser component and the plus icon
//       if (
//         addUserRef.current &&
//         !addUserRef.current.contains(event.target) &&
//         plusIconRef.current &&
//         !plusIconRef.current.contains(event.target)
//       ) {
//         setMode(false); // Hide AddUser component
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="chat">
//       <div className="top">
//         <div className="user">
//           <img src={user?.avatar || "./avatar.png"} alt="" />
//           <div className="texts">
//             <span>{user?.username}</span>
//             <p>Lorem ipsum dolor.</p>
//           </div>
//         </div>
//         <div className="icons">
//           <img
//             src="./info.png"
//             alt="Info"
//             onClick={() => setMode((prev) => !prev)} // Toggle Detail component
//           />
//         </div>
//       </div>

//       <div className="centre">
//         {chat?.messages?.map((message) => (
//           <div className={message.senderId === currentUser.id ? "message own" : "message"} key={message?.createdAt}>
//             <div className="text">
//               {message.img && <img src={message.img} alt="sent" />}
//               <p>{message.text}</p>
//             </div>
//           </div>
//         ))}

//         {img.url && (
//           <div className="message own">
//             <div className="texts">
//               <img src={img.url} alt="" />
//             </div>
//           </div>
//         )}
//         <div ref={endRef}> </div>
//       </div>

//       <div className="bottom">
//         <div className="icons">
//           <label htmlFor="file">
//             <img src="./img.png" alt="" />
//           </label>
//           <input type="file" id="file" disabled={isCurrentUserBlocked || isReceiverBlocked} style={{ display: "none" }} onChange={handleImg} />
//           <img src="./camera.png" alt="" />
//           <img src="./mic.png" alt="" />
//         </div>
//         <input
//           type="text"
//           placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a Message!" : "Type a message..."}
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           disabled={isCurrentUserBlocked || isReceiverBlocked}
//         />
//         <div className="emoji">
//           <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
//           <div className="picker">
//             <EmojiPicker open={!open} onEmojiClick={handleEmoji} />
//           </div>
//         </div>
//         <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
//           Send
//         </button>
//       </div>

//       {addMode && <Detail reff={addUserRef} />}
//     </div>
//   );
// };

// export default Chat;
