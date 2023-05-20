import express, { Request, Response } from "express";
import { UserIdentitySchema } from "../schemas/UserIdentitySchema";
import * as mongoose from "mongoose";

export const identityRouter = express.Router();
const Identity = mongoose.model('identity', UserIdentitySchema);
Identity.createIndexes();


// GET identity object by commitment
identityRouter.get("/commitment/:commitment", async (req: Request, res: Response) => {
    try {
		const commitment = req.params.commitment.toString();
		console.log("Received commitment: "+commitment);
		const id = await Identity.findOne({"identityCommitment":commitment});

		if (id) {
            res.status(200).send(id);
			console.log("Identity sent: "+ id);
		} else {
			console.log("Identity not found");
            res.status(404).send(id);
		}
	} catch (e) {
		console.log(e);
        res.status(500).send(e);
	}
  });

  // GET identity object by blockchain address
identityRouter.get("/blockchainaddress/:bcAddress", async (req: Request, res: Response) => {
    try {
		const bcAddress = req.params.bcAddress.toString();
		console.log("Received blockchain address: "+bcAddress);
		const id = await Identity.findOne({"blockchainAddress":bcAddress});

		if (id) {
            res.status(200).send(id);
			console.log("Identity sent: "+ id);
		} else {
			console.log("Identity not found");
            res.status(404).send(id);
		}
	} catch (e) {
		console.log(e);
        res.status(500).send(e);
	}
  });
  
  // POST a new identity object 
  identityRouter.post("/", async (req: Request, res: Response) => {
	try {
		console.log("Received request");
		console.log(req.body);
        const identityItem = req.body;
		const commitment = identityItem.commitment.toString();
		const bcAddress = identityItem.blockchainAddress.toString();
		const zkProof = identityItem.zkProof.toString();

		console.log("Identity commitment to add is: "+ commitment);
        console.log("Identity blockchain address to add is: "+ bcAddress);
        console.log("Identity ZK Proof to add is: "+ zkProof);

		let id = await Identity.findOne({identityCommitment:commitment});
		if (id) {
            // identity already exists
            res.status(400).send(id);
		}
		else {
            // identity does not exist, so save it
            id = new Identity({"identityCommitment":commitment, "blockchainAddress": bcAddress, "zkProof": zkProof})
			let result = await id.save();
		    console.log("Saved identity");
		    result = result.toObject();
		    if (result) {
                res.status(201).json(result);
			    console.log(result);
		    } else {
                res.status(500).json(result);
		    }
		}
		
	} catch (e) {
		console.log(e);
        res.status(500).json(e);
	}
});

