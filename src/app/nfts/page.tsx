"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CornerDownLeft } from "lucide-react";
import abi from "../../utils/DealClient.json";
import Web3 from "web3";
import { useSearchParams } from "next/navigation";
import { useAtom } from "jotai";
import { contractAtom, loadingAtom, loadingMessage, web3Atom } from "@/atoms/global";


const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const createNFT = () => {

  const [query, setQuery] = useState("");
  const [wifu, setWifu] = useState("");
  const [state, setState] = useState("start");

  const [contract,] = useAtom(contractAtom);
  const [web3,] = useAtom(web3Atom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [loadingMsg, setLoadingMsg] = useAtom(loadingMessage);




  const generateWifu = async () => {

    try {

      setLoadingMsg("Generating NFT on ORA");
      setLoading(true);

      const MODEL_ID = process.env.NEXT_PUBLIC_MODEL_ID as string

      console.log(MODEL_ID, "model");

      const accounts = await web3?.eth.getAccounts()!;


      const estimated_fees = await contract?.methods.estimateFee(MODEL_ID).call({ from: accounts[0] })
      const gasPrice = await web3?.eth.getGasPrice();

      setLoadingMsg("Checking NFT creation");
      while (true) {
        const result: any = await contract?.methods.getAIResult(MODEL_ID, `*${query}*`).call({ from: accounts[0] });
        console.log(result);
        if (result !== "") {
          setWifu(result);
          break;
        }
        await sleep(2000);
      }

      setLoading(false);

      // contract?.methods.calculateAIResult(MODEL_ID, `*${query}*`).send({
      //   from: accounts[0],
      //   value: estimated_fees?.toString(),
      //   gasPrice: gasPrice?.toString()
      // }).on('confirmation', async function (receipt) {


      //   setLoading(false);
      // }).on("error", ()=>{
      //   setLoading(false);
      // })
    }

    catch (e: any) {
      console.log(e)
    }


  }


  return (
    <div className="container mx-auto mt-4 ">
      <div className="message-container bg-[#151518] border  rounded-sm bg-background  max-h-90 overflow-y-auto p-6">
        <img src={`https://ipfs.io/ipfs/Qme9PptWmw9c4uuerPn2gBRaR7uHow97i5Xg1d47Vp5WHn`} alt="" />
      </div>
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

export default createNFT;
