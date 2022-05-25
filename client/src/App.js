import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Cards from "./Cards/Cards";
import Header from "./Header/Header";
import Auth from "./Login/Auth";
import { getProfile } from "./Login/firebase";
import FullPageMessaging from "./Messaging/FullPageMessaging";
import Posts from "./Posts/Posts";
import CreateProfile from "./Profile/CreateProfile";
import EditProfile from "./Profile/EditProfile";
import Profile from "./Profile/Profile";
import { useStateValue } from "./StateProvider";
import { PushNotifications } from "@capacitor/push-notifications";
import { auth } from "./Login/firebase";
import { useHistory } from "react-router-dom";
import { App as AppListener } from "@capacitor/app";
import Privacy from "./Policies/Privacy";

AppListener.addListener("appStateChange", ({ isActive }) => {
  if (isActive) {
    PushNotifications.removeAllDeliveredNotifications();
  }
});

function App() {
  const [{ user }, dispatch] = useStateValue();
  const [newUser, setNewUser] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    console.log("user", user);
    if (user) {
      getProfile(user.uid).then((res) => {
        if (res == "not found") {
          setNewUser(true);
        }
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    console.log("loading", loading);
  }, [loading]);

  return (
    <div className="app">
      {!user ? (
        <Router>
          <Route path="/" component={Auth} />
          <Route exact path="/privacy" component={Privacy} />
        </Router>
      ) : loading ? null : newUser ? (
        <CreateProfile
          newUser={newUser}
          setNewUser={(p) => {
            setNewUser(p);
          }}
        />
      ) : (
        <Router>
          <Header />
          <div className="content">
            <Route exact path="/" component={Cards} />
            <Route exact path="/myprofile" component={EditProfile} />
            <Route exact path="/profile/:userId" component={Profile} />
            <Route exact path="/messaging" component={FullPageMessaging} />
            <Route exact path="/post" component={Posts} />
            <Route
              exact
              path="/logout"
              component={() => {
                const history = useHistory();
                auth.signOut().then(() => {
                  history.push("/");
                  window.location.reload();
                });
              }}
            />
          </div>
        </Router>
      )}
    </div>
  );
}

export default App;
