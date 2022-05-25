import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LeftColumn.css";
import { Avatar, useMediaQuery } from "@material-ui/core";
import axios from "axios";
import { useStateValue } from "../../StateProvider";
import {
  InputNumber,
  Select,
  Button,
  Upload,
  notification,
  Input,
  Form,
} from "antd";
import {
  MinusCircleOutlined,
  EyeOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import ReactPlayer from "react-player";
import {
  checkMessaging,
  createMessaging,
  editProfile,
  getProfile,
  storage,
  auth,
} from "../../Login/firebase";
import { convertLegacyProps } from "antd/lib/button/button";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";

const { Option } = Select;
const { TextArea } = Input;

function EditLeftColumn(props) {
  const [{ user }, dispatch] = useStateValue();
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState();
  const [canPlayOne, setCanPlayOne] = useState();
  const [media, setMedia] = useState([]);
  const [form] = Form.useForm();
  const blankMultiple = [""];
  let isSmallScreen = useMediaQuery("(max-width: 599px)");

  useEffect(() => {
    getProfile(user.uid).then((res) => {
      if (res != "not found") {
        setMedia(res.user_media);
        setImage(res.user_image);
        setUsername(res.username);
        form.setFieldsValue(res);
      } else {
        form.setFieldsValue({
          username: "",
          user_instruments: [""],
          yearsPlayed: "",
          user_city: "",
          user_state: "",
          user_bio: "",
          user_image: "",
          user_grade: "",
          user_school: "",
          user_bullets: [""],
          user_media: [""],
          _geoloc: {},
        });
        if (user.photoURL) {
          setImage(user.photoURL);
        }
      }
    });
  }, []);

  useEffect(() => {
    var canPlay = false;
    media.map((media) => {
      if (ReactPlayer.canPlay(media)) {
        canPlay = true;
      }
    });
    setCanPlayOne(canPlay);
  }, [media]);

  const handleImageUpload = (data) => {
    const uploadTask = storage.ref(`images/${data.file.name}`).put(data.file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {},
      () => {
        storage
          .ref("images")
          .child(data.file.name)
          .getDownloadURL()
          .then((url) => {
            setImage(url);
            form.setFieldsValue({
              user_image: url,
            });
          });
      }
    );
  };

  const onSuccess = () => {
    notification.success({
      message: `Profile Saved Successfully`,
      placement: "bottomLeft",
    });
  };

  const onFailure = () => {
    notification.error({
      message: `Profile Failed to Save`,
      placement: "bottomLeft",
    });
  };

  const onFinish = (value) => {
    axios
      .get("https://maps.googleapis.com/maps/api/geocode/json?", {
        params: {
          address: value.user_city + ", " + value.user_state,
          // get environmental variables
          key: process.env.REACT_APP_GOOGLE_API_KEY,
        },
      })
      .then((res) => {
        const newState = { ...value };
        newState["_geoloc"] = res.data.results[0].geometry.location;
        if (!newState.username) {
          newState.username = username;
        }
        if (newState.user_image === "" && user.photoURL) {
          newState.user_image = user.photoURL;
        }
        newState.username = newState.username.trim();
        newState.user_city = newState.user_city.trim();
        newState.user_state = newState.user_state.trim();
        newState.user_bio = newState.user_bio.trim();
        newState.user_school = newState.user_school.trim();
        newState.user_bullets = newState.user_bullets.map((bullet) => {
          return bullet.trim();
        });
        newState.user_media = newState.user_media.map((media) => {
          return media.trim();
        });

        editProfile(user.uid, newState);
        onSuccess();
      })
      .catch((error) => {
        onFailure();
      });

    var usernameTaken = false;
    if (props.newUser) {
      createMessaging(user.uid, value.username.trim(), user.email)
        .then((res) => {
          if (res === "username taken") {
            usernameTaken = true;
          }
        })
        .then(() => {
          if (props.newUser && !usernameTaken) {
            props.setNewUser(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <div className="leftColumn">
      {props.newUser && (
        <h1 className="profilePrompt">Create Your Profile Below</h1>
      )}
      <Form form={form} onFinish={onFinish}>
        <div className="main__card">
          <div className="main__cardLeft">
            <div className="main__cardLeftInner">
              <Form.Item name="user_image">
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  customRequest={handleImageUpload}
                >
                  {image ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        style={{ height: "70px", width: "70px" }}
                        src={image}
                      />
                      <span style={{ fontSize: "smaller", marginTop: "2px" }}>
                        Click to change
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
                {props.newUser ? (
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                      {
                        required: true,
                        message: "Please input a username",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          return checkMessaging(value).then((res) => {
                            if (res === "username taken") {
                              return Promise.reject(
                                new Error("Username taken")
                              );
                            } else {
                              return Promise.resolve();
                            }
                          });
                        },
                      }),
                    ]}
                  >
                    <Input placeholder="Username" />
                  </Form.Item>
                ) : (
                  <div className="main_cardCenteredButton">
                    <h2>{username}</h2>
                    <Link
                      to={"/profile/" + user.uid}
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        type="primary"
                        shape="round"
                        icon={<EyeOutlined />}
                        size="large"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                )}
              </Form.Item>
            </div>
          </div>
          <div className="main__cardRight">
            <h4 className="required">Instruments Played</h4>
            <Form.List name="user_instruments">
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map((field, index) => (
                      <div style={{ display: "flex", flex: 1 }}>
                        <Form.Item
                          {...field}
                          style={{ width: "190%" }}
                          rules={[
                            {
                              required: true,
                              message: "Please input your instrument",
                            },
                          ]}
                        >
                          <Select
                            onFocus={() =>
                              isSmallScreen && disableBodyScroll(document.body)
                            }
                            defaultValue=""
                          >
                            <Option value="" selected>
                              None
                            </Option>
                            <Option value="Piano">Piano</Option>
                            <Option value="Tenor Sax">Tenor Sax</Option>
                            <Option value="Alto Sax">Alto Sax</Option>
                            <Option value="Trumpet">Trumpet</Option>
                            <Option value="Violin">Violin</Option>
                            <Option value="Guitar">Guitar</Option>
                            <Option value="Percussion">Percussion</Option>
                            <Option value="Flute">Flute</Option>
                            <Option value="Drums">Drums</Option>
                            <Option value="Bass">Bass</Option>
                            <Option value="Trombone">Trombone</Option>
                            <Option value="Clarinet">Clarinet</Option>
                            <Option value="Voice">Voice</Option>
                          </Select>
                        </Form.Item>
                        {fields.length > 1 ? (
                          <Button onClick={() => remove(field.name)}>
                            <MinusCircleOutlined />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()}>
                      Add Instrument
                    </Button>
                  </div>
                );
              }}
            </Form.List>

            <div
              style={{
                paddingTop: "10px",
                display: "flex",
              }}
            >
              <div className="inner__item">
                <span className="required">City</span>
                <Form.Item
                  name="user_city"
                  rules={[
                    {
                      required: true,
                      message: "Please input your city",
                    },
                  ]}
                >
                  <Input style={{ width: 140 }} placeholder="City" />
                </Form.Item>
              </div>
              <div className="inner__item" style={{ marginLeft: "10px" }}>
                <span className="required">State</span>
                <Form.Item
                  name="user_state"
                  rules={[
                    {
                      required: true,
                      message: "Please input your state",
                    },
                  ]}
                >
                  <Select
                    onFocus={() =>
                      isSmallScreen && disableBodyScroll(document.body)
                    }
                    defaultValue=""
                    style={{ width: 140 }}
                  >
                    <Option value="">Choose One</Option>
                    <Option value="AL">Alabama</Option>
                    <Option value="AK">Alaska</Option>
                    <Option value="AZ">Arizona</Option>
                    <Option value="AR">Arkansas</Option>
                    <Option value="CA">California</Option>
                    <Option value="CO">Colorado</Option>
                    <Option value="CT">Connecticut</Option>
                    <Option value="DE">Delaware</Option>
                    <Option value="DC">District of Columbia</Option>
                    <Option value="FL">Florida</Option>
                    <Option value="GA">Georgia</Option>
                    <Option value="HI">Hawaii</Option>
                    <Option value="ID">Idaho</Option>
                    <Option value="IL">Illinois</Option>
                    <Option value="IN">Indiana</Option>
                    <Option value="IA">Iowa</Option>
                    <Option value="KS">Kansas</Option>
                    <Option value="KY">Kentucky</Option>
                    <Option value="LA">Louisiana</Option>
                    <Option value="ME">Maine</Option>
                    <Option value="MD">Maryland</Option>
                    <Option value="MA">Massachusetts</Option>
                    <Option value="MI">Michigan</Option>
                    <Option value="MN">Minnesota</Option>
                    <Option value="MS">Mississippi</Option>
                    <Option value="MO">Missouri</Option>
                    <Option value="MT">Montana</Option>
                    <Option value="NE">Nebraska</Option>
                    <Option value="NV">Nevada</Option>
                    <Option value="NH">New Hampshire</Option>
                    <Option value="NJ">New Jersey</Option>
                    <Option value="NM">New Mexico</Option>
                    <Option value="NY">New York</Option>
                    <Option value="NC">North Carolina</Option>
                    <Option value="ND">North Dakota</Option>
                    <Option value="OH">Ohio</Option>
                    <Option value="OK">Oklahoma</Option>
                    <Option value="OR">Oregon</Option>
                    <Option value="PA">Pennsylvania</Option>
                    <Option value="RI">Rhode Island</Option>
                    <Option value="SC">South Carolina</Option>
                    <Option value="SD">South Dakota</Option>
                    <Option value="TN">Tennessee</Option>
                    <Option value="TX">Texas</Option>
                    <Option value="UT">Utah</Option>
                    <Option value="VT">Vermont</Option>
                    <Option value="VA">Virginia</Option>
                    <Option value="WA">Washington</Option>
                    <Option value="WV">West Virginia</Option>
                    <Option value="WI">Wisconsin</Option>
                    <Option value="WY">Wyoming</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div
              style={{
                display: "flex",
              }}
            >
              <div className="inner__item">
                <span className="required">School/College</span>
                <Form.Item
                  name="user_school"
                  rules={[
                    {
                      required: true,
                      message: "Please input your school",
                    },
                  ]}
                >
                  <Input style={{ width: 140 }} placeholder="School" />
                </Form.Item>
              </div>
              <div
                className="inner__item"
                style={{
                  marginLeft: "10px",
                }}
              >
                <span className="required">Grade/Role</span>
                <Form.Item
                  name="user_grade"
                  rules={[
                    {
                      required: true,
                      message: "Please input your school grade",
                    },
                  ]}
                >
                  <Select style={{ width: 140 }}>
                    <Option value="">Choose One</Option>
                    <Option value="Senior">Senior</Option>
                    <Option value="Junior">Junior</Option>
                    <Option value="Sophomore">Sophomore</Option>
                    <Option value="Freshman">Freshman</Option>
                    <Option value="8th Grade">8th Grade</Option>
                    <Option value="7th Grade">7th Grade</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
            <Form.Item
              name="yearsPlayed"
              label="Years Playing Jazz"
              rules={[
                {
                  required: true,
                  message: "Please input how many years you have played jazz",
                },
              ]}
            >
              <InputNumber min={0} max={22} placeholder="Years" />
            </Form.Item>
          </div>
        </div>
        <div className="main__body">
          <h3 className="notrequired" style={{ marginTop: "0%" }}>
            Bio
          </h3>
          <Form.Item
            name="user_bio"
            rules={[
              {
                required: false,
                message: "Please input your bio",
              },
            ]}
          >
            <TextArea
              style={{ height: "150px" }}
              placeholder="Enter some information about yourself"
            ></TextArea>
          </Form.Item>
          <h3 className="notrequired">Experience</h3>
          <Form.List name="user_bullets">
            {(fields, { add, remove }) => {
              return (
                <div>
                  <ul style={{ marginBottom: "0" }}>
                    {fields.map((field, index) => (
                      <li>
                        <div style={{ display: "flex", flex: 1 }}>
                          <Form.Item
                            {...field}
                            style={{ width: "90%" }}
                            rules={[
                              {
                                required: false,
                                message: "Please input some experience bullets",
                              },
                            ]}
                          >
                            <Input placeholder="Enter info here" />
                          </Form.Item>
                          {fields.length > 1 ? (
                            <Button onClick={() => remove(field.name)}>
                              <MinusCircleOutlined />
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    style={{ width: "20%" }}
                  >
                    Add
                  </Button>
                </div>
              );
            }}
          </Form.List>
          <h3 style={{ marginTop: "5%" }}>Media Uploads</h3>
          <Form.List name="user_media">
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields.map((field, index) => (
                    <div style={{ display: "flex", flex: 1 }}>
                      <Form.Item {...field} style={{ width: "90%" }}>
                        <Input
                          onChange={() => {
                            setMedia(form.getFieldValue("user_media"));
                          }}
                          placeholder="Enter media url here E.g. Youtube or Soundcloud"
                        />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <Button onClick={() => remove(field.name)}>
                          <MinusCircleOutlined />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    style={{ width: "20%" }}
                  >
                    Add
                  </Button>
                </div>
              );
            }}
          </Form.List>
          <div className="main__videoContainer">
            {canPlayOne && (
              <div
                style={{ marginBottom: "1vh" }}
                className="main__bodyUploads"
              >
                {media.map((media) => {
                  if (ReactPlayer.canPlay(media)) {
                    return (
                      <ReactPlayer
                        style={{ marginBottom: 0, marginRight: "1.5vw" }}
                        url={media}
                        width="240px"
                        height="135px"
                      />
                    );
                  }
                })}
              </div>
            )}
          </div>
          {props.newUser ? (
            <div>
              <Button
                onClick={() => {
                  auth.signOut().then(() => {
                    window.location.reload();
                  });
                }}
              >
                <LeftOutlined /> Go Back
              </Button>
              <Button htmlType="submit">Create Profile</Button>
            </div>
          ) : (
            <Button htmlType="submit">Save Changes</Button>
          )}
        </div>
      </Form>
    </div>
  );
}

export default EditLeftColumn;
