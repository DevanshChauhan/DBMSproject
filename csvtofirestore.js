const {readFile}  = require('fs').promises;
const {promisify} = require('util');
const parse       = promisify(require('csv-parse'));
const {Firestore} = require('@google-cloud/firestore');

if (process.argv.length < 3) {
  console.error('Please include a path to a csv file');
  process.exit(1);
}


const db = new Firestore();

function writeToFirestore(records) {
  const batchCommits = [];
  let batch = db.batch();
  records.forEach((record, i) => {
    var docRef = db.collection('DATA').doc(record.SUBDIVISION);
    batch.set(docRef, record);
    if ((i + 1) % 500 === 0) {
      console.log(`Writing record ${i + 1}`);
      batchCommits.push(batch.commit());
      batch = db.batch();
    }
  });
  batchCommits.push(batch.commit());
  return Promise.all(batchCommits);
}