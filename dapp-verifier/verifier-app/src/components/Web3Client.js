/* global BigInt */

import Web3 from 'web3'
import SemaphoreIdentity from '../SemaphoreIdentity.json';
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import { formatBytes32String } from "ethers/lib/utils"
import { ethers } from "ethers";
import { Identity } from "@semaphore-protocol/identity";

let selectedAccount;
let semaphoreIdentityContract;
let signer;
let network;
let isInitialized = false;
let merkleTreeDepth = 20;
const signal = formatBytes32String("Hello");
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
      //console.log(group.members);
      //console.log(group.members.length);
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
      console.log("Identity commitment added:");
      console.log(json);
    });
}

export const createGroup = async () => {
    if (!isInitialized) {
      await init();
    }
    semaphoreIdentityContract.methods.groups(groupId).call({ from: process.env.REACT_APP_SEMAPHORE_IDENTITY_CONTRACT }, async function (error, result) {
      console.log(result);
      if (result[0] === "0x0000000000000000000000000000000000000000")
      {
        console.log("Group does not exist on chain. Creating now");
        const tx = await semaphoreIdentityContract.methods.createGroup(groupId,merkleTreeDepth,signer.address);
        const receipt = tx
        .send({
        from: signer.address,
        gas: await tx.estimateGas(),
        })
        .once("transactionHash", (txhash) => {
          console.log(`Mining transaction ...`);
          console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        });

        // The transaction is now on chain!
        console.log(`Mined in block ${receipt.blockNumber}`);
        return receipt;
      }
      else {
        console.log("Group exists on chain. Not creating on chain");
        return "";
      }
    });
    
  };

  export const addMemberToGroup = async (identityCommitment) => {
    if (!isInitialized) {
      await init();
    }
    await addToGroupState(groupId, identityCommitment);
    identityCommitment = BigInt(identityCommitment);
    console.log("Adding member to group");
    
    const tx = semaphoreIdentityContract.methods.addMember(groupId,identityCommitment);
    const receipt = await tx
    .send({
      from: signer.address,
      //TODO: Check why the estimateGas function doesnt work here.
      gas: ethers.utils.parseUnits("9000000", "wei"),
      //gas: await tx.estimateGas()
    })
    .once("transactionHash", (txhash) => {
      console.log(`Mining transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
    // The transaction is now on chain!
    console.log(`Mined in block ${receipt.blockNumber}`);
    
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
    document.dispatchEvent(new CustomEvent('receive_proof_request_from_web_page', {detail: obj}));

  };

  export const verifyMemberIsPartOfGroup = async (identity) => {
    console.log(`HERE ${identity}`);

    if (!isInitialized) {
      await init();
    }
    //group.addMember(identity.commitment);
    //TODO: Test with merkel proof instead of group

    const fullProof = await generateProof(identity, window.group, window.groupId, signal);

    console.log(`MerkleTreeRoot: ${fullProof.merkleTreeRoot} \n
    NullifierHash: ${fullProof.nullifierHash} \n
    ExternalNullifier: ${fullProof.externalNullifier} \n
    Proof: ${fullProof.proof}`)

    return semaphoreIdentityContract.methods
      .verifyProof(window.groupId, fullProof.merkleTreeRoot, signal, fullProof.nullifierHash, window.groupId, fullProof.proof)
      .send({from: selectedAccount})
  };

