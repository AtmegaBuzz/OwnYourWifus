"use client"
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button"

import React from 'react'
import { useState } from "react"
import { useAtom } from 'jotai';
import { contractAtom, web3Atom } from '@/atoms/global';
import Web3 from 'web3';
import { ABI } from '@/abi';




const Connect = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [web3, setWeb3] = useAtom(web3Atom);
  const [_, setContract] = useAtom(contractAtom);

  
  const connectWallet = async function connectWallet() {
    
    if (web3 === null) {
      const web3 = new Web3(window.ethereum);
      const contractl = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string);

      
      const accounts = await web3?.eth.getAccounts();
      
      console.log(accounts[0])
      setWalletAddress(accounts[0]);
      setContract(contractl);
      setWeb3(web3);
    }
  }

  return (
    <div>
      <div>
        {!walletAddress ? (
          <Button type="button" className='rounded-full' onClick={connectWallet}>Connect Wallet</Button>
        ) : (
          <Button type="button" className='rounded-full'>Connected</Button>
        )}
      </div>
    </div>
  )
}

export default Connect
