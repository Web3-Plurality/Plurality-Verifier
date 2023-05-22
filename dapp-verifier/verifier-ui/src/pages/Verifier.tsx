import { useRef, useState } from 'react';
import '../bootstrap.css';
import { createGroup, addMemberToGroup } from '../utils/Web3Client';
import mortgage from '../images/mortgage.png';
import { sleep } from "../utils/SleepUtil";
import { fetchIdentityCommitmentFromExtension } from '../utils/ExtensionUtil';
const Verifier = () => {

  const [textAreaValue, setTextAreaValue] = useState("Results");

  const logoRef=useRef<HTMLImageElement>(null);

  let identityCommitment: string | undefined;
  let message: string;

  async function createUserIdentity() {
    identityCommitment = await fetchIdentityCommitmentFromExtension();
    if (identityCommitment === "" || identityCommitment === null) {
      console.log("Error: The extension did not return a valid identity commitment.");
      return;
    }
    
    message = message + `Step 3/4 Complete: Your identity material has been generated inside the extension. Please keep it safe and private \n
    Public Commitment shared by the extension is: ${identityCommitment} \n \n
    Step 4/4 Started: Adding generated identity to a group on smart contract in a privacy-preserving manner \n
    * Verifier creates a group on the semaphore zk smart contract \n
    * Verifier adds the public material of the generated identity to the group \n
    * After the above two steps, user will now be able to prove his group membership in zero-knowledge way \n`;
    setTextAreaValue(message);
    await sleep(5000);
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
            <img src={mortgage} ref={logoRef} alt={"None"} style={{width: '50px', height: '50px' }} />
            <h1 className="display-6 text-center"> &nbsp; Verifier for Mortgage Loans DApp</h1>
          </div>
          <br/>
          <h4 className="text-center">Scan the QR code to connect to verifier and provide proof details</h4>
          <p>Proof Required: Information from Identity Card  </p>
          <button onClick={createUserIdentity} type="button" className="btn btn-primary me-md-2" data-bs-toggle="button">Generate New Proof Invitation</button>
          <br/> <br/>
          <textarea className="form-control" rows={12} value={textAreaValue} aria-label="Disabled input example" disabled readOnly></textarea>
        </div>
      );
}

export default Verifier;