import firebase from "firebase";
import axios from "axios";
import crypto from "crypto";
import { resolve } from "path";

const secret = "pppppppppppppppppppppppppppppppp";
const firebaseConfig = require("./firebaseConfig.json");

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const storage = firebase.storage();

function generateRandomPassword() {
  return crypto.randomBytes(20).toString("hex");
}

const encrypt = (password) => {
  const iv = Buffer.from(crypto.randomBytes(16));
  const cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(secret), iv);

  const encryptedPassword = Buffer.concat([
    cipher.update(password),
    cipher.final(),
  ]);

  return {
    iv: iv.toString("hex"),
    password: encryptedPassword.toString("hex"),
  };
};

const decrypt = (encryption) => {
  const iv = Buffer.from(encryption.iv, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(secret),
    iv
  );

  const decryptedPassword = Buffer.concat([
    decipher.update(Buffer.from(encryption.password, "hex")),
    decipher.final(),
  ]);

  return decryptedPassword.toString();
};

export async function editProfile(userId, data) {
  firebaseApp
    .database()
    .ref("users/" + userId)
    .set(data);
}

export async function getProfile(userId) {
  const dbRef = firebaseApp.database().ref();
  return new Promise((resolve, reject) => {
    dbRef
      .child("users")
      .child(userId)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          resolve("not found");
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function getUsernames() {
  const dbRef = firebaseApp.database().ref();
  return new Promise((resolve, reject) => {
    dbRef
      .child("users/")
      .get()
      .then((querySnapshot) => {
        const data = [];
        const response = querySnapshot.forEach((doc) => {
          var val = doc.val();
          data.push({
            value: val.username,
          });
        });
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function createMessaging(userId, userName, userEmail) {
  var getConfig = {
    method: "get",
    url: "https://api.chatengine.io/users",
    headers: {
      "PRIVATE-KEY": "816db2a1-3cd9-4d32-9769-954b6d3dd227",
    },
  };

  return new Promise((resolve, reject) => {
    axios(getConfig).then(function (response) {
      var userExists = false;
      for (const i in response.data) {
        if (response.data[i].username === userName) {
          userExists = true;
        }
      }
      if (!userExists) {
        const password = generateRandomPassword();
        const encpassword = encrypt(password);
        var data = {
          username: userName,
          email: userEmail,
          secret: password,
        };

        var createConfig = {
          method: "post",
          url: "https://api.chatengine.io/users/",
          headers: {
            "PRIVATE-KEY": "816db2a1-3cd9-4d32-9769-954b6d3dd227",
          },
          data: data,
        };

        axios(createConfig)
          .then(function (response) {
            firebaseApp
              .database()
              .ref("messaging/" + userId)
              .set({
                userName: userName,
                userEmail: userEmail,
                password: encpassword,
              });
            resolve("user created successfully");
          })
          .catch(function (error) {
            reject("error");
          });
      } else {
        resolve("username taken");
      }
    });
  });
}

export async function getMessagingUser(userId) {
  const dbRef = firebaseApp.database().ref();
  return new Promise((resolve, reject) => {
    dbRef
      .child("messaging/" + userId)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          var creds = snapshot.val();
          creds.password = decrypt(creds.password);
          delete creds.userEmail;
          resolve(creds);
        } else {
          resolve("not found");
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function checkMessaging(username) {
  var config = {
    method: "get",
    url: "https://api.chatengine.io/users/",
    headers: {
      "PRIVATE-KEY": "816db2a1-3cd9-4d32-9769-954b6d3dd227",
    },
  };

  return new Promise((resolve, reject) => {
    axios(config)
      .then(function (response) {
        var taken = false;
        for (var i in response.data) {
          if (response.data[i].username === username) {
            taken = true;
          }
        }
        if (taken) {
          resolve("username taken");
        } else {
          resolve("free");
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

export async function putMessaging(senderUid, receiverUid) {
  return new Promise((resolve, reject) => {
    Promise.all([
      getMessagingUser(senderUid),
      new Promise((resolve, reject) => {
        firebaseApp
          .database()
          .ref()
          .child("users/" + receiverUid + "/username")
          .get()
          .then((snapshot) => {
            if (snapshot.exists()) {
              var username = snapshot.val();
              resolve(username);
            } else {
              resolve("not found");
            }
          })
          .catch((error) => {
            reject(error);
          });
      }),
    ])
      .then((res) => {
        console.log(res);
        var senderUsername = res[0].userName;
        var senderPassword = res[0].password;
        var receiverUsername = res[1];

        var data = {
          usernames: [senderUsername, receiverUsername],
          is_direct_chat: true,
        };

        var config = {
          method: "put",
          url: "https://api.chatengine.io/chats/",
          headers: {
            "Project-ID": "13f31b84-7f8f-41f9-b67d-afe362598517",
            "User-Name": senderUsername,
            "User-Secret": senderPassword,
          },
          data: data,
        };
        return config;
      })
      .then((config) => {
        axios(config).then((response) => {
          resolve(response.data.id.toString());
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function createPost(postData) {
  firebaseApp.database().ref("posts").push().set(postData);
}

export async function getPosts() {
  const dbRef = firebaseApp.database().ref();
  return new Promise((resolve, reject) => {
    dbRef
      .child("posts")
      .get()
      .then((querySnapshot) => {
        var promises = [];
        var data = [];
        querySnapshot.forEach((doc) => {
          promises.push(
            new Promise((resolve, reject) => {
              var val = doc.val();
              getProfile(val.uid).then((res) => {
                val.image = res.user_image;
                val.key = doc.key;
                data.push(val);
                resolve();
              });
            })
          );
        });
        Promise.all(promises).then(() => {
          data.reverse();
          resolve(data);
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function deletePost(messageId) {
  const dbRef = firebaseApp.database().ref();
  return new Promise((resolve, reject) => {
    dbRef
      .child("posts/" + messageId)
      .remove()
      .then(() => {
        resolve("post deleted");
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export { auth, provider, storage, firebaseApp };
export default db;
