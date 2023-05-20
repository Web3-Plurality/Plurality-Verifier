import express, { Request, Response } from "express";
import { GroupSchema } from "../schemas/GroupSchema";
import * as mongoose from "mongoose";

export const groupRouter = express.Router();
const Group = mongoose.model('group', GroupSchema);
Group.createIndexes();

/*groupRouter.get("/", async (req: Request, res: Response) => {
    try {
		
		const group = await Group.findAll();

		if (group) {
            res.status(200).send(group);
			console.log("Identities in group sent: "+ group);
		} else {
			console.log("Group not found");
            res.status(404).send(group);
		}
	} catch (e) {
		console.log(e);
        res.status(500).send(e);
	}
  });*/

// GET All Commitments by group ID
groupRouter.get("/:id", async (req: Request, res: Response) => {
    try {
		const id = req.params.id.toString();
		console.log("Received groupId: "+id);
		const group = await Group.findOne({groupId:id});

		if (group) {
            res.status(200).send(group);
			console.log("Identities in group sent: "+ group);
		} else {
			console.log("Group not found");
            res.status(404).send(group);
		}
	} catch (e) {
		console.log(e);
        res.status(500).send(e);
	}
  });
  
  // POST a new commitment in group
  groupRouter.post("/", async (req: Request, res: Response) => {
	try {
		console.log("Received request");
		console.log(req.body);
        const identityItem = req.body;
		const groupId = identityItem.groupId.toString();
		console.log("Group id is: "+ groupId);
		const identity = identityItem.identityCommitment;
		console.log("Identity commitment to add is: "+ identity);
		let group = await Group.findOne({groupId:groupId});
		if (group) {
            // if group already exists, add one more commitment
			group.identityCommitments.push(identity);
		}
		else {
            // if group does not exist, add the incoming commitment as the first commitment
			const commitments = [identity];
			group = new Group({"groupId":groupId, "identityCommitments":commitments});
		}

		let result = await group.save();
		console.log("Saved group");
		result = result.toObject();
		if (result) {
            res.status(201).json(result);
			console.log(result);
		} else {
            res.status(400).json(result);
		}
	} catch (e) {
		console.log(e);
        res.status(500).json(e);
	}
});

