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


  // FOR METAMASK
    /*let provider = window.ethereum;

    if (typeof provider !== 'undefined') {
    
    provider
    .request({method: 'eth_requestAccounts' })
    .then((accounts) => {
      selectedAccount = accounts[0];
      console.log(`Selected account is ${selectedAccount}`);
    })
    .catch((err) => {
      console.log(err);
    });
    window.ethereum.on('accountsChanged', function (accounts){
      selectedAccount = accounts[0];
      console.log(`Selected account changed to ${selectedAccount}`);
    });
  }
  const web3 = new Web3(provider);*/
  
  //THE FOLLOWING IS COMMON TO BOTH
  //const networkId = await web3.eth.net.getId();
  console.log(SemaphoreIdentity.abi);
  semaphoreIdentityContract = new web3.eth.Contract(SemaphoreIdentity.abi,process.env.REACT_APP_SEMAPHORE_IDENTITY_CONTRACT); //contract address at sepolia
  console.log(semaphoreIdentityContract);
  isInitialized = true;
};

export const getCurrentGroupState = async (groupId) => {
  fetch(
    'http://localhost:5000/identities?groupId='+groupId, {
        method: "get",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    .then(json => {
      console.log("Identity commitments retrieved: "+json.identityCommitments);
      group = new Group(groupId);
      group.addMembers(json.identityCommitments);
      console.log(group.members);
      return group.members;
    }).catch(error => {
      console.log(error);
    });
  
}
export const addToGroupState = async (groupId, identityCommitment) => {
  const sendBody = JSON.stringify({ "groupId": groupId, "identityCommitment": identityCommitment });
  fetch(
    'http://localhost:5000/identity', {
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
export const testGroupStorageToDatabase = async () => {

  const groupId = 2;
  const identity = new Identity();
  let result;
  //newGroup.addMember(identity.commitment);
  

    console.log("Now fetching the group state")

      //result = await result.toString();
      
  /*const sendBody = JSON.stringify({ "groupId": groupId, "groupState": newGroup });
  let result = await fetch(
    'http://localhost:5000/group', {
        method: "post",
        body: sendBody,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    result = await result.toString();
    console.warn(result);
    if (result) {
        alert(result);
    }

    console.log("Now fetching the group state")

    result = await fetch(
      'http://localhost:5000/group?groupId='+groupId, {
          method: "get",
          headers: {
              'Content-Type': 'application/json'
          }
      })
      result = await result.toString();
      console.warn(result);
      if (result) {
          alert(result);
      }*/

}
export const initGroupState = async () => {
  //groupId = process.env.REACT_APP_GROUP_ID;
  console.log(groupId);
  await getCurrentGroupState(groupId);
  console.log(group);
}

export const createGroup = async () => {
    if (!isInitialized) {
      await init();
    }
    console.log("HERE in createGroup");
    //await initGroupState();
    //const min = 1;
    //const max = 100000;
    //let rand = min + Math.floor(Math.random() * (max - min));

    //window.groupId = rand;
    //console.log("Creating group with id: "+ window.groupId);
    
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
    
  };

  export const addMemberToGroup = async (identityCommitment) => {
    if (!isInitialized) {
      await init();
    }
    await addToGroupState(groupId, identityCommitment);
    identityCommitment = BigInt(identityCommitment);
    console.log("Adding member to group");
    //console.log("Identity commitment: "+identityCommitment);

    //window.group = new Group(window.groupId);
    //window.group.addMember(identityCommitment);
    
    
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
    //TODO: Pick group from local storage
    
    const index = window.group.indexOf(identityCommitment) // 0
    console.log(index);
    const merkelProof = await window.group.generateMerkleProof(index);  
    console.log(merkelProof);  
    const proofPath = merkelProof.pathIndices;
    console.log(proofPath);
    const proofSiblings = merkelProof.siblings;
    console.log(proofSiblings);
    //window.group.removeMember(index);

    return semaphoreIdentityContract.methods
      .removeMember(window.groupId,identityCommitment, proofSiblings, proofPath)
      .send({from: selectedAccount})
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

