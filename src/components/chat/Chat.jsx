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
  const [inputDisabled, setInputDisabled] = useState(false); // New state to disable input
  const addUserRef = useRef(null);
  const plusIconRef = useRef(null);
  const [img, setImg] = useState({ file: null, url: "" });

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

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };



  const handleSend = async () => {
    if (text === "" && !img.file) return;
  
    let imgUrl = null;
    try {
      // Upload image if exists
      if (img.file) {
        imgUrl = await upload(img.file);
      }
       const messageData = {
        senderId: currentUser.id,
        text: text || "",
        createdAt: new Date(),
        ...(imgUrl && { img: imgUrl }),
      };
    // }
      // Update chat document
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(messageData),
      });
  
      // Update user chats
      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
  
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
  
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text || "Image";
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
  
            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
  
      // Reset state after successful send
      setImg({ file: null, url: "" });
      setText("");
      setInputDisabled(false); // Re-enable input after image is sent
    } catch (err) {
      console.error("Error sending message:", err);
      setInputDisabled(false); // Ensure input is re-enabled on error
    }
  };
  
  const handleImg = async (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
      setInputDisabled(true); 
    }
  };
  
  const handleBack = () => {
    setBack(true);
    useChatStore.setState({ chatId: null });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addUserRef.current &&
        !addUserRef.current.contains(event.target) &&
        plusIconRef.current &&
        !plusIconRef.current.contains(event.target)
      ) {
        setMode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const buttons = {
    backgroundColor: "black",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img
            style={{ height: "30px", width: "25px", cursor: "pointer" }}
            src={"https://cdn-icons-png.flaticon.com/256/9312/9312240.png"}
            onClick={handleBack}
          />
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor.</p>
          </div>
        </div>
        <div className="icons">
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
            {message.text != '' && <p>{message.text}</p>}
          </div>
        </div>
      ))}

        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="Preview" />
            </div>
          </div>
        )}
        <div ref={endRef}> </div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img
              style={{
                backgroundColor: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              src="./img.png"
              alt=""
            />
          </label>
          <input
            type="file"
            id="file"
            disabled={isCurrentUserBlocked || isReceiverBlocked}
            style={{ display: "none" }}
            onChange={handleImg}
          />

      {/* {img && (
        <div>
          <img src={URL.createObjectURL(img)} alt="Selected Image" />
          <button disabled={isSending} onClick={handleSend}>
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      )} */}

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
          disabled={inputDisabled || isCurrentUserBlocked || isReceiverBlocked} // Disable if inputDisabled is true
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









