import { sleep } from "./SleepUtil";

export const fetchIdentityCommitmentFromExtension = async () => {
    localStorage.setItem("commitment", "");
    const identityEventName: string = process.env.REACT_APP_IDENTITY_EVENT_NAME!;
    const dappName: string = process.env.REACT_APP_DAPP_PROOF_NAME!;
    if (identityEventName === "" || identityEventName === null) {
      console.log("Error: Could not find Identity Event Name. Please check if .env file exists");
      return;
    }
    if (dappName === "" || dappName === null) {
      console.log("Error: Could not find DApp Proof Name. Please check if .env file exists");
      return;
    }
    
    document.dispatchEvent(new CustomEvent(identityEventName, {detail: dappName}));

    let identityCommitment: string = localStorage.getItem("commitment")!;

    // wait until the user finishes up creating identity in extension
    while (identityCommitment === "")
    {
      await sleep (5000);
      identityCommitment = localStorage.getItem("commitment")!;
    }

    identityCommitment = JSON.parse(identityCommitment);
    return identityCommitment;
}

export const fetchVerificationProofFromExtension = async (obj: any) => {
    localStorage.setItem("fullProof","");
    localStorage.setItem("identityCommitment","");

    let fullProof = localStorage.getItem("fullProof")!;
    let identityCommitment = localStorage.getItem("identityCommitment")!;

    const proofEventName: string = process.env.REACT_APP_PROOF_EVENT_NAME!;

    if (proofEventName === "" || proofEventName === null) {
      console.log("Error: Could not find Identity Event Name. Please check if .env file exists");
      return { fullProof, identityCommitment };
    }

    document.dispatchEvent(new CustomEvent(proofEventName, {detail: obj}));

    // wait until the user finishes up generating proof in extension
    while (fullProof === "" ||identityCommitment ==="" )
    {
      await sleep (5000);
      fullProof = localStorage.getItem("fullProof")!;
      identityCommitment = localStorage.getItem("identityCommitment")!;
    
    }
    fullProof = JSON.parse(fullProof);
    identityCommitment = JSON.parse(identityCommitment);

    return { fullProof, identityCommitment };
}