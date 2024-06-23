import express from 'express';
import bodyParser from 'body-parser';
import { initialize } from "zokrates-js";
import * as fs from "fs";
import * as crypto from "crypto";
import cors from "cors";

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


app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server responding');
});

app.post('/api/generate-proof', (req, res) => {

  console.log(req.body)
  const owner = stringToHex(hashString(req.body.owner, 16));
  const prompt = stringToHex(hashString(req.body.prompt, 16));
  const uri = stringToHex(hashString(req.body.uri, 16))
  const token_id = req.body.token_id
  const model_id = req.body.model_id
  const model_addr = stringToHex(hashString(req.body.model_addr, 16))



  const out = zk?.computeWitness(artifacts, [
    owner, 
    prompt,
    uri,
    token_id,
    model_id,
    model_addr,
  ]);


  const proof = zk?.generateProof(
    artifacts.program,
    out.witness,
    proving_key
  )


  console.log(proof);


  res.json(proof);
});

app.listen(port, async () => {

  zk = await initialize()

  // get source file
  let source = fs.readFileSync("../circuit/main.zok")

  artifacts = zk.compile(source.toString(), {debug: true});

  proving_key = base64ToUint8Array(fs.readFileSync("../circuit/proving.key").toString('base64'));
  console.log(`Server is running on http://localhost:${port}`);

});