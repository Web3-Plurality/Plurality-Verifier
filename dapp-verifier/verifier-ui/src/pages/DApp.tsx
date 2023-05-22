import { useRef, useState } from 'react';
import '../bootstrap.css';
import { sendGroupStateToPlurality } from '../utils/Web3Client';
import verifiedImg from '../images/verified.png';
import unverifiedImg from '../images/unverified.png';
import mortgage from '../images/mortgage.png';
import pending from '../images/pending.png';

const DApp = () => {
  const [textAreaValue, setTextAreaValue] = useState('');

  const imageRef=useRef<HTMLImageElement>(null);

  const logoRef=useRef<HTMLImageElement>(null);

  let message: string;

  async function verifyRequestDApp() {
    message = `Verification Started: User provide zk-proof to the DApp for membership verification\n`;
    setTextAreaValue(message);
    if (imageRef.current === null) {
      console.log("Error: Image Reference is null.");
      return;
    }
    const imgRef = imageRef.current;
    try {
      const isVerified = await sendGroupStateToPlurality();
      console.log("Proof verification result: "+ isVerified);
      if (isVerified) {
        message = message + 'Verification Complete. Access GRANTED. Your proof was valid. \n'; 
        setTextAreaValue(message);
        imgRef.src=verifiedImg;
      }
      else {
        message = message + 'Verification Complete. Access DENIED. You are not a part of valid participants \n' 
        setTextAreaValue(message);
        imgRef.src=unverifiedImg;
      }
    } catch(err) {
      console.log(err);
      message = message + `Your zero knowledge proof is invalid. Access DENIED`; 
      setTextAreaValue(message);
      imgRef.src=unverifiedImg;
    }
  }


    return (
        <div className="text-center">
          <br/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center"}}>
            <img src={mortgage} ref={logoRef} alt={"None"} style={{width: '50px', height: '50px' }} />
            <h1 className="display-6 text-center">&nbsp; Mortgage Loans DApp</h1>
          </div>
          <br />
          <h4>Already verified yourself through our verifier? Please provide zero knowledge proof of verification</h4>
          <br/>
          <button onClick={verifyRequestDApp} type="button" className="btn btn-primary me-md-2" data-bs-toggle="button">Provide ZK-Proof to DApp for Access</button>
          <br/> <br/><br/>

          <img ref={imageRef} src={pending} alt={"None"} style={{width: '200px', height: '200px'}} />

          <div className="mb-3" id="textarea-readonly">
            <textarea className="form-control" id="exampleFormControlTextarea1" rows={12} value={textAreaValue} aria-label="Disabled input example" disabled readOnly></textarea>
          </div>
        </div>
      );
}

export default DApp;