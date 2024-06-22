// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x186eb59107c96a0d1f57bcedb39403ff8af8e1d4cc29afb6d93cb78e22ca3be8), uint256(0x21fa0c5ccfed585eec7c3be9002ca30257ec0a7a481ec71b4ee85d6db79c84e9));
        vk.beta = Pairing.G2Point([uint256(0x0257b1a95374f4f44888e2512885f35382398d4b725900d1dab37933e87ef02d), uint256(0x11209fb43690e2efa9468255358bd85ebf63292d19e2911167e1623f1f0fd8db)], [uint256(0x1959802d07825d2dea40b4f25839041e60d6364c3bead0fc24d215bef8087826), uint256(0x04f8cb00662720f9e2011101a1ae94937ac4b354ee65cab6c4a102d8aebeb1a2)]);
        vk.gamma = Pairing.G2Point([uint256(0x04f8821022b012cfc71dbc7c67838175101b3f39860ee65fede23dde6a077526), uint256(0x1981c8f6c2ceacd8ec3f3b66a8e94ee109a8daf0e6a0ff0990e0225128745cf7)], [uint256(0x0f75181c01080f93595340481db006dc9efa9e0f83be87b95b26c3a39ee382ae), uint256(0x2220f18102e9eeeeb07022678df288a47040d2d3700b6f3e70370335f3e944fc)]);
        vk.delta = Pairing.G2Point([uint256(0x2f0ccfa189ce4c419056598b05c252ca34726c0be8d2734f0751f02aeed0ef50), uint256(0x10b1c29189536f4e3c28595ade193583fe1822abdf1489ea0d8df75b8601dbaa)], [uint256(0x20e1825e639a894a5ca178c2f52254ea24a87d79df08f13e6595cfa569a2345b), uint256(0x169075f39529bc33e76cc90ef0bd8839030b995f53bd57d14cd4690fd41043d4)]);
        vk.gamma_abc = new Pairing.G1Point[](8);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x13f44246fef37fd109a25a83fcd7f3b0f4cbc8acd4fda4b675dcd2599b758ab1), uint256(0x1ade9137ac38c5dc8cca4f4be21e13ec11e103942166551b9f6d3b40e6046e5a));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x0e56f3f4567efd41fc81f677f9d3ed69b5ad8089d8ed25d2b105b5c7b233c4cf), uint256(0x179a8e0cb98220071d40ee9653a6122ee8e8aa1f2c1d80645d7663425b342c2d));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x0a0a8bb16f9c21753475469aabd499cc61751e154546f19ba06c085afd127898), uint256(0x01ca0081267b86e39d6b50f0f6c5e6b570ed4efcee79f48bf47c8a5a45ab57df));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x27085f150d676f86de931a3a4cee2ca775eb5be76bae4bd1e1674ea91c7cc593), uint256(0x1cfb67ddc10c3c94b6d1139e54effd1eed0cfc9d2546a19f5897714e14f23ced));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x14cd112bc64ed12d05ad037b258ebd0a87bfedc693eed8abf655916444575d46), uint256(0x05f3e334c4feb44486b56d0a41545c6f0ff1bf28dfa23b46fbe73bf5e4f6b521));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x22b219b43135b90a9bb127652fbab6e016c03937f1524f1cdae5c1f4595de238), uint256(0x0c57d121caa23158db41f616fa45c84916b1587de7fac31d5feae419050edfdd));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x0baf776be208b9fab6df5bc80b1a4e51217a399e372f77f26a165fcf3b4d969b), uint256(0x010fb8e584dca6f7ece7a6e076c178317c810623c371297546dca1551ad61c4e));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x0fe6ac47bdbfdfb7e294bef311445d1ad7739c241379da134869dc255c62f5d2), uint256(0x1e564e1d129609879eed1f975b9107f72b18fef759e4535d1ae3eb3ae77428d0));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[7] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](7);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
