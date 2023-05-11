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

app.post("/group", async (req, resp) => {
	try {
		const group = new Group(req.body);
		let result = await group.save();
		result = result.toObject();
		if (result) {
			resp.send(req.body);
			console.log(result);
		} else {
			console.log("Group state saved");
		}

	} catch (e) {
		resp.send("Something Went Wrong");
	}
});


app.listen(process.env.PORT);
