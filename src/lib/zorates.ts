import { readFileSync } from "fs";
import {ZoKratesProvider, CompilationArtifacts, initialize} from "zokrates-js"

let zk: ZoKratesProvider | null = null;
let artifacts: CompilationArtifacts | null = null;
let proving_key: Uint8Array | null = null;





function base64ToUint8Array(base64String: string): Uint8Array {
    const binaryString = atob(base64String);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
}


async function initializeZok() {

    if (zk === null) {
        zk = await initialize();

        let source = readFileSync("circuit/main.zok")
        artifacts = zk.compile(source.toString());

        proving_key = base64ToUint8Array(readFileSync("circuit/proving.key").toString('base64'));

        console.log("Initialized");
    }


}

initializeZok();


export {zk, artifacts, proving_key};