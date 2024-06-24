import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import {ZoKratesProvider, CompilationArtifacts, initialize} from "zokrates-js"
import { readFileSync } from "fs";

function hashString(inputString: string, hashLength: number): string {
    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex').slice(0, hashLength);
}

function stringToHex(str: string): string {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i).toString(16);
        hex += (charCode.length < 2 ? '0' + charCode : charCode);
    }
    return hex;
}


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


export async function POST(req: NextRequest) {


    try {

        console.log("initializing");

        await initializeZok();

        let body: any = await req.json();

        const owner = stringToHex(hashString(body.owner, 16));
        const prompt = stringToHex(hashString(body.prompt, 16));
        const uri = stringToHex(hashString(body?.uri, 16));
        const token_id = body?.token_id;
        const model_id = body?.model_id;
        const model_addr = stringToHex(hashString(body?.model_addr, 16));

        const out = zk?.computeWitness(artifacts!, [
            owner,
            prompt,
            uri,
            token_id,
            model_id,
            model_addr,
        ]);

        const proof = zk?.generateProof(
            artifacts!.program,
            out?.witness!,
            proving_key!
        )



        return NextResponse.json(proof);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
