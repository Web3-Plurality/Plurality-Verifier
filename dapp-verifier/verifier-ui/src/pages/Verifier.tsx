import { useRef, useState, useEffect } from 'react';
import '../bootstrap.css';
import { createGroup, addMemberToGroup } from '../utils/Web3Client';
import people from '../images/people.png';
import { sleep } from "../utils/SleepUtil";
import { fetchIdentityCommitmentFromExtension } from '../utils/ExtensionUtil';
import { requestPersonalSignOnIdentityCommitment } from '../utils/PersonalSignUtil';
import { addVerifiedIdentity } from "../utils/VerifierAPIUtil";


const Verifier = () => {

  const [textAreaValue, setTextAreaValue] = useState("Results");

  const logoRef=useRef<HTMLImageElement>(null);

  let identityCommitment: string | undefined;
  let message: string = "";
  let dAppName: string = process.env.REACT_APP_DAPP_NAME!;
  let username: string;
  let display_name: string;

  useEffect(() => {
        // get the proof request params for this popup
        const params = new URLSearchParams(window.location.search)
        username = params.get('username')!;
        display_name = params.get('display_name')!;
    message = message + `Step 1/4 Complete: Successfully verified social identity from Twitter account \nUsername: ${username} \nName: ${display_name} \n`;
    setTextAreaValue(message);
    }, [])

  async function createUserIdentity() {
    identityCommitment = await fetchIdentityCommitmentFromExtension();
    if (identityCommitment === "" || identityCommitment === null) {
      console.log("Error: The extension did not return a valid identity commitment.");
      return;
    }
    const params = new URLSearchParams(window.location.search)
    username = params.get('username')!;
    display_name = params.get('display_name')!;
    message = message + `Step 1/4 Complete: Successfully verified social identity from Twitter account \nUsername: ${username} \nName: ${display_name} \n`;
    message = message + `Step 2/4 Complete: Your identity material has been generated inside the extension. Please keep it safe and private \n
    Public Commitment shared by the extension is: ${identityCommitment} \nStep 3/4 Started: Linking decentralized identifier to blockchain address \n`;
    setTextAreaValue(message);
    const proverEthAddress: string | undefined = await requestPersonalSignOnIdentityCommitment(identityCommitment!);
    // need to store in the database which identity commitment corresponds to which blockchain address and which zk proof
    await addVerifiedIdentity(identityCommitment!, proverEthAddress!, '');
    message = message + `Step 3/4 Complete: Linked decentralized identifier to blockchain address \n`;
    setTextAreaValue(message);
    message = message + `Step 4/4 Started: Adding generated identity to a group on smart contract in a privacy-preserving manner \n
    * Verifier creates a group on the semaphore zk smart contract \n
    * Verifier adds the public material of the generated identity to the group \n
    * After the above two steps, user will now be able to prove his group membership in zero-knowledge way \n`;
    setTextAreaValue(message);
    addZkProofToSemaphore();
  }

  async function addZkProofToSemaphore() {

    message = message + `Step 4/4 In Progress: Verifier is now creating the group\n`
    setTextAreaValue(message);

    try {
      const groupCreationReceipt = await createGroup();
      console.log(groupCreationReceipt);
      message = message + `Group creation complete. Verifier is now adding member to group with commitment: ${identityCommitment} \n`
      setTextAreaValue(message);

      const memberAdditionReceipt = await addMemberToGroup(identityCommitment);
      console.log(memberAdditionReceipt);
      message = message + `Step 4/4 Complete: User added to group. \n User can now request the DApp for verification by submitting a zero knowledge proof of membership of a group\n` 
      setTextAreaValue(message);
    } catch (err) {
      console.log(err);
      message = message + "An error occured while creating a group\n";
      setTextAreaValue(message)
    }
  }


    return (
        <div className="text-center">
          <br/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center"}}>
            <img src={people} ref={logoRef} alt={"None"} style={{width: '50px', height: '50px' }} />
            <h1 className="display-6 text-center"> &nbsp; {dAppName} Verifier</h1>
          </div>
          <br/>
          <h4 className="text-center">Link verified identity with Plurality's zero knowledge identity layer</h4>
          <p>Use Plurality Browser Extension to create a decentralized identifier and link it with Blockchain address</p> 
          <button onClick={createUserIdentity} type="button" style={{backgroundColor:'#DE3163', borderColor: '#DE3163', color:'#FFFFFF'}} className="btn btn-primary me-md-2" data-bs-toggle="button">Link your plural identity onchain</button>
          <br/> <br/>
          <textarea className="form-control" rows={12} value={textAreaValue} aria-label="Disabled input example" disabled readOnly></textarea>
        </div>
      );
}

export default Verifier;