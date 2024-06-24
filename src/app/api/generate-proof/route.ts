import { NextRequest, NextResponse } from "next/server";
import { zk, proving_key, artifacts } from "@/lib/zorates";
import * as crypto from "crypto";

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


export async function POST(req: NextRequest) {

    let body: any = await req.json();

    const owner = stringToHex(hashString(body.owner, 16));
    const prompt = stringToHex(hashString(body.prompt, 16));
    const uri = stringToHex(hashString(body?.uri, 16));
    const token_id = body?.token_id;
    const model_id = body?.model_id;
    const model_addr = stringToHex(hashString(body?.model_addr, 16));


    try {


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
