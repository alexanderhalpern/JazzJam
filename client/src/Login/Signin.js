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

function Signin(props) {
  const { setAuthType } = props;
  const [{}, dispatch] = useStateValue();
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState();
  const signIn = (email, password) => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        dispatch({
          type: actionTypes.SET_USER,
          user: result.user,
        });
      })
      .catch((error) => setErrorMessage(error.message));
  };

  const onFinish = (value) => {
    signIn(value.email, value.password);
  };

  return (
    <div className="signIn">
      <h2>Sign In Below</h2>
      {errorMessage && <Alert message={errorMessage} type="error" />}
      <Form name="basic" style={{ width: "260px" }} onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input style={{ height: "40px" }} placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            style={{ height: "40px" }}
            placeholder="Enter your password"
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
        onClick={() => setAuthType("signup")}
      >
        Don't have an account?
      </Button>
    </div>
  );
}

export default Signin;
