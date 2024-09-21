import React from "react";
import "./chatSection.css";

const ChatSection = ({ handleBack }) => {
  return (
    <div className="chatSection">
      <div className="backButton" onClick={handleBack}>
        <img src="./back.png" alt="Back" />
        <span>Back</span>
      </div>
      {/* Add your chat messages and UI here */}
      <div className="messages">
        {/* Chat messages */}
      </div>
      <div className="chatInput">
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    </div>
  );
};

export default ChatSection;
