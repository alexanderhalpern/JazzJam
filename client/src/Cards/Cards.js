import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Avatar, Grid, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import algoliasearch from "algoliasearch/lite";
import { Button, Card, Checkbox, Select } from "antd";
import queryString from "query-string";
import { Link, useLocation } from "react-router-dom";
import { getUserSchool, getYearsPlayed } from "../Functions/Functions";
import { Icons } from "../Icons/Access";
import { firebaseApp, getProfile } from "../Login/firebase";
import { useStateValue } from "../StateProvider";
import { PushNotifications } from "@capacitor/push-notifications";
import { Toast } from "@capacitor/toast";
import { useHistory } from "react-router-dom";
import Footer from "../Footer/Footer";
import "./Cards.css";

const useStyles = makeStyles({
  gridContainer: {
    paddingLeft: "5vw",
    paddingRight: "5vw",
    paddingTop: "5vh",
  },
  title: {
    fontWeight: "500",
  },
});
const client = algoliasearch(process.env.ALGOLIAKEY, process.env.ALGOLIAPASS);
const index = client.initIndex("jazzfinder");
const { Meta } = Card;
const { Option } = Select;

function Cards() {
  const blankMultiple = [""];
  const location = useLocation();
  const nullEntry = [];
  const [notifications, setnotifications] = useState(nullEntry);
  const search = queryString.parse(location.search)["search"];
  const [filter, setFilter] = useState({
    radius: "all",
    instrument: "all",
  });
  const [data, setData] = useState([]);
  const [{ user }, dispatch] = useStateValue();
  const [upload, setUpload] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(0);
  const history = useHistory();
  const classes = useStyles();
  let isSmallScreen = useMediaQuery("(max-width: 599px)", { noSsr: true });

  // retrieve the total number of users from algolia

  useEffect(() => {
    console.log("page", page);
  }, [page]);

  const handleFilter = (value, key) => {
    console.log("he");
    const newfilter = { ...filter };
    newfilter[key] = value;
    setFilter(newfilter);
  };

  // useEffect(() => {
  //   PushNotifications.checkPermissions().then((res) => {
  //     if (res.receive !== "granted") {
  //       PushNotifications.requestPermissions().then((res) => {
  //         if (res.receive === "denied") {
  //           showToast("Push Notification permission denied");
  //         } else {
  //           showToast("Push Notification permission granted");
  //           register();
  //         }
  //       });
  //     } else {
  //       register();
  //     }
  //   });

  //   var filters = {
  //     // aroundLatLng: coordinates.lat + ", " + coordinates.lng,
  //     aroundLatLngViaIP: true,
  //   };

  //   if (filter.radius !== "all" && filter.radius !== undefined) {
  //     filters.aroundRadius = parseInt(filter.radius);
  //   }

  //   if (filter.instrument !== "all" && filter.instrument !== undefined) {
  //     filters.filters = 'user_instruments: "' + filter.instrument + '"';
  //   }
  //   filters.page = page;
  //   filters.hitsPerPage = 12;
  //   console.log(filters);
  //   index.search(search, filters).then((res) => {
  //     setData(res.hits);
  //   });
  // }, [filter, search, page]);

  useEffect(() => {
    document.body.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    PushNotifications.checkPermissions().then((res) => {
      if (res.receive !== "granted") {
        PushNotifications.requestPermissions().then((res) => {
          if (res.receive === "denied") {
            showToast("Push Notification permission denied");
          } else {
            showToast("Push Notification permission granted");
            register();
          }
        });
      } else {
        register();
      }
    });

    getOrSetCoordinates().then(([lat, lng]) => {
      var filters = {
        aroundLatLng: lat + ", " + lng,
      };

      if (filter.radius !== "all" && filter.radius !== undefined) {
        filters.aroundRadius = parseInt(filter.radius);
      }

      if (filter.instrument !== "all" && filter.instrument !== undefined) {
        filters.filters = 'user_instruments: "' + filter.instrument + '"';
      }

      filters.page = page;
      filters.hitsPerPage = 12;

      index.search(search, filters).then((res) => {
        setNumPages(res.nbPages);
        setData(res.hits);
      });
    });
  }, [filter, search, page]);

  async function getOrSetCoordinates() {
    if (!coordinates) {
      return new Promise((resolve, reject) => {
        getProfile(user.uid)
          .then((res) => {
            console.log(res);
            const lat = res._geoloc.lat.toString();
            const lng = res._geoloc.lng.toString();
            setCoordinates({
              lat: lat,
              lng: lng,
            });
            resolve([lat, lng]);
          })
          .catch((err) => {
            reject(err);
          });
      });
    }

    return [coordinates.lat, coordinates.lng];
  }

  const register = () => {
    console.log("Initializing HomePage");

    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener("registration", (token) => {
      firebaseApp.database().ref(`/FCMTokens/${user.uid}/pushToken`).set(token);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener("registrationError", (error) => {
      alert("Error on registration: " + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        setnotifications((notifications) => [
          ...notifications,
          {
            id: notification.id,
            title: notification.title,
            body: notification.body,
            type: "foreground",
          },
        ]);
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        history.push("/messaging");
        setnotifications((notifications) => [
          ...notifications,
          {
            id: notification.notification.data.id,
            title: notification.notification.data.title,
            body: notification.notification.data.body,
            type: "action",
          },
        ]);
      }
    );
  };

  const showToast = async (msg) => {
    await Toast.show({
      text: msg,
    });
  };

  const FilterCards = () => {
    return (
      <div className="cards__left">
        <h2>Filter Profiles</h2>
        <div className="filterCheck">
          <p>Uploaded Media:</p>
          <Checkbox
            checked={upload}
            onChange={(event) => setUpload(event.target.checked)}
            name="checkedB"
            style={{ marginBottom: "10px", marginLeft: "10px" }}
          />
        </div>
        <div className="filter">
          <p>Select Max Distance:</p>
          <div className="select">
            <Select
              key="radius"
              value={filter.radius}
              defaultValue="all"
              style={{ width: "70%" }}
              onChange={(value) => handleFilter(value, "radius")}
            >
              <Option value="all">None</Option>
              <Option value="8046">5 Miles</Option>
              <Option value="16093">10 Miles</Option>
              <Option value="24140">15 Miles</Option>
              <Option value="32186">20 Miles</Option>
              <Option value="40233">25 Miles</Option>
            </Select>
          </div>
        </div>
        <div className="filter" style={{ marginTop: "10px" }}>
          <p>Select an Instrument:</p>
          <div className="select">
            <Select
              key="instrument"
              value={filter.instrument}
              defaultValue="all"
              style={{ width: "70%" }}
              onChange={(value, _) => handleFilter(value, "instrument")}
            >
              <Option value="all">None</Option>
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
          </div>
        </div>
      </div>
    );
  };

  const renderCard = (data) => {
    return (
      <Grid item xs={12} sm={12} md={6} lg={4} xl={3}>
        <div
          className="card__div"
          style={{
            height: "100%",
            boxShadow: "0 3px 10px rgb(0 0 0 / 0.2)",
            display: "flex",
            borderRadius: "10px",
            flexDirection: "column",
            backgroundColor: "white",
          }}
        >
          <Card
            style={{
              border: "none",
              height: "100%",
              backgroundColor: "white",
              borderRadius: "10px",
            }}
          >
            <div className="cards__top">
              <div className="cards__image">
                <Avatar
                  style={{
                    width: "35px",
                    height: "35px",
                    marginRight: "4px",
                  }}
                  src={data.user_image}
                />
              </div>
              <div className="cards__text">
                <div className="cards__username">{data.username}</div>
                <span style={{ color: "black" }}>
                  {data.user_city}, {data.user_state}
                </span>
              </div>
            </div>
            <hr style={{ opacity: ".15", width: "100%" }} />
            {/* <Meta style={{ marginTop: "10px" }} title="Plays" /> */}
            {/* <ul>
              {data.user_instruments.slice(0, 2).map((instrument) => (
                <li>{instrument}</li>
              ))}
              {data.user_instruments.length > 2 ? <p>. . .</p> : null}
            </ul> */}
            <Meta title="Primary Instrument" style={{ marginTop: "10px" }} />
            <img
              className="icons"
              src={Icons[data.user_instruments.slice(0, 1)]}
            />
            <span className="icons__text">
              {data.user_instruments.slice(0, 1)}
            </span>
            <Meta
              title="Years Playing Jazz"
              style={{ marginTop: "10px" }}
              description={getYearsPlayed(data)}
            />
            <Meta
              title="School"
              style={{ marginTop: "10px" }}
              description={getUserSchool(data)}
            />

            {/* <Meta style={{ marginTop: "10px" }} title="Bio" />
            <div className="user__bioDiv">
              <p className="user__bio">{data.user_bio}</p>
            </div> */}
          </Card>
          <div
            className="profile__button"
            style={{ width: "100%", textAlign: "center" }}
          >
            <Link
              to={"/profile/" + data.objectID}
              style={{ textDecoration: "none" }}
            >
              <Button
                type="primary"
                shape="round"
                style={{ marginBottom: "20px" }}
                icon={<UserOutlined />}
                size="large"
              >
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </Grid>
    );
  };

  return (
    <div className="cardWrapper">
      <div className="cards">
        {!isSmallScreen && <FilterCards />}
        <div className="cards__right">
          <h1
            style={{
              textAlign: "center",
              lineHeight: 0.5,
              marginTop: "30px",
              marginBottom: 0,
              fontSize: "1.6rem",
            }}
          >
            Musician Profiles
          </h1>
          <Grid container className={classes.gridContainer} spacing={6}>
            {isSmallScreen && (
              <Grid item xs={12} sm={12} md={6} lg={8} xl={9}>
                <FilterCards />
              </Grid>
            )}
            {data
              .filter((val) => {
                const uploadedMedia =
                  JSON.stringify(val.user_media) !==
                  JSON.stringify(blankMultiple);
                if (!(!uploadedMedia && upload)) {
                  return val;
                }
              })
              .map(renderCard)}
          </Grid>
          {/* {data.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "40px",
                padding: "20px",
              }}
            >
              <h3>No Results</h3>
            </div>
          )} */}
          {/* Forward and back buttons */}
          <div className="cards__buttons">
            <div className="group">
              {page > 0 ? (
                <Button
                  type="secondary"
                  shape="round"
                  style={{ margin: "20px" }}
                  icon={<ArrowLeftOutlined />}
                  size="large"
                  onClick={() => {
                    setPage(page - 1);
                    // scroll to top
                  }}
                >
                  Previous Page
                </Button>
              ) : null}
              {page < numPages - 1 ? (
                <Button
                  type="secondary"
                  shape="round"
                  style={{
                    margin: "20px",
                  }}
                  icon={<ArrowRightOutlined />}
                  size="large"
                  onClick={() => {
                    setPage(page + 1);
                  }}
                >
                  Next Page
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {data.length !== 0 && <Footer />}
    </div>
  );
}

export default Cards;
