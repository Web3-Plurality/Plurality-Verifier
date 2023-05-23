import { ethers } from "ethers";

export const requestPersonalSignOnProof = async (fullProof: Object) => {
    console.log("In personal sign");
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it");
      
      await window.ethereum.request({method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      // TODO: Check if we need to verify this signature somehow?
      const signature = await signer.signMessage(JSON.stringify(fullProof));
      const address: string = await signer.getAddress();
      console.log(`Message was signed by the address ${address}`);
      if (address === "" || address === null) {
        console.log("Error: The address of the signer could not be fetched. Returning");
        return "";
      }
      return address;
    }
    catch (err) {
      console.log(err);
    }
  }


export const requestPersonalSignOnIdentityCommitment = async (commitment: string) => {
  console.log("In personal sign");
  try {
    if (!window.ethereum)
      throw new Error("No crypto wallet found. Please install it");
    
    await window.ethereum.request({method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    // TODO: Check if we need to verify this signature somehow?
    const signature = await signer.signMessage(commitment);
    const address: string = await signer.getAddress();
    console.log(`Message was signed by the address ${address}`);
    if (address === "" || address === null) {
      console.log("Error: The address of the signer could not be fetched. Returning");
      return "";
    }
    return address;
  }
  catch (err) {
    console.log(err);
  }
}