**To run the verifier API and the verifier APP in development mode**

1. Clone the entire repository of plurality verifier

```
git clone https://github.com/Web3-Plurality/plurality-verifier.git
```

2. Change directory into the `dapp-verifier/verifier-backend/` folder 

3. You need an .env file with the secrets. Keep it in the root of this folder. The required env variables can be seen the `environment` in `docker-compose` file.

4. Do `npm install` and then `npm run start` -> Your verifier api is now running at port specified in `.env` file. Leave this terminal open and for the next steps open a new terminal

5. Now we need to run the verifier ui. For this cd into `/dapp-verifier/verifier-ui`

6. You also need an .env for this. Keep it in the root of the this folder. The required env variables can be seen the `environment` in `docker-compose` file.

7. Run `npm install` and then `npm run start`. Your verifier app is now at localhost:3001


**To get identities in the extension:**

1. I'm assuming you already have the extension loaded into the browser

2. Go to `http://localhost:<PORT>/verifier` and press the "Generate New Proof Invitation" button. Currently I have disabled the BPA agent SSI interactions so it will directly open the plurality extension and try to create an identity. Press OK to generate the identity when the extension popup opens.

3. Then go to `http://localhost:<PORT>/dapp` page and click "Provide ZK-Proof To DApp For Access" button. It will open the plurality extension popup first where you can choose the identity you created in the previous step. Once you click it, it will send ZK Proof to DApp and then metamask will open up. The whole process takes a few seconds.

**Known Issues:**
1. If you have `OSSL` related issue while running the `verifier-ui` then please change the `package.json` as following:
```
scripts -> "start": "react-scripts --openssl-legacy-provider start"
```
