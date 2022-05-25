import React, { useState, useEffect } from "react";
import "./Profile.css";
import LeftColumn from "./LeftColumn/LeftColumn";
import RightColumn from "./RightColumn/RightColumn";
import { Grid, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Messaging from "../Messaging/Messaging";
import { useParams } from "react-router-dom";
import { useStateValue } from "../StateProvider";
import Footer from "../Footer/Footer";

const useStyles = makeStyles({
  gridContainer: {
    paddingLeft: "5vw",
    paddingRight: "5vw",
    paddingTop: "50px",
    paddingBottom: "5vh",
  },
});
function Profile() {
  const classes = useStyles();
  let { userId } = useParams();
  const [{ user }, dispatch] = useStateValue();
  const toggleMessaging = () => setMessagingVisible(!messagingVisible);
  let isSmallScreen = useMediaQuery("(max-width: 599px)", { noSsr: true });
  const [messagingVisible, setMessagingVisible] = useState(false);

  useEffect(() => {
    if (!isSmallScreen && userId !== user.uid) {
      console.log("onhere");
      setMessagingVisible(true);
    } else {
      setMessagingVisible(false);
    }
  }, [isSmallScreen]);

  return (
    <div className="profileWrapper">
      <div>
        {(!isSmallScreen || (!messagingVisible && isSmallScreen)) && (
          <Grid
            container
            justify="center"
            spacing={3}
            className={classes.gridContainer}
          >
            <Grid item lg={5} md={7} sm={9} xs={12}>
              <LeftColumn toggleMessaging={toggleMessaging} />
            </Grid>
            <Grid
              item
              style={{ minWidth: "300px" }}
              lg={2}
              md={4}
              sm={3}
              xs={0}
            >
              <RightColumn />
            </Grid>
          </Grid>
        )}
        {messagingVisible && <Messaging toggleMessaging={toggleMessaging} />}
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
