// keyStore.js
import fs from 'fs';
import path from 'path';
import { generateRandomKeys, PublicKey, PrivateKey } from 'paillier-bigint';

const KEY_FILE_PATH = path.resolve('keys.json');

let publicKey = null;
let privateKey = null;
let encryptedVotes = [];

function getEncryptedVotes() {
  return encryptedVotes;
}
function addVote(vote) {
  encryptedVotes.push(vote);
}
function clearVotes() {
  encryptedVotes = [];
}

const generateKeys = async () => {
  if (fs.existsSync(KEY_FILE_PATH)) {
    // Load from file
    const keyData = JSON.parse(fs.readFileSync(KEY_FILE_PATH, 'utf-8'));

    publicKey = new PublicKey(BigInt(keyData.publicKey.n), BigInt(keyData.publicKey.g));
    privateKey = new PrivateKey(
      BigInt(keyData.privateKey.lambda),
      BigInt(keyData.privateKey.mu),
      publicKey
    );
  } else {
    // Generate new keys and save
    const keys = await generateRandomKeys(2048);
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;

    const serialized = {
      publicKey: {
        n: publicKey.n.toString(),
        g: publicKey.g.toString(),
        n2: publicKey._n2.toString() 
      },
      privateKey: {
        lambda: privateKey.lambda.toString(),
        mu: privateKey.mu.toString()
      }
    };

    fs.writeFileSync(KEY_FILE_PATH, JSON.stringify(serialized, null, 2));
  }
};

const getPublicKey = () => publicKey;
const getPrivateKey = () => privateKey;

export {
  generateKeys,
  getPublicKey,
  getPrivateKey,
  addVote,
  clearVotes,
  getEncryptedVotes
};

