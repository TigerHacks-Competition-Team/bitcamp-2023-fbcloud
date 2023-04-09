const functions = require("firebase-functions");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.downloadAudio = functions.runWith({
    timeoutSeconds: 540,
  }).firestore
    .document('songs/{docID}')
    .onCreate(async (snap, context) => {
      // Get an object representing the document
      // e.g. {'name': 'Marie', 'age': 66}
      const newValue = snap.data();

      // access a particular field as you would any JS property
      const name = newValue.name;
      await fetch("https://ingest-container-cvwtqrjlla-uc.a.run.app/yt2wav", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({docID: snap.id})
    })

      // perform desired operations ...
});

exports.updateActions = functions.runWith({
    timeoutSeconds: 540,
  }).firestore.document('songs/{docID}')
.onUpdate(async (change, context) => {
  // Get an object representing the document
  // e.g. {'name': 'Marie', 'age': 66}
  const newValue = change.after.data();

  // ...or the previous value before this update
  const previousValue = change.before.data();

  // access a particular field as you would any JS property
  const name = newValue.name;

  if (newValue.original != previousValue.original) {
    // run spleeter
    await fetch("https://ingest-container-cvwtqrjlla-uc.a.run.app/wav2piano", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({docID: change.after.id})
    })
  } else if (newValue.piano != previousValue.piano) {
    // run basic pitch
    await fetch("https://ingest-container-cvwtqrjlla-uc.a.run.app/piano2midi", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({docID: change.after.id})
    })
  }
})
