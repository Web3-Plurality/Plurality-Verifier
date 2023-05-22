/* global BigInt */
// Do not remove the above pragma, it is used for accessing the BigInt conversion functions

import Web3 from 'web3';

import SemaphoreIdentity from '../SemaphoreIdentity.json';
import { ethers } from "ethers";
import { fetchVerificationProofFromExtension } from "./ExtensionUtil";
import { getCurrentGroupState, addToGroupState, addVerifiedIdentity } from "./VerifierAPIUtil";
import { requestPersonalSignOnProof } from "./PersonalSignUtil";
import { Contract } from 'web3-eth-contract';
import { Account } from 'web3-core';

let semaphoreIdentityContract: Contract;
let signer: Account;
let network: string;
let isInitialized = false;
let merkleTreeDepth = 20;
const signal = 1;
const groupId:string = process.env.REACT_APP_GROUP_ID!;

export const init = async () => {

  // FOR INFURA
  network = process.env.REACT_APP_ETHEREUM_NETWORK!;
  console.log("Network is: " + network);
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`
    )
  );
  // Creating a signing account from a private key
  signer = web3.eth.accounts.privateKeyToAccount(
    process.env.REACT_APP_SIGNER_PRIVATE_KEY!
  );
  web3.eth.accounts.wallet.add(signer);
  console.log(SemaphoreIdentity.abi);
  const abi: any = SemaphoreIdentity.abi;
  semaphoreIdentityContract = new web3.eth.Contract(abi,process.env.REACT_APP_SEMAPHORE_IDENTITY_CONTRACT); //contract address at sepolia
  console.log(semaphoreIdentityContract);
  isInitialized = true;
};



export const createGroup = async () => {
    if (!isInitialized) {
      await init();
    }
    console.log("Checking if the group id already exists on chain");
    const doesGroupExist = await semaphoreIdentityContract.methods.groups(groupId).call({ from: process.env.REACT_APP_SEMAPHORE_IDENTITY_CONTRACT });
    console.log("Does Group Exist?");
    console.log(doesGroupExist);
    if (doesGroupExist[0] === "0x0000000000000000000000000000000000000000")
      {
        console.log("Group does not exist on chain. Creating now");
        const tx = await semaphoreIdentityContract.methods.createGroup(groupId,merkleTreeDepth,signer.address);
        const receipt = tx
        .send({
        from: signer.address,
        gas: await tx.estimateGas(),
        })
        .once("transactionHash", (txhash: any) => {
          console.log(`Mining createGroup transaction ...`);
          console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        });

        // The transaction is now on chain!
        console.log(`createGroup Mined in block ${receipt.blockNumber}`);
        return receipt;
      }
      else {
        console.log("Group already exists on chain so not creating again");
        return "GROUP_ALREADY_EXISTS";
      }
  };

  export const addMemberToGroup = async (identityCommitment: any) => {
    if (!isInitialized) {
      await init();
    }
    await addToGroupState(groupId, identityCommitment);
    //console.log(typeof(identityCommitment));
    identityCommitment = BigInt(identityCommitment);
    //console.log(typeof(identityCommitment));

    console.log("Adding member to group");
    
    console.log("groupId: "+ groupId);
    console.log("identityCommitment: "+ identityCommitment);

    const tx = semaphoreIdentityContract.methods.addMember(groupId,identityCommitment);
    
    const receipt = await tx
    .send({
      from: signer.address,
      //TODO: Check why the estimateGas function doesnt work here.
      gas: ethers.utils.parseUnits("9100000", "wei"),
      //gas: await tx.estimateGas(),
    })
    .once("transactionHash", (txhash: any) => {
      console.log(`Mining addMemberToGroup transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
    // The transaction is now on chain!
    console.log(`addMemberToGroup Mined in block ${receipt.blockNumber}`);
    
    return receipt;
  };

  export const sendGroupStateToPlurality = async () => {

    if (!isInitialized) {
      await init();
    }
    let identityCommitmentsList = await getCurrentGroupState();

    var obj = {
      title: process.env.REACT_APP_DAPP_PROOF_NAME, 
      identityCommitments: identityCommitmentsList, 
      groupId: groupId
    }
    console.log("Dispatching event for proof request with obj");
    console.log(obj);

    let { fullProof, identityCommitment } = await fetchVerificationProofFromExtension(obj);
    console.log("Full proof is: "+ fullProof);
    console.log("Identity commitment is: "+ identityCommitment);

    // TODO: This personal sign needs to be done when identity is created
    // not when the proof is created
    const proverEthAddress: string | undefined = await requestPersonalSignOnProof(fullProof);

    // need to store in the database which identity commitment corresponds to which blockchain address and which zk proof
    await addVerifiedIdentity(identityCommitment, proverEthAddress!, fullProof);
    
    const receipt = await verifyZKProofSentByUser(fullProof);
    console.log("Receipt is: ");
    console.log(receipt);
    return receipt;
  };

  export const verifyZKProofSentByUser = async (fullProof: any) => {

    if (!isInitialized) {
      await init();
    }
    if (fullProof === "" || fullProof === null) {
      console.log("Error: Got empty proof in verify ZK Proof function. Returning");
      return;
    }
    console.log("Sending proof to SC: "+ fullProof);
    console.log("GroupId: "+groupId);
    console.log("MerkleTreeRoot: "+fullProof.merkleTreeRoot);
    console.log("Signal: "+signal);
    console.log("NullifierHash: "+fullProof.nullifierHash);
    console.log("Proof: "+fullProof.proof);

    const tx = semaphoreIdentityContract.methods
              .verifyProof(groupId, fullProof.merkleTreeRoot, signal, fullProof.nullifierHash, groupId, fullProof.proof);

    const receipt = await tx
    .send({
      from: signer.address,
      gas: await tx.estimateGas()    
    })
    .once("transactionHash", (txhash: any) => {
      console.log(`Mining verifyZKProofSentByUser transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
    // The transaction is now on chain!
    console.log(`verifyZKProofSentByUser Mined in block ${receipt.blockNumber}`);
    
    if (receipt.events.ProofVerified) 
    {
      console.log("Proof is valid. Returning true");
      return true;
    }
    else 
    {
      console.log("Proof is invalid. Returning false");
      return false;
    }
  };