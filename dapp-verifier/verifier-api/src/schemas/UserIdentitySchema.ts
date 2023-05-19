import * as mongoose from "mongoose";
export const UserIdentitySchema = new mongoose.Schema({
	identityCommitment: {
		type: String,
		required: true,
        unique: true
	},
	blockchainAddress: {
		type: String,
		required: true
	},
    zkProof: {
		type: String,
		required: true
	}
});