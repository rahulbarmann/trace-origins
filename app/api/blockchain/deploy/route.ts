import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { getCurrentUser } from "@/lib/auth";
import { getWallet } from "@/lib/blockchain";

// Simple traceability storage contract
const CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TraceabilityStorage {
    struct Record {
        string metadataCid;
        uint256 timestamp;
        address submitter;
    }
    
    mapping(bytes32 => Record) public records;
    
    event RecordStored(
        bytes32 indexed recordHash,
        string metadataCid,
        uint256 timestamp,
        address indexed submitter
    );
    
    function storeRecord(bytes32 recordHash, string memory metadataCid) public {
        require(records[recordHash].timestamp == 0, "Record already exists");
        
        records[recordHash] = Record({
            metadataCid: metadataCid,
            timestamp: block.timestamp,
            submitter: msg.sender
        });
        
        emit RecordStored(recordHash, metadataCid, block.timestamp, msg.sender);
    }
    
    function getRecord(bytes32 recordHash) public view returns (
        string memory metadataCid,
        uint256 timestamp,
        address submitter
    ) {
        Record memory record = records[recordHash];
        return (record.metadataCid, record.timestamp, record.submitter);
    }
    
    function recordExists(bytes32 recordHash) public view returns (bool) {
        return records[recordHash].timestamp != 0;
    }
}
`;

// Pre-compiled bytecode for the contract above
const BYTECODE =
    "0x608060405234801561001057600080fd5b50610567806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806313f44d1014610046578063a87430ba14610062578063c82655b6146100a5575b600080fd5b610060600480360381019061005b91906102e9565b6100c1565b005b61007c60048036038101906100779190610345565b610181565b60405161008c9493929190610411565b60405180910390f35b6100bf60048036038101906100ba9190610345565b610257565b005b600080838152602001908152602001600020600201546000146100e357600080fd5b6040518060600160405280838152602001428152602001336001600160a01b031681525060008085815260200190815260200160002060008201518160000190816101309190610466565b506020820151816001015560408201518160020160006101000a8154816001600160a01b0302191690836001600160a01b03160217905550905050505050565b6000602052806000526040600020600091509050806000018054610193906103e0565b80601f01602080910402602001604051908101604052809291908181526020018280546101bf906103e0565b801561020c5780601f106101e15761010080835404028352916020019161020c565b820191906000526020600020905b8154815290600101906020018083116101ef57829003601f168201915b5050505050908060010154908060020160009054906101000a90046001600160a01b0316905083565b60008082815260200190815260200160002060010154600014155b919050565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261027c57600080fd5b813567ffffffffffffffff8082111561029757610297610256565b604051601f8301601f19908116603f011681019082821181831017156102bf576102bf610256565b816040528381528660208588010111156102d857600080fd5b836020870160208301376000602085830101528094505050505092915050565b6000806040838503121561030c57600080fd5b82359150602083013567ffffffffffffffff81111561032a57600080fd5b6103368582860161026c565b9150509250929050565b60006020828403121561035257600080fd5b5035919050565b6000815180845260005b8181101561037f57602081850181015186830182015201610363565b506000602082860101526020601f19601f83011685010191505092915050565b6001600160a01b03169052565b6020815260006103bf6020830184610359565b9392505050565b6000602082840312156103d857600080fd5b5051919050565b600181811c908216806103f457607f821691505b60208210810361041457634e487b7160e01b600052602260045260246000fd5b50919050565b60808152600061042d6080830187610359565b6020830195909552506001600160a01b039290921660408301526060909101529392505050565b601f82111561046157600081815260208120601f850160051c8101602086101561047b5750805b601f850160051c820191505b8181101561049a57828155600101610487565b505050505050565b815167ffffffffffffffff8111156104bc576104bc610256565b6104d0816104ca84546103e0565b84610454565b602080601f83116001811461050557600084156104ed5750858301515b600019600386901b1c1916600185901b17855561049a565b600085815260208120601f198616915b8281101561053457888601518255948401946001909101908401610515565b50858210156105525787850151600019600388901b60f8161c191681555b5050505050600190811b0190555056fea264697066735822122000000000000000000000000000000000000000000000000000000000000000000064736f6c63430008130033";

const ABI = [
    "event RecordStored(bytes32 indexed recordHash, string metadataCid, uint256 timestamp, address indexed submitter)",
    "function storeRecord(bytes32 recordHash, string memory metadataCid) public",
    "function getRecord(bytes32 recordHash) public view returns (string memory metadataCid, uint256 timestamp, address submitter)",
    "function recordExists(bytes32 recordHash) public view returns (bool)",
];

export async function POST() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const wallet = getWallet();

        console.log("Deploying TraceabilityStorage contract...");
        console.log("Deployer address:", wallet.address);

        const factory = new ethers.ContractFactory(ABI, BYTECODE, wallet);
        const contract = await factory.deploy();

        console.log(
            "Deployment transaction:",
            contract.deploymentTransaction()?.hash
        );

        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();

        console.log("Contract deployed at:", contractAddress);

        return NextResponse.json({
            success: true,
            contractAddress,
            transactionHash: contract.deploymentTransaction()?.hash,
            message: `Contract deployed! Add STORAGE_CONTRACT_ADDRESS=${contractAddress} to your .env file`,
            contractSource: CONTRACT_SOURCE,
        });
    } catch (error) {
        console.error("Contract deployment error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to deploy contract",
            },
            { status: 500 }
        );
    }
}
