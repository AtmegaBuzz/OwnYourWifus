import {atom} from "jotai";
import Web3, { Contract } from "web3";

export const web3Atom = atom<Web3 | null>(null);
export const contractAtom = atom<Contract<any> | null>(null);
export const loadingAtom = atom(false);
export const loadingMessage = atom("loading");