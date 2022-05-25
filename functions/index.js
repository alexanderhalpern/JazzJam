const functions = require("firebase-functions");
const algoliasearch = require("algoliasearch");
const admin = require("firebase-admin");
admin.initializeApp();

const client = algoliasearch(
  functions.config().algolia.app_id,
  functions.config().algolia.api_key
);

async function getSenderUserId(username) {
  const dbRef = admin.database().ref();
  return new Promise((resolve, reject) => {
    dbRef
      .child("users/")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var val = doc.val();
          if (val.username === username) {
            resolve(doc.key);
          }
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function getToken(receiver) {
  console.log(`Getting token for ${JSON.stringify(receiver)}`);
  const dbRef = admin.database().ref();
  return new Promise((resolve, reject) => {
    dbRef
      .child("users/")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var val = doc.val();
          if (val.username === receiver) {
            console.log(`Found user ${receiver}`);
            // get token
            const user = dbRef
              .child("FCMTokens/" + doc.key)
              .get()
              .then((querySnapshot) => {
                resolve(querySnapshot.val().pushToken.value);
              })
              .catch((error) => {
                console.log(error);
                reject(error);
              });
          }
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

exports.sendHttpPushNotification = functions.https.onRequest((req, res) => {
  console.log(JSON.stringify(req.body));

  const sender = req.body.message.sender_username;
  const msg = req.body.message.text.replace(/(<([^>]+)>)/gi, "").trim();
  const receivers = req.body.chat.people.map((person) => {
    if (person.person.username !== sender) {
      return person.person.username;
    }
    return null;
  });

  console.log(receivers);
  receivers.forEach((receiver) => {
    if (receiver) {
      getToken(receiver)
        .then((token) => {
          getSenderUserId(sender).then((userId) => {
            const payload = {
              token: token,
              notification: {
                title: "Message from " + sender,
                body: msg,
              },
              data: {
                userId: userId,
              },
              apns: {
                payload: {
                  aps: {
                    badge: 1,
                    sound: "default",
                  },
                },
              },
            };

            admin
              .messaging()
              .send(payload)
              .then((response) => {
                console.log("Successfully sent message:", response);
              })
              .catch((error) => {
                console.log(error);
              });
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
});

const ALGOLIA_USERS_INDEX = "jazzfinder";
exports.usersEntry = functions.database
  .ref(`/users/{userId}/`)
  .onWrite((change, context) => {
    try {
      const index = client.initIndex(ALGOLIA_USERS_INDEX);
      const changeSnapshot = change.after.val();
      if (!change.after.val()) {
        return;
      }
      const firebaseObject = {
        objectID: context.params.userId,
      };
      Object.keys(changeSnapshot).map((key) => {
        firebaseObject[key] = changeSnapshot[key];
      });
      return index.saveObject(firebaseObject);
    } catch (e) {}
  });

exports.userIndexDeletion = functions.database
  .ref(`users/{userId}`)
  .onDelete((snap, context) => {
    const index = client.initIndex(ALGOLIA_USERS_INDEX);
    const objectID = context.params.userId;
    return index.deleteObject(objectID);
  });
