import { sleep } from "../utils/SleepUtil";

export const fetchIdentityCommitmentFromExtension = async () => {
    localStorage.setItem("commitment", "");

    console.log(process.env.REACT_APP_IDENTITY_EVENT_NAME);
    console.log(process.env.REACT_APP_DAPP_PROOF_NAME);
    document.dispatchEvent(new CustomEvent(process.env.REACT_APP_IDENTITY_EVENT_NAME, {detail: process.env.REACT_APP_DAPP_PROOF_NAME}));

    let identityCommitment = localStorage.getItem("commitment");

    // wait until the user finishes up creating identity in extension
    while (identityCommitment === "")
    {
      await sleep (5000);
      identityCommitment = localStorage.getItem("commitment");
    }

    identityCommitment = JSON.parse(identityCommitment);
    return identityCommitment;
}

export const fetchVerificationProofFromExtension = async (obj) => {
    localStorage.setItem("fullProof","");
    console.log(process.env.REACT_APP_PROOF_EVENT_NAME);
    document.dispatchEvent(new CustomEvent(process.env.REACT_APP_PROOF_EVENT_NAME, {detail: obj}));

    let fullProof = localStorage.getItem("fullProof");
    // wait until the user finishes up generating proof in extension
    while (fullProof === "")
    {
      await sleep (5000);
      fullProof = localStorage.getItem("fullProof");
    }
    fullProof = JSON.parse(fullProof);
    return fullProof;
}