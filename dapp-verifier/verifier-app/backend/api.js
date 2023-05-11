const mongoose = require('mongoose');
require("dotenv").config();

// TODO: Read url from .env file
mongoose.connect(process.env.CONNECTION_URL, {
    dbName: 'database',
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected Successfully'))
.catch((err) => { console.error(err); });

// For backend and express
const express = require('express');
const app = express();
const cors = require("cors");
console.log("App listen at port 5000");
app.use(express.json());
app.use(cors());
app.get("/", (req, resp) => {

	resp.send("App is Working");
	// You can check backend is working or not by
	// entering http://loacalhost:5000
	
	// If you see App is working means
	// backend working properly
});

// Schema for users of app
const IdentityCommitmentSchema = new mongoose.Schema({
	groupId: {
		type: String,
		required: true,
        unique: true
	},
	// TODO: Can we ensure unique elements in the array?
	identityCommitments: {
		type: Array,
		required: true,
	}
});

// Schema for users of app
const GroupSchema = new mongoose.Schema({
	groupId: {
		type: String,
		required: true,
        unique: true
	},
	groupState: {
		type: Object,
		required: true,
	}
});

const Identities = mongoose.model('identities', IdentityCommitmentSchema);
Identities.createIndexes();

app.get("/identities", async (req, resp) => {
	try {
		const groupId = req.query.groupId.toString();
		console.log("Received groupId: "+groupId);
		const group = await Identities.findOne({groupId:groupId});

		if (group) {
			resp.send(group);
			console.log("Identities in group sent: "+ group);
		} else {
			console.log("Group not found");
			resp.send("Group not found");
		}
	} catch (e) {
		console.log(e);
		resp.send("Something Went Wrong"+ e);
	}
});

app.post("/identity", async (req, resp) => {
	try {
		console.log("Received request");
		console.log(req.body);
		const groupId = req.body.groupId.toString();
		console.log("Group id is: "+ groupId);
		const identity = req.body.identityCommitment;
		console.log("Identity commitment to add is: "+ identity);
		let group = await Identities.findOne({groupId:groupId});
		if (group) {
			group.identityCommitments.push(identity);
		}
		else {
			const commitments = [identity];
			group = new Identities({"groupId":groupId, "identityCommitments":commitments});
		}

		let result = await group.save();
		console.log("Saved group");
		result = result.toObject();
		if (result) {
			resp.send(req.body);
			console.log("Done"+result);
		} else {
			console.log("Group state saved");
		}
	} catch (e) {
		console.log(e);
		resp.send("Something Went Wrong"+ e);
	}
});

const Group = mongoose.model('groups', GroupSchema);
Group.createIndexes();

app.get("/group", async (req, resp) => {
	try {
		const groupId = req.query.groupId.toString();
		console.log("Received groupId: "+groupId);
		const group = await Group.findOne({groupId:groupId});

		if (group) {
			resp.send(group);
			console.log("Group sent: "+ group);
		} else {
			console.log("Group not found");
			resp.send("Group not found");
		}
	} catch (e) {
		console.log(e);
		resp.send("Something Went Wrong"+ e);
	}
});

app.post("/group", async (req, resp) => {
	try {
		console.log("Received request");
		console.log(req.body);
		const group = new Group(req.body);
		console.log("Created new group"+group);
		let result = await group.save();
		console.log("Saved group");
		result = result.toObject();
		if (result) {
			resp.send(req.body);
			console.log("Done"+result);
		} else {
			console.log("Group state saved");
		}
	} catch (e) {
		console.log(e);
		resp.send("Something Went Wrong"+ e);
	}
});


app.listen(process.env.PORT);
