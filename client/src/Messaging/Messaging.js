import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useStateValue } from "../StateProvider";
import { ChatEngineWrapper, Socket, ChatFeed } from "react-chat-engine";
import { CircularProgress } from "@material-ui/core";
import { Button } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import { Container } from "react-grid-system";
import { setConfiguration } from "react-grid-system";
import "./Messaging.css";
import { getMessagingUser, putMessaging } from "../Login/firebase";
import { Capacitor } from "@capacitor/core";
import { useMediaQuery } from "@material-ui/core";
import reactScroll from "react-scroll";

setConfiguration({ maxScreenClass: "xl", gutterWidth: 0 });

const Messaging = (props) => {
  const [{ user }, dispatch] = useStateValue();
  const [credsLoaded, setCredsLoaded] = useState(false);
  let isSmallScreen = useMediaQuery("(max-width: 599px)");

  var { userId } = useParams();

  if (props.userId) {
    userId = props.userId;
  }

  const [state, setState] = useState({
    userName: "",
    password: "",
    chatId: 0,
  });

  useEffect(() => {
    setCredsLoaded(false);
    putMessaging(user.uid, userId).then((res) => {
      console.log("bu", res);
    });

    Promise.all([getMessagingUser(user.uid), putMessaging(user.uid, userId)])
      .then((res) => {
        console.log("hu");
        setState({
          userName: res[0].userName,
          password: res[0].password,
          chatId: res[1],
        });
        setCredsLoaded(true);
      })
      .then(() => {
        const scroll = setInterval(() => {
          reactScroll.animateScroll.scrollToBottom({
            duration: 0,
            containerId: "ce-feed-container",
          });
        }, 100);
        setTimeout(() => {
          clearInterval(scroll);
        }, 5000);
      })
      .catch((err) => {
        console.log("bruh");
      });
  }, [userId]);

  return (
    <div className="Messaging">
      <div className="messaging">
        <div className="messaging__Button">
          <CloseCircleFilled
            style={{ fontSize: "20px", paddingTop: "5px" }}
            onClick={props.toggleMessaging}
          />
        </div>
        <Container
          style={
            isSmallScreen
              ? {
                  height:
                    "calc(100vh - 100.5px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
                  backgroundColor: "white",
                  padding: 0,
                }
              : { height: "400px", backgroundColor: "white" }
          }
        >
          {credsLoaded ? (
            <ChatEngineWrapper>
              <Socket
                projectID="13f31b84-7f8f-41f9-b67d-afe362598517"
                userName={state.userName}
                userSecret={state.password}
              />
              <ChatFeed activeChat={state.chatId} />
            </ChatEngineWrapper>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                textAlign: "center",
                height: "100%",
              }}
            >
              <CircularProgress
                style={{ color: "rgb(24, 144, 255)", paddingBottom: "5%" }}
              />
              <p>Loading...</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Messaging;
