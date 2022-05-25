import React from "react";
import "./EditProfile.css";
import LeftColumnEdit from "./LeftColumn/EditLeftColumn";
import RightColumn from "./RightColumn/RightColumn";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Footer from "../Footer/Footer";

const useStyles = makeStyles({
  gridContainer: {
    paddingLeft: "5vw",
    paddingRight: "5vw",
    paddingTop: "50px",
    paddingBottom: "5vh",
  },
});

function Profile(props) {
  const classes = useStyles();
  return (
    <div className="profileWrapper">
      <Grid
        container
        justify="center"
        spacing={3}
        className={classes.gridContainer}
      >
        <Grid item lg={5} md={7} sm={9} xs={12}>
          <LeftColumnEdit
            setNewUser={(p) => {
              props.setNewUser(p);
            }}
          />
        </Grid>
        <Grid item style={{ minWidth: "300px" }} lg={2} md={4} sm={3} xs={0}>
          <RightColumn />
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
}

export default Profile;
