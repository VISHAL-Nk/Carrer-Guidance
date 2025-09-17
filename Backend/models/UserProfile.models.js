/*
 UserProfile{
    _id: string (same as User._id),
    dob: Date,
    gender: string,
    location: string,
    class: string,
 }
*/

import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    dob: { type: Date },
    gender: { type: String, enum:["Male","Female","Prefer not to say"] , default:"Prefer not to say" },
    location: { type: String },
    class: { type: String, enum:["10th","12th"] },
    stream: { type: String, enum:["Science","Commerce","Arts","Diploma","Vocational courses","Other","None"] }
}, { timestamps: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;