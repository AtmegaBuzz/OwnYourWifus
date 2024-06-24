"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CornerDownLeft } from "lucide-react";
import { useAtom } from "jotai";
import { contractAtom, loadingAtom, loadingMessage, web3Atom } from "@/atoms/global";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";
import Link from "next/link";

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const CreateNFT: React.FC = () => {

  const [query, setQuery] = useState("Imagine a striking anime character exuding confidence and elegance. She possesses a thick, curvaceous figure with generous proportions, notably big breasts and a curvy abdomen. She is adorned in a sleek black gown that accentuates her silhouette, with intricate details that highlight her style and sophistication. Her pose exudes charisma, perhaps with one hand on her hip and a slight tilt of the head, showcasing her confidence and allure. The illustration should capture her gracefulness and charm, making her a captivating presence in any scene.");
  const [wifu, setWifu] = useState("");
  const [state, setState] = useState("start"); // start zkp mint
  const [proof, setProof] = useState<any>(null);

  const [contract,] = useAtom(contractAtom);
  const [web3,] = useAtom(web3Atom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [loadingMsg, setLoadingMsg] = useAtom(loadingMessage);

  const api = process.env.NEXT_PUBLIC_PINATA_API_KEY as string;
  const secret = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY as string;

  const uploadtoIpfs = async () => {

    try {

      const aigc_type = {

        "title": "AIGC Metadata",
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Wifu"
          },
          "description": {
            "type": "string",
            "description": "This Wifu is mine"
          },
          "image": {
            "type": "string",
            "description": `https://ipfs.io/ipfs/${wifu}`
          },
          "prompt": {
            "type": "string",
            "description": query
          },
          "aigc_type": {
            "type": "string",
            "description": "image"
          },
          "aigc_data": {
            "type": "string",
            "description": `https://ipfs.io/ipfs/${wifu}`
          },
          "proof_type": {
            "type": "string",
            "description": "validity (zkML)"
          },
          "proof": {
            "type": "string",
            "description": JSON.stringify(proof)
          }
        }
      }

      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: api,
          pinata_secret_api_key: secret,
        },
        body: JSON.stringify(aigc_type)
      });

      const result = await res.json();
      console.log(result)
      return result.IpfsHash;

    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw error;
    }

  }


  const mint = async () => {

    setLoadingMsg("Minting NFT with aigc_type")
    setLoading(true);

    let ipfsHash = await uploadtoIpfs();

    const accounts = await web3?.eth.getAccounts()!;


    const gasPrice = await web3?.eth.getGasPrice();

    console.log(proof.inputs,proof.proof, "=====")
    let tokenId = await contract?.methods.safeMint(
      accounts[0],
      `https://ipfs.io/ipfs/${ipfsHash}`,
      proof.inputs,
      proof.proof).send({
        from: accounts[0],
        gasPrice: gasPrice?.toString()
    }).on("confirmation", ()=>{


      console.log("tx done");

    });

    console.log(tokenId);
    setLoading(false);

  }

  const generateZKP = async () => {

    setLoadingMsg("Generating Claim Proof");
    setLoading(true);

    const accounts = await web3?.eth.getAccounts()!;
    const MODEL_ID = process.env.NEXT_PUBLIC_MODEL_ID as string
    const MODEL_ADDR = process.env.NEXT_PUBLIC_MODEL_ADDRESS as string


    const body = {
      owner: accounts[0],
      prompt: query,
      uri: wifu,
      token_id: "1",
      model_id: MODEL_ID,
      model_addr: MODEL_ADDR
    }

    console.log(body)


    let resp = await fetch("/api/generate-proof", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    let proof = await resp.json();
    console.log(proof);
    setProof(proof);

    setLoading(false);
    setState("mint");

  }


  const generateWifu = async () => {

    try {

      setLoadingMsg("Generating NFT on ORA");
      setLoading(true);

      const MODEL_ID = process.env.NEXT_PUBLIC_MODEL_ID as string

      console.log(MODEL_ID, "model");

      const accounts = await web3?.eth.getAccounts()!;


      const estimated_fees = await contract?.methods.estimateFee(MODEL_ID).call({ from: accounts[0] })
      const gasPrice = await web3?.eth.getGasPrice();

      contract?.methods.calculateAIResult(MODEL_ID, `*${query}*`).send({
        from: accounts[0],
        value: estimated_fees?.toString(),
        gasPrice: gasPrice?.toString()
      }).on('confirmation', async function (receipt) {

        setLoadingMsg("Checking NFT creation");

        while (true) {
          const result: any = await contract?.methods.getAIResult(MODEL_ID, `*${query}*`).call({ from: accounts[0] });
          console.log(result);
          if (result !== "") {
            setWifu(result);
            setState("zkp")
            break;
          }
          await sleep(2000);
        }
  
        setLoading(false);
      }).on("error", ()=>{
        setLoading(false);
      })
    }

    catch (e: any) {
      console.log(e)
    }


  }


  return (
    <div className="container mx-auto mt-4 ">


      {
        state === "start" &&
        (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-red-500 text-xl">Please Generate an NFT to view.</p>
          </div>
        )

      }

      {
        (state === "zkp" || state === "mint") &&
        (
          <div className="">
            <CardContainer className="inter-var w-[500px] h-[500px]">
              <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border ">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  Great Choice!
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  {query.slice(0, 30)}...
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-4">
                  <Image
                    src={`https://ipfs.io/ipfs/${wifu}`}
                    height="1000"
                    width="1000"
                    className="h-70 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                    alt="thumbnail"
                    layout="intrinsic"

                  />
                </CardItem>
                <div className="flex justify-between items-center mt-20">
                  <CardItem
                    translateZ={20}
                    as={Link}
                    href={`https://ipfs.io/ipfs/${wifu}`}
                    target="__blank"
                    className="px-4 py-2 rounded-xl font-normal dark:text-white text-md"
                  >
                    View
                  </CardItem>

                  <button onClick={state === "mint" ? mint : generateZKP} className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-md font-bold">
                    {state === "mint" ? "Mint Wifu" : "Generate ZKP"}
                  </button>
                </div>
              </CardBody>
            </CardContainer>
          </div>
        )
      }


      <form
        className="fixed bottom-0 left-0 right-0 mb-[1rem] text-center p-4 overflow-hidden rounded-lg mx-auto w-[80%] border  focus-within:ring-1"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter query"
          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center p-3 pt-0 ">
          <Button
            size="sm"
            className="ml-auto gap-1.5"
            onClick={generateWifu}
            disabled={web3 === null ? true : false}
          >
            Generate NFT
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateNFT;
