import React from "react";
import "./EditProfile.css";
import LeftColumnEdit from "./LeftColumn/EditLeftColumn";
import RightColumn from "./RightColumn/RightColumn";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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
    <Grid
      container
      justify="center"
      spacing={3}
      className={classes.gridContainer}
    >
      <Grid item lg={5} md={7} sm={12} xs={12}>
        <LeftColumnEdit
          newUser={props.newUser}
          setNewUser={(p) => {
            props.setNewUser(p);
          }}
        />
      </Grid>
    </Grid>
  );
}

export default Profile;
