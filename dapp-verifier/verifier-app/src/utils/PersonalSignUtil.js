import { ethers } from "ethers";

export const requestPersonalSignOnProof = async (fullProof: any) => {
    console.log("In personal sign");
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it");
      
      await window.ethereum.request({method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      // TODO: Check if we need to verify this signature somehow?
      const signature = await signer.signMessage(JSON.stringify(fullProof));
      const address = await signer.getAddress();
      console.log(`Message was signed by the address ${address}`);
      return address;
    }
    catch (err) {
      console.log(err);
    }
  }