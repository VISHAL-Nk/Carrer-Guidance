import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    isProfileComplete: { type: Boolean, default: false },
    profileCompletionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Add a method to calculate profile completion percentage
userSchema.methods.calculateProfileCompletion = async function() {
  try {
    const UserProfile = mongoose.model('UserProfile');
    const profile = await UserProfile.findById(this._id);
    
    if (!profile) {
      return { percentage: 0, isComplete: false };
    }

    // Define required fields and their weights
    const requiredFields = [
      { field: 'dob', weight: 25 },
      { field: 'gender', weight: 20 },
      { field: 'location', weight: 25 },
      { field: 'class', weight: 20 },
      { field: 'stream', weight: 10 }
    ];

    let completedWeight = 0;
    const totalWeight = requiredFields.reduce((sum, field) => sum + field.weight, 0);

    requiredFields.forEach(({ field, weight }) => {
      if (profile[field] && profile[field] !== 'Prefer not to say' && profile[field] !== 'None') {
        completedWeight += weight;
      }
    });

    const percentage = Math.round((completedWeight / totalWeight) * 100);
    const isComplete = percentage === 100;

    // Update user's completion status
    this.profileCompletionPercentage = percentage;
    this.isProfileComplete = isComplete;
    await this.save();

    return { percentage, isComplete };
  } catch (error) {
    console.error('Error calculating profile completion:', error);
    return { percentage: 0, isComplete: false };
  }
};

const User = mongoose.model("User", userSchema);

export default User;
