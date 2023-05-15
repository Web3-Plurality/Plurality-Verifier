/* global BigInt */

import Web3 from 'web3'
import SemaphoreIdentity from '../SemaphoreIdentity.json';
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import { formatBytes32String } from "ethers/lib/utils"
import { ethers } from "ethers";
import { sleep } from "../utils/SleepUtil";

let selectedAccount;
let semaphoreIdentityContract;
let signer;
let network;
let isInitialized = false;
let merkleTreeDepth = 20;
const signal = 1;
let group;
let identityCommitmentsList;
const groupId = process.env.REACT_APP_GROUP_ID;

export const init = async () => {

  // FOR INFURA
  network = process.env.REACT_APP_ETHEREUM_NETWORK;
  console.log("Network is: " + network);
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`
    )
  );
  // Creating a signing account from a private key
  signer = web3.eth.accounts.privateKeyToAccount(
    process.env.REACT_APP_SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);
  console.log(SemaphoreIdentity.abi);
  semaphoreIdentityContract = new web3.eth.Contract(SemaphoreIdentity.abi,process.env.REACT_APP_SEMAPHORE_IDENTITY_CONTRACT); //contract address at sepolia
  console.log(semaphoreIdentityContract);
  isInitialized = true;
};

export const getCurrentGroupState = async () => {

  //TODO: Check if the current identity commitment is already in db
  await fetch(
    process.env.REACT_APP_API_BASE_URL+'/identities?groupId='+groupId, {
        method: "get",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    .then(json => {
      identityCommitmentsList = json.identityCommitments;
      console.log("Identity commitments retrieved from database: "+json.identityCommitments);
      console.log(json.identityCommitments.length);
      group = new Group(groupId);
      group.addMembers(json.identityCommitments);
      return group.members;
    }).catch(error => {
      console.log(error);
      return error;
    });
  
}
export const addToGroupState = async (groupId, identityCommitment) => {
  const sendBody = JSON.stringify({ "groupId": groupId, "identityCommitment": identityCommitment });
  await fetch(
    process.env.REACT_APP_API_BASE_URL+'/identity', {
        method: "post",
        body: sendBody,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    .then(json => {
      console.log("Identity commitment added to database:");
      console.log(json);
    });
}

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
        .once("transactionHash", (txhash) => {
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

  export const addMemberToGroup = async (identityCommitment) => {
    if (!isInitialized) {
      await init();
    }
    await addToGroupState(groupId, identityCommitment);
    console.log(typeof(identityCommitment));
    //identityCommitment = BigInt(identityCommitment);
    console.log(typeof(identityCommitment));

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
    .once("transactionHash", (txhash) => {
      console.log(`Mining addMemberToGroup transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
    // The transaction is now on chain!
    console.log(`addMemberToGroup Mined in block ${receipt.blockNumber}`);
    
    return receipt;
  };

  export const removeMemberFromGroup = async (identityCommitment) => {
    if (!isInitialized) {
      await init();
    }
    
    const index = window.group.indexOf(identityCommitment) // 0
    console.log(index);
    const merkelProof = await window.group.generateMerkleProof(index);  
    console.log(merkelProof);  
    const proofPath = merkelProof.pathIndices;
    console.log(proofPath);
    const proofSiblings = merkelProof.siblings;
    console.log(proofSiblings);
    //window.group.removeMember(index);

    //TODO: Fix the tx as per infura syntax
    return semaphoreIdentityContract.methods
      .removeMember(window.groupId,identityCommitment, proofSiblings, proofPath)
      .send({from: selectedAccount})
  };

  export const sendGroupStateToPlurality = async () => {

    if (!isInitialized) {
      await init();
    }
    await getCurrentGroupState();

    var obj = {
      title: "Plurality Verifier - Test dApp Proof ", 
      identityCommitments: identityCommitmentsList, 
      groupId: groupId
    }
    console.log("Dispatching event for proof request with obj");
    console.log(obj);

    localStorage.setItem("fullProof","");
    document.dispatchEvent(new CustomEvent('receive_proof_request_from_web_page', {detail: obj}));

    let fullProof = localStorage.getItem("fullProof");
    // wait until the user finishes up generating proof in extension
    while (fullProof === "")
    {
      await sleep (5000);
      fullProof = localStorage.getItem("fullProof");
    }
    fullProof = JSON.parse(fullProof);
    const receipt = await verifyZKProofSentByUser(fullProof);
    console.log("Receipt is: ");
    console.log(receipt);
    return receipt;
  };

  export const verifyZKProofSentByUser = async (fullProof) => {

    if (!isInitialized) {
      await init();
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
    .once("transactionHash", (txhash) => {
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

  export const verifyMemberIsPartOfGroup = async (identity) => {
    console.log(`HERE ${identity}`);

    if (!isInitialized) {
      await init();
    }

    const fullProof = await generateProof(identity, window.group, window.groupId, signal);

    console.log(`MerkleTreeRoot: ${fullProof.merkleTreeRoot} \n
    NullifierHash: ${fullProof.nullifierHash} \n
    ExternalNullifier: ${fullProof.externalNullifier} \n
    Proof: ${fullProof.proof}`)

    return semaphoreIdentityContract.methods
      .verifyProof(window.groupId, fullProof.merkleTreeRoot, signal, fullProof.nullifierHash, window.groupId, fullProof.proof)
      .send({from: selectedAccount})
  };

