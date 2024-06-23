import { useEffect, useState } from 'react'
import './App.css'
import Web3, { Contract, ContractAbi } from 'web3';
import {ABI} from "./abi";

function App() {

  const contractAddress = '0x114DA3723Bcdfdd8023cE61402505969cf7DEc4d';

  
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<Contract<ContractAbi> | null>(null);

  

  const connectMetaMask = async () => {

    if (window.ethereum) {
      await window.ethereum.request({method: "eth_requestAccounts"});
      const web3l = new Web3(window.ethereum);

      const contractl = new web3l.eth.Contract(ABI, contractAddress);

      setWeb3(web3l);
      setContract(contractl);
    }

    else {
      alert("Please install metamask!")
    }

  }

  const generateProof = async () => {

    const body = {
      owner: "0x375C11FD30FdC95e10aAD66bdcE590E1bccc6aFA",
      prompt: "a green cow",
      uri: "ipfs://qwieqweoqweiqweeqwe",
      token_id: "1",
      model_id: "50",
      model_addr: "0x375C11FD30FdC95e10aAD66bdcE590E1bccc6aFA"
    }

    const resp = await fetch(
      "http://localhost:3000/api/generate-proof/",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const proof = await resp.json()

    console.log(proof)


    const accounts = await web3?.eth.getAccounts();

    if (accounts === undefined) {
      return;
    }

    const result = await contract?.methods.verifyTx(proof.proof,proof.inputs).call({from: accounts[0]});

    console.log(result);

  }
  

  useEffect(()=>{
    connectMetaMask();
  },[])

  return (
    <>
      <button className="p-10 bg-gray-300" onClick={generateProof}>
        Generate Proof
      </button>
    </>
  )
}

export default App
