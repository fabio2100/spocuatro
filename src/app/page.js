"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import ListCustomItem from "./components/ListCustomItem";
import List from "@mui/material/List";
import { CircularProgress } from "@mui/material";

export default function Home() {
  const [mustUpdateDb, setmustUpdateDb] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userInfo, setUserInfo] = useState({
    token: null,
    userId: null,
  });
  const [userData, setUserData] = useState({
    tracksMedium: [],
    tracksShort: [],
    tracksLong: [],
    artistsMedium: [],
    artistsShort: [],
    artistsLong: [],
  });

  const updateUserData = (key, value) => {
    setUserData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleLogin = () => {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&scope=user-top-read`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      fetchToken(code);
    }
  }, []);

  const fetchToken = async (code) => {
    try {
      const responseToken = await axios.get(`/api/getToken?code=${code}`);
      const responseId = await axios.get(`https://api.spotify.com/v1/me`, {
        headers: { Authorization: `Bearer ${responseToken.data.access_token}` },
      });
      setUserInfo({
        token: responseToken.data.access_token,
        userId: responseId.data.id,
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        window.location.href = process.env.NEXT_PUBLIC_REDIRECT_URI;
      } else {
        console.error("Error fetching the token or userId", error);
      }
    }
  };

  useEffect(() => {
    if (userInfo.userId) {
      axios
        .get(`/api/getUserTracks?userId=${userInfo.userId}`)
        .then((response) => {
          setUserData(response.data.userData);
          setmustUpdateDb(response.data.actualizar);
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            setIsNewUser(true);
          } else {
            console.error("Error fetching user data", error);
          }
        });
    }
  }, [userInfo]);

  useEffect(() => {
    console.log({ mustUpdateDb, isNewUser });
    if (mustUpdateDb || isNewUser) {
      fetchUserData(userInfo.token);
    }
  }, [mustUpdateDb, isNewUser]);

  const fetchUserData = async (accessToken) => {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const promises = [
        {
          id: "tracksMedium",
          url: `https://api.spotify.com/v1/me/top/tracks?limit=${process.env.NEXT_PUBLIC_CANTIDAD_SEARCH}`,
        },
        {
          id: "tracksLong",
          url: `https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=${process.env.NEXT_PUBLIC_CANTIDAD_SEARCH}`,
        },
        {
          id: "tracksShort",
          url: `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${process.env.NEXT_PUBLIC_CANTIDAD_SEARCH}`,
        },
        {
          id: "artistsMedium",
          url: `https://api.spotify.com/v1/me/top/artists?limit=${process.env.NEXT_PUBLIC_CANTIDAD_SEARCH}`,
        },
        {
          id: "artistsLong",
          url: `https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=${process.env.NEXT_PUBLIC_CANTIDAD_SEARCH}`,
        },
        {
          id: "artistsShort",
          url: `https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=${process.env.NEXT_PUBLIC_CANTIDAD_SEARCH}`,
        },
      ];

      const fetchPromises = promises.map((p) =>
        axios
          .get(p.url, { headers })
          .then((response) => ({ id: p.id, data: response.data }))
      );

      const results = await Promise.allSettled(fetchPromises);

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { id, data } = result.value;
          const modifiedItems = data.items.map((item) => ({
            ...item,
            change: false,
          }));
          updateUserData(id, modifiedItems);
        } else if (result.status === "rejected") {
          console.error(
            `Promise ${result.reason.config.url} rejected:`,
            result.reason
          );
        }
      });
    } catch (error) {
      console.error("Error fetching the top tracks", error);
    }
  };

  useEffect(() => {
    if (mustUpdateDb || isNewUser) {
      const areAllElementsEmpty = (obj) => {
        return Object.keys(obj.userData).every(
          (key) => obj.userData[key].length === 0
        );
      };
      if (!areAllElementsEmpty({ userData })) {
        updateDB(userData);
      }
    }
  }, [userData]);

  const updateDB = async (userData) => {
    const filteredUserData = processUserData(userData);
    try {
      await axios.post("/api/updateDb", {
        userId: userInfo.userId,
        userData: filteredUserData,
      });
      console.log("Database updated successfully");
    } catch (error) {
      console.error("Error updating the database", error);
    }
  };

  const processUserData = (userData) => {
    console.log({ userData });
    const filteredUserData = Object.keys(userData).reduce((acc, key) => {
      acc[key] = userData[key].map((item) => ({
        id: item.id,
        change: item.change,
      }));
      return acc;
    }, {});
    return filteredUserData;
  };

  return (
    <div className={styles.page}>
      <h1>Spocuatro</h1>
      {console.log({ userData })}
      {userInfo.userId ? (
        <h1>loggeado</h1>
      ) : (
        <button onClick={handleLogin} className="custom-button">
          <span className="button-text">SIGN WITH </span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
            <path
              fill="#1ed760"
              d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8Z"
            />
            <path d="M406.6 231.1c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3zm-31 76.2c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm-26.9 65.6c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4z" />
          </svg>
        </button>
      )}
    </div>
  );
}
