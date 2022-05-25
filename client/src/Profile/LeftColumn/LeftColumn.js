import React, { useEffect } from "react";
import "./LeftColumn.css";
import { Avatar } from "@material-ui/core";
import { Button, Card } from "antd";
import axios from "axios";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import { MessageOutlined, EditOutlined } from "@ant-design/icons";
import { useStateValue } from "../../StateProvider";
import { Link } from "react-router-dom";
import { getProfile } from "../../Login/firebase";
import { getUserSchool, getYearsPlayed } from "../../Functions/Functions";
import { Icons } from "../../Icons/Access";
const { Meta } = Card;

function LeftColumn(props) {
  let { userId } = useParams();
  const [{ user }, dispatch] = useStateValue();
  const blankMultiple = [""];
  const [state, setState] = React.useState({
    username: "",
    user_instruments: blankMultiple,
    user_goals: "",
    user_city: "",
    user_state: "",
    user_bio: "",
    user_image: "",
    user_bullets: blankMultiple,
    user_media: blankMultiple,
  });

  useEffect(() => {
    getProfile(userId)
      .then((res) => {
        if (res != "not found") {
          setState(res);
        }
      })
      .catch((err) => {});
  }, [userId]);

  useEffect(() => {
    console.log(state);
    console.log(
      state.user_bio !== "" ||
        JSON.stringify(state.user_bullets) !== JSON.stringify(blankMultiple) ||
        JSON.stringify(state.user_media) !== JSON.stringify(blankMultiple)
    );
  }, [state]);

  return (
    <div className="leftColumn">
      <div className="main__card">
        <div className="main__cardLeft">
          <Avatar src={state.user_image} />
          <h2>{state.username}</h2>
          {userId !== user.uid ? (
            <Button
              onClick={props.toggleMessaging}
              type="primary"
              shape="round"
              icon={<MessageOutlined />}
              size="large"
            >
              Message
            </Button>
          ) : (
            <Link to="/myprofile" style={{ textDecoration: "none" }}>
              <Button
                type="primary"
                shape="round"
                icon={<EditOutlined />}
                size="large"
              >
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
        <div className="main__cardRight">
          <h3>Instruments Played</h3>
          <div className="bullets">
            {state.user_instruments.map((instrument) => (
              <div className="icons__div">
                <img className="icons" src={Icons[instrument]}></img>
                <span className="instrument__label">{instrument}</span>
              </div>
            ))}
          </div>
          <Meta
            title="Years Playing Jazz"
            style={{ marginTop: "10px" }}
            description={getYearsPlayed(state)}
          />
          <Meta
            title="School"
            style={{ marginTop: "10px" }}
            description={getUserSchool(state)}
          />
          <Meta
            title="Lives In"
            style={{ marginTop: "10px" }}
            description={state.user_city + ", " + state.user_state}
          />
        </div>
      </div>
      {(state.user_bio !== "" ||
        JSON.stringify(state.user_bullets) !== JSON.stringify(blankMultiple) ||
        JSON.stringify(state.user_media) !== JSON.stringify(blankMultiple)) && (
        <div className="main__body">
          {state.user_bio !== "" && (
            <div className="user_bioDiv">
              <h3 style={{ marginTop: "0%" }}>Bio</h3>
              <p>{state.user_bio}</p>
            </div>
          )}
          {JSON.stringify(state.user_bullets) !==
            JSON.stringify(blankMultiple) && (
            <div className="user_bulletsDiv">
              <h3>Experience</h3>
              <ul>
                {state.user_bullets.map((bullet) => (
                  <li>
                    <p>{bullet}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {JSON.stringify(state.user_media) !==
            JSON.stringify(blankMultiple) && (
            <div className="user__mediaDiv">
              <h2 style={{ textAlign: "center" }}>Media Gallery</h2>
              <div className="main__videoContainerView">
                <div className="main__bodyUploads">
                  {state.user_media.map((media) => {
                    if (media !== "") {
                      return (
                        <div className="player__container">
                          <ReactPlayer
                            url={media}
                            width="240px"
                            height="135px"
                          />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LeftColumn;
