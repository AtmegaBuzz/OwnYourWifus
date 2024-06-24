// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/IAIOracle.sol";
import "./AIOracleCallbackReceiver.sol";
import "./verifier.sol";
import "./IERC7007.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


// this contract is for ai.ora.io website
contract ERC7007 is AIOracleCallbackReceiver, ERC721, ERC721URIStorage {

    event promptsUpdated(
        uint256 requestId,
        uint256 modelId,
        string input,
        string output,
        bytes callbackData
    );

    event promptRequest(
        uint256 requestId,
        address sender, 
        uint256 modelId,
        string prompt
    );

    struct AIOracleRequest {
        address sender;
        uint256 modelId;
        bytes input;
        bytes output;
    }


    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }



    // requestId => AIOracleRequest
    mapping(uint256 => AIOracleRequest) public requests;

    // modelId => callback gasLimit
    mapping(uint256 => uint64) public callbackGasLimit;


    // ZKML Verifier contract 
    Verifier public verifier;

    uint256 private _nextTokenId;

    


    /// @notice Initialize the contract, binding it to a specified AIOracle.
    constructor(IAIOracle _aiOracle) AIOracleCallbackReceiver(_aiOracle) ERC721("MyToken", "MTK") {
        callbackGasLimit[50] = 500_000; // SD 500k
        callbackGasLimit[11] = 5_000_000; // llama
        callbackGasLimit[9] = 5_000_000; // grok

        verifier = new Verifier();
    }


    function setCallbackGasLimit(uint256 modelId, uint64 gasLimit) external onlyOwner {
        callbackGasLimit[modelId] = gasLimit;
    }

    // uint256: modelID => (string: prompt => string: output)
    mapping(uint256 => mapping(string => string)) public prompts;

    function getAIResult(uint256 modelId, string calldata prompt) external view returns (string memory) {
        return prompts[modelId][prompt];
    }

    // the callback function, only the AI Oracle can call this function
    function aiOracleCallback(uint256 requestId, bytes calldata output, bytes calldata callbackData) external override onlyAIOracleCallback() {
        // since we do not set the callbackData in this example, the callbackData should be empty
        AIOracleRequest storage request = requests[requestId];
        require(request.sender != address(0), "request not exists");
        request.output = output;
        prompts[request.modelId][string(request.input)] = string(output);
        emit promptsUpdated(requestId, request.modelId, string(request.input), string(output), callbackData);
    }

    function estimateFee(uint256 modelId) public view returns (uint256) {
        return aiOracle.estimateFee(modelId, callbackGasLimit[modelId]);
    }

    function calculateAIResult(uint256 modelId, string calldata prompt) payable external {
        bytes memory input = bytes(prompt);
        // we do not need to set the callbackData in this example
        uint256 requestId = aiOracle.requestCallback{value: msg.value}(
            modelId, input, address(this), callbackGasLimit[modelId], ""
        );
        AIOracleRequest storage request = requests[requestId];
        request.input = input;
        request.sender = msg.sender;
        request.modelId = modelId;
        emit promptRequest(requestId, msg.sender, modelId, prompt);
    }

    function safeMint(
        address to,
        uint[5] memory input, 
        Verifier.Proof memory proof
    ) external returns (uint256 tokenId) {
        // Implement your minting logic here
        require(verifier.verifyTx(proof, input), "Verification failed");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        return tokenId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


}
