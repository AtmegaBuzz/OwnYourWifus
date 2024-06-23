import express from 'express';
import bodyParser from 'body-parser';
import { initialize } from "zokrates-js";
import * as fs from "fs";
import * as crypto from "crypto";
import { useInsertionEffect } from 'react';
import { url } from 'inspector';

function base64ToUint8Array(base64String) {
  const binaryString = atob(base64String);
  const length = binaryString.length;
  const uint8Array = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return uint8Array;
}

function hashString(inputString,hashLength) {
  const hash = crypto.createHash('sha256');
  hash.update(inputString);
  return hash.digest('hex').slice(0,hashLength);
}

function hexToBigNumber(hexString) {
  const hex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  return BigInt(`0x${hex}`).toString();
}

// Function to compute SHA-256 hash in ZoKrates-compatible packed format
function sha256packed(data) {
  // Convert each hex string to a BigNumber
  const bigNumbers = data.map(hexToBigNumber);

  // Join all BigNumber strings into a single buffer
  const packedBuffer = Buffer.concat(bigNumbers.map(num => Buffer.from(num, 'hex')));

  // Compute SHA-256 hash
  const hash = crypto.createHash('sha256').update(packedBuffer).digest('hex');

  // Split the resulting hash into two parts of 128-bit each
  const hashPart1 = hash.slice(0, 32); // First 128 bits
  const hashPart2 = hash.slice(32, 64); // Second 128 bits

  return [hashPart1, hashPart2];
}

function stringToHex(str) {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i).toString(16);
    hex += (charCode.length < 2 ? '0' + charCode : charCode);
  }
  return hex;
}

const app = express();
const port = 3000;

let zk = null;
let artifacts = null;
let proving_key = null;
let verifier_key = null;
const encoder = new TextEncoder();



const owner = stringToHex(hashString("0x375C11FD30FdC95e10aAD66bdcE590E1bccc6aFA", 16));
const prompt = stringToHex(hashString("a green cow", 16));
const uri = stringToHex(hashString("ipfs://qwieqweoqweiqweeqwe", 16))
const token_id = "1"
const model_id = "50"
const model_addr = stringToHex(hashString("0x375C11FD30FdC95e10aAD66bdcE590E1bccc6aFA", 16))



app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server responding');
});

app.post('/api/generate-proof', (req, res) => {

  // const { name, age } = req.body;

  // let aigc_data_hash =  

  const data = [owner,prompt,uri,0]
  console.log(sha256packed(data))
  console.log([
    owner,
    prompt,
    uri,
    token_id,
    model_id,
    model_addr
  ])
  // const out = zk?.computeWitness(artifacts, [
  //   owner, 
  //   prompt,
  //   uri,
  //   uri,
  //   uri,
  //   token_id,
  //   model_id,
  //   model_addr,
  //   model_addr,
  //   model_addr
  // ]);


  // const proof = zk?.generateProof(
  //   artifacts.program,
  //   out.witness,
  //   proving_key
  // )


  // console.log(proof);




  res.json({ message: 'Data received successfully!' });
});

app.listen(port, async () => {

  zk = await initialize()

  // get source file
  let source = fs.readFileSync("src/main.zok")

  // artifacts = zk.compile(source.toString(), {debug: true});

  // proving_key = base64ToUint8Array(fs.readFileSync("src/proving.key").toString('base64'));
  console.log(`Server is running on http://localhost:${port}`);

});


// x is ["223327664358836963372700768644666021985","237222010210539088169657622460833873792"], y is ["339647579740628927478439536697560176125","67587774717118373856673073548473668498"]