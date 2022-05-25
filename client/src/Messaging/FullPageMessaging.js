import React, { useEffect, useState } from "react";
import { ChatEngine, getOrCreateChat } from "react-chat-engine";
import { Container } from "react-grid-system";
import { useStateValue } from "../StateProvider";
import "./Messaging.css";
import axios from "axios";
import { Button, AutoComplete } from "antd";
import { getMessagingUser, getUsernames } from "../Login/firebase";
import { Keyboard } from "@capacitor/keyboard";
import reactScroll from "react-scroll";

function App() {
  const [{ user }, dispatch] = useStateValue();
  const baseHeight =
    "calc(100vh - 62px - env(safe-area-inset-top) - env(safe-area-inset-bottom))";
  const [state, setState] = useState({
    userName: "",
    password: "",
    height: baseHeight,
  });
  const [usernames, setUsernames] = useState();
  const [username, setUsername] = useState("");
  const [credsLoaded, setCredsLoaded] = useState(false);

  Keyboard.addListener("keyboardDidShow", (info) => {
    reactScroll.animateScroll.scrollToBottom({
      duration: 333,
      containerId: "ce-feed-container",
    });
  });

  Keyboard.addListener("keyboardDidHide", () => {
    reactScroll.animateScroll.scrollToBottom({
      duration: 333,
      containerId: "ce-feed-container",
    });
  });

  function createDirectChat(creds) {
    getOrCreateChat(
      creds,
      { is_direct_chat: true, usernames: [username] },
      () => setUsername("")
    );
  }

  useEffect(() => {
    Promise.all([getMessagingUser(user.uid), getUsernames()])
      .then((res) => {
        const newState = { ...state };
        newState.userName = res[0].userName;
        newState.password = res[0].password;
        setState(newState);
        setUsernames(res[1]);
        setCredsLoaded(true);
      })
      .catch((e) => {
        console.error("error", e);
      });
  }, []);

  function renderChatForm(creds) {
    return (
      <div
        className="chatform"
        style={{
          display: "flex",
          flexDirection: "column",
          paddingBottom: "1rem",
        }}
      >
        <h2
          style={{
            paddingLeft: "10px",
            paddingTop: "10px",
          }}
        >
          My Chats
        </h2>
        {credsLoaded ? (
          <div
            style={{
              display: "flex",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <AutoComplete
              options={usernames}
              placeholder="Username"
              style={{ width: "100%" }}
              value={username}
              onChange={(value) => {
                setUsername(value);
              }}
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                -1
              }
            />
            <Button onClick={() => createDirectChat(creds)}>Create Chat</Button>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div style={{ overflow: "hidden" }} className="messaging__full">
      {credsLoaded && (
        <ChatEngine
          projectID="13f31b84-7f8f-41f9-b67d-afe362598517"
          userName={state.userName}
          userSecret={state.password}
          height={state.height}
          renderNewChatForm={(creds) => renderChatForm(creds)}
        />
      )}
    </div>
  );
}

export default App;
