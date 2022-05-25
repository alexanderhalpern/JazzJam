import React, { useState, useEffect } from "react";
import "./RightColumn.css";
import { Avatar } from "@material-ui/core";
import axios from "axios";
import { useStateValue } from "../../StateProvider";
import algoliasearch from "algoliasearch/lite";
import { Link } from "react-router-dom";
import { getProfile } from "../../Login/firebase";

function RightColumn() {
  const [data, setData] = useState([]);
  const [{ user }, dispatch] = useStateValue();
  const [coordinates, setCoordinates] = useState();
  const client = algoliasearch(
    "CKRDWN30C5",
    "5fa5cbb2a55f394bd578939c081aa781"
  );
  const index = client.initIndex("jazzfinder");
  useEffect(() => {
    getProfile(user.uid)
      .then((res) => {
        const lat = res._geoloc.lat.toString();
        const lng = res._geoloc.lng.toString();
        setCoordinates({
          lat: lat,
          lng: lng,
        });
        return [lat, lng];
      })
      .then(([lat, lng]) => {
        index
          .search("", {
            aroundLatLng: lat + ", " + lng,
          })
          .then((res) => {
            for (var i in res.hits) {
              var userId = res.hits[i].objectID;
              if (userId === user.uid) {
                delete res.hits[i];
                break;
              }
            }
            if (res.hits.length > 5) {
              setData(res.hits.slice(0, 5));
            } else {
              setData(res.hits);
            }
          });
      })
      .catch((e) => {});
  }, []);
  return (
    <div className="rightColumn">
      <h3 style={{ paddingBottom: "10px", textAlign: "center" }}>
        Other Musicians Near You
      </h3>
      {data.map((data) => {
        return (
          <Link
            onClick={() => document.querySelector("body").scrollTo(0, 0)}
            to={"/profile/" + data.objectID}
            style={{ textDecoration: "none" }}
          >
            <div className="cards__small">
              <div className="cards__image">
                <Avatar src={data.user_image} />
              </div>
              <div className="cards__text">
                <div className="mini__username">{data.username}</div>
                <span style={{ color: "black" }}>
                  Plays {data.user_instruments[0]}
                </span>
                <span style={{ color: "black" }}>
                  Lives in {data.user_city}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default RightColumn;
