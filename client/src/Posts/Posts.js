import { MessageOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Form, Input, Tag } from "antd";
import Footer from "../Footer/Footer";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createPost,
  deletePost,
  getPosts,
  getProfile,
} from "../Login/firebase";
import Messaging from "../Messaging/Messaging";
import RightColumn from "../Profile/RightColumn/RightColumn";
import { useStateValue } from "../StateProvider";
import "./Posts.css";
import TagElem from "./Tags";

function Posts() {
  const [{ user }, dispatch] = useStateValue();
  const [state, setState] = useState({
    tags: [],
    posts: [],
    inputVisible: false,
    inputValue: "",
    editInputIndex: -1,
    editInputValue: "",
    image: "",
    username: "",
  });
  const useStyles = makeStyles({
    gridContainer: {
      paddingLeft: "5vw",
      paddingRight: "5vw",
      paddingTop: "25px",
      paddingBottom: "5vh",
    },
  });
  const classes = useStyles();
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState("");
  const [messagingVisible, setMessagingVisible] = useState(false);
  const [form] = Form.useForm();
  const { TextArea } = Input;

  const toggleMessaging = () => {
    setMessagingVisible(!messagingVisible);
  };

  useEffect(() => {
    getProfile(user.uid).then((res) => {
      var newState = { ...state };
      newState.image = res.user_image;
      newState.username = res.username;
      setState(newState);
    });

    getPosts().then((res) => {
      setPosts(res);
    });
  }, [user]);

  useEffect(() => {}, [state]);

  const onFinish = (val) => {
    const postData = {
      tags: state.tags,
      message: val.post,
      uid: user.uid,
      username: state.username,
    };
    createPost(postData);
    var newState = { ...state };
    newState.tags = [];
    setState(newState);
    form.resetFields();
    getPosts().then((res) => {
      setPosts(res);
    });
  };

  return (
    <div className="postsWrapper">
      <div className="page__wrapper">
        <h2
          style={{
            textAlign: "center",
            lineHeight: 0.5,
            marginTop: "30px",
            marginBottom: 0,
            fontSize: "1.6rem",
          }}
        >
          Find Gigs Near You
        </h2>
        <Grid
          container
          justify="center"
          spacing={2}
          className={classes.gridContainer}
        >
          <Grid item xl={5} lg={6} md={7} sm={9} xs={12}>
            <div className="posts__header">
              <h2>Create A Post</h2>
              <p>
                Post about your upcoming performances or if you need a certain
                instrument for a gig.
              </p>
            </div>
            <div className="posts">
              <div className="post__card">
                <Form form={form} onFinish={onFinish}>
                  <Form.Item
                    name="post"
                    rules={[
                      {
                        required: true,
                        message: "Please write something",
                      },
                    ]}
                  >
                    <div className="post__inner">
                      <Avatar
                        className="post__avatar"
                        src={state.image}
                      ></Avatar>
                      <TextArea placeholder="Type a message to post" />
                    </div>
                  </Form.Item>
                  <p style={{ fontWeight: "450" }}>
                    Tag what instrument you are looking for or a specific genre
                    of music:
                  </p>
                  <TagElem setState={setState} state={state} />
                  <Button
                    type="secondary"
                    htmlType="submit"
                    className="post__submit"
                  >
                    Post
                  </Button>
                </Form>
              </div>
            </div>
            {posts.length > 0 && (
              <div className="posts__header">
                <h2>Recent Posts</h2>
                <p>Read about local gigging opportunities.</p>
              </div>
            )}
            <div className="posts">
              {posts.map((post) => (
                <div className="post__card">
                  <div className="user">
                    <Avatar
                      style={{ marginRight: "10px" }}
                      src={post.image}
                    ></Avatar>
                    <h2>{post.username}</h2>
                  </div>
                  <h4>Post Content</h4>
                  <div className="post__content">
                    <span>{post.message}</span>
                  </div>
                  <div className="tags">
                    {post.tags && (
                      <div className="tags__inner">
                        <span>Tags: </span>
                        {post.tags.map((tag) => (
                          <Tag>{tag}</Tag>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="buttons">
                    {post.uid !== user.uid ? (
                      <div>
                        <Link to={"profile/" + post.uid}>
                          <Button icon={<UserOutlined />} type="secondary">
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          icon={<MessageOutlined />}
                          onClick={() => {
                            setUserId(post.uid);
                            setMessagingVisible(true);
                          }}
                        >
                          Message
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          deletePost(post.key).then(() => {
                            getPosts().then((res) => {
                              setPosts(res);
                            });
                          });
                        }}
                      >
                        Delete Post
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Grid>
          {messagingVisible && (
            <Messaging userId={userId} toggleMessaging={toggleMessaging} />
          )}
          <Grid item style={{ minWidth: "300px" }} lg={2} md={4} sm={3} xs={0}>
            <RightColumn />
          </Grid>
        </Grid>
      </div>
      {posts.length !== 0 && <Footer />}
    </div>
  );
}

export default Posts;
