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
import { Capacitor } from "@capacitor/core";
import { cfaSignIn, cfaSignInApple } from "capacitor-firebase-auth";

function Signup(props) {
  const { setAuthType } = props;
  const [{}, dispatch] = useStateValue();
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState();

  const googleSignIn = () => {
    if (Capacitor.isNativePlatform()) {
      cfaSignIn("google.com").subscribe((user) =>
        dispatch({
          type: actionTypes.SET_USER,
          user: user,
        })
      );
    } else {
      auth
        .signInWithPopup(provider)
        .then((result) => {
          dispatch({
            type: actionTypes.SET_USER,
            user: result.user,
          });
        })
        .catch((error) => setErrorMessage(error.message));
    }
  };

  const appleSignIn = () => {
    cfaSignInApple().subscribe((user) =>
      dispatch({
        type: actionTypes.SET_USER,
        user: user,
      })
    );
  };

  const signUp = (email, password) => {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        dispatch({
          type: actionTypes.SET_USER,
          user: result.user,
        });
      })
      .catch((error) => setErrorMessage(error.message));
  };

  const onFinish = (value) => {
    signUp(value.email, value.password);
  };

  return (
    <div className="signIn">
      <h2>Welcome to JazzJam</h2>
      {errorMessage && <Alert message={errorMessage} type="error" />}
      {Capacitor.isNativePlatform() && (
        <img
          onClick={appleSignIn}
          style={{
            width: "260px",
            marginTop: "10px",
            cursor: "pointer",
          }}
          src={require("../Images/AppleSignIn.png")}
        />
      )}
      <Button
        type="secondary"
        style={{
          width: "260px",
          height: "45px",
          marginTop: "0px!important",
          borderRadius: "5px",
          color: "black",
          marginTop: "10px",
          backgroundColor: "white",
          border: "rgba(66, 133, 244, 0.8) solid 3px",
        }}
        size="large"
        onClick={googleSignIn}
      >
        <img
          style={{
            width: "20px",
            marginRight: "10px",
            marginBottom: "3px",
          }}
          src={require("../Images/google.png")}
          alt="google"
        />
        Sign In with Google
      </Button>
      <div style={{ width: "110%", paddingTop: "25px", paddingBottom: "5px" }}>
        <h4 className="wordLines">or</h4>
      </div>

      <Form name="basic" style={{ width: "260px" }} onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input
            style={{ height: "40px" }}
            placeholder="Create account with Email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            style={{ height: "40px" }}
            placeholder="Enter a password"
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        style={{ width: "260px", marginTop: "20px" }}
        size="large"
        onClick={() => setAuthType("login")}
      >
        Already have an account?
      </Button>
    </div>
  );
}

export default Signup;
