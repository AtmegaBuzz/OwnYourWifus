"use client";
import { useAtom } from "jotai";
import { contractAtom, loadingMessage, web3Atom } from "@/atoms/global";


export default function Spinner() {

    const [loaderMsg, _] = useAtom(loadingMessage);

    return (
        <div className="w-[100vw] h-[100vh] fixed flex justify-center items-center bg-black bg-opacity-50 z-[100]">
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
                    <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin">
                    </div>
                </div>
                <p className="mt-10 text-white font-bold">{loaderMsg}...</p>
            </div>
        </div>
    );
}