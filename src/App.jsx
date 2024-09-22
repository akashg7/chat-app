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

  if (isLoading) return <div className="loader"></div>;

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
