const mongoose = require('mongoose');
require("dotenv").config();

// TODO: Read url from .env file
mongoose.connect(process.env.CONNECTION_URL, {
    dbName: 'database',
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected Successfully'))
.catch((err) => { console.error(err); });


// Schema for users of app
const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

const User = mongoose.model('users', UserSchema);
User.createIndexes();

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

app.post("/register", async (req, resp) => {
	try {
		const user = new User(req.body);
		let result = await user.save();
		result = result.toObject();
		if (result) {
			delete result.password;
			resp.send(req.body);
			console.log(result);
		} else {
			console.log("User already register");
		}

	} catch (e) {
		resp.send("Something Went Wrong");
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
