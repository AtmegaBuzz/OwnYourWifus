import { useEffect, useState } from 'react'
import './App.css'
import { initialize, ZoKratesProvider } from "zokrates-js";


function App() {
  const [zk, setZK] = useState<ZoKratesProvider | null>(null);


  const initializeZoK = async ()=>{
    let zok = await initialize();
    setZK(zok);
  }


  const computeWitness = async () => {

    const artifacts = zk?.compile()

  }


  useEffect(()=>{
    initializeZoK();
  },[])

  return (
    <>
      <button className="p-10 bg-gray-300">
        Generate Proof
      </button>
    </>
  )
}

export default App
