import { Group } from "@semaphore-protocol/group"


// VERIFIER API GET CALL
// /group/groupId -> send groupId and get list of all identity commitments
export const getCurrentGroupState = async () => {
    //TODO: Check if the current identity commitment is already in db
    const groupId = process.env.REACT_APP_GROUP_ID;
    
    let identityCommitmentsList = await fetch(
      process.env.REACT_APP_API_BASE_URL+'/group/'+groupId, {
          method: "get",
          headers: {
              'Content-Type': 'application/json'
          }
      }).then(response => response.json())
      .then(json => {
        const identityCommitments = json.identityCommitments;
        console.log("Identity commitments retrieved from database: "+json.identityCommitments);
        console.log(json.identityCommitments.length);
        let group = new Group(groupId);
        group.addMembers(json.identityCommitments);
        return identityCommitments;
      }).catch(error => {
        console.log(error);
        return error;
      });
      return identityCommitmentsList;
  }

  // VERIFIER API POST CALL
  // /group -> send groupId and commitment in body to add this commitment in the list of identitycommitments against this group
  export const addToGroupState = async (groupId, identityCommitment) => {
    const sendBody = JSON.stringify({ "groupId": groupId, "identityCommitment": identityCommitment });
    await fetch(
      process.env.REACT_APP_API_BASE_URL+'/group', {
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
  
  // TODO: Discuss what happens if the user uses the same ZK Proof again and again
  // Should we block the call or silently handle the error?
  
  // VERIFIER API POST CALL
  // /identity -> send commitment, bcaddress and zk proof to add in the list of verified identities
  export const addVerifiedIdentity = async (identityCommitment, blockchainAddress, fullProof) => {
    const sendBody = JSON.stringify({ "commitment": identityCommitment, "blockchainAddress": blockchainAddress, "zkProof": JSON.stringify(fullProof) });
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