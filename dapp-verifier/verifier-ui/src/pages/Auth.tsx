import { useRef, useState } from 'react';
import '../bootstrap.css';
import people from '../images/people.png';
import { sleep } from "../utils/SleepUtil";
import { getTwitterID } from '../utils/VerifierAPIUtil';

const Auth = () => {

  const logoRef=useRef<HTMLImageElement>(null);

  let dAppName: string = process.env.REACT_APP_DAPP_NAME!;
  async function createUserIdentity() {
    await getTwitterID();
    await sleep(5000);
  }
    return (
        <div className="text-center">
          <br/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center"}}>
            <img src={people} ref={logoRef} alt={"None"} style={{width: '50px', height: '50px' }} />
            <h1 className="display-6 text-center"> &nbsp; {dAppName} Verifier</h1>
          </div>
          <br/>
          <h4 className="text-center">Proof of Personhood</h4>
          <p>Proof Required: Information from Twitter profile </p> 
          <button onClick={createUserIdentity} type="button" style={{backgroundColor:'#DE3163', borderColor: '#DE3163', color:'#FFFFFF'}} className="btn btn-primary me-md-2" data-bs-toggle="button">Create Your Plural Identity</button>
          <br/>
        </div>
      );
}

export default Auth;