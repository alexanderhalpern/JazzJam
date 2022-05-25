import React, { useEffect, useState } from "react";
import "./Auth.css";
import { auth, provider, firebaseApp } from "./firebase";
import GoogleButton from "react-google-button";
import Lottie from "react-lottie";
import { useStateValue } from "../StateProvider";
import { actionTypes } from "../reducer";
import axios from "axios";
import animationData from "../Images/lottie.json";
import { Select, Alert, Button, Upload, List, Input, Form } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import Signin from "./Signin";
import Signup from "./Signup";
import { Grid } from "@material-ui/core";
import { Container, Nav, Navbar } from "react-bootstrap";
import "../Header/boot.css";

function Login() {
  const [loginStyle, setLoginStyle] = useState({ display: "none" });
  const [{}, dispatch] = useStateValue();
  const [authType, setAuthType] = useState("signup");
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const authListener = () => {
    auth.onAuthStateChanged((user) => {
      dispatch({
        type: actionTypes.SET_USER,
        user: user,
      });
      setLoginStyle({});
    });
  };

  useEffect(() => {
    authListener();
  }, []);

  return (
    <div style={loginStyle} className="main__Auth">
      <Navbar
        fixed="top"
        style={{
          paddingTop: "env(safe-area-inset-top)",
        }}
        bg="white"
        variant="dark"
        expand="lg"
      >
        <Container>
          <Navbar.Brand>
            <img src={require("../logoBlack.svg")} width="120" />
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Grid
        container
        spacing={0}
        alignItems="top"
        justify="center"
        style={{
          minHeight:
            "calc(100vh - 62px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
          marginTop: "calc(env(safe-area-inset-top) + 62px)",
        }}
      >
        <Grid item lg={5} md={4} sm={5} xs={12} className="login__box">
          <h1 className="titleText">
            Join JazzJam for FREE and begin connecting with other Jazz Musicians
            today!
          </h1>
          {authType === "signup" ? (
            <Signup setAuthType={setAuthType} />
          ) : (
            <Signin setAuthType={setAuthType} />
          )}
          <div className="about">
            <h2>About JazzJam</h2>
            <div className="aboutText">
              <p>
                JazzJam enables high school and college jazz musicians to find
                each other, connect, and play music.
              </p>
            </div>
            {/* create a bullet list */}
            <div className="bulletList">
              <ul>
                <li>
                  <p>Quickly and easily create your profile</p>
                </li>
                <li>
                  <p>
                    Upload videos of your playing or post about upcoming
                    performances
                  </p>
                </li>
                <li>
                  <p>Connect with other musicians!</p>
                </li>
              </ul>
            </div>
          </div>
        </Grid>
        <Grid item lg={7} md={8} sm={7} xs={0} className="login__lottie">
          <Lottie
            options={defaultOptions}
            width="50vw"
            height="50vw"
            isClickToPauseDisabled
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default Login;
