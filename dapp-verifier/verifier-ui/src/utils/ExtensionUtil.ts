import { sleep } from "./SleepUtil";

// TODO: Instead of using ! to handle nulls, use null handling exceptions
export const fetchIdentityCommitmentFromExtension = async () => {
    localStorage.setItem("commitment", "");

    console.log(process.env.REACT_APP_IDENTITY_EVENT_NAME);
    console.log(process.env.REACT_APP_DAPP_PROOF_NAME);
    document.dispatchEvent(new CustomEvent(process.env.REACT_APP_IDENTITY_EVENT_NAME!, {detail: process.env.REACT_APP_DAPP_PROOF_NAME}));

    let identityCommitment = localStorage.getItem("commitment")!;

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

    console.log(process.env.REACT_APP_PROOF_EVENT_NAME);
    document.dispatchEvent(new CustomEvent(process.env.REACT_APP_PROOF_EVENT_NAME!, {detail: obj}));

    let fullProof = localStorage.getItem("fullProof")!;
    let identityCommitment = localStorage.getItem("identityCommitment")!;

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