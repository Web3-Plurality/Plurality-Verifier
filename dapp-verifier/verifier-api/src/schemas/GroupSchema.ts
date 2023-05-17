import * as mongoose from "mongoose";
export const GroupSchema = new mongoose.Schema({
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
