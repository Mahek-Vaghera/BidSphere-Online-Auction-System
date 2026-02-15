import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    
    username: { //kato name rakhvu, agar username rakhvuchh to pachhi space allowed na krvu ane unique hovu joie
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    verificationCode: String,
    
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
},{timestamps: true});

// Query: get verified or unverified users (for admin dashboards)
userSchema.index({ isVerified: 1 });

// Query: sort or fetch latest registered users
userSchema.index({ createdAt: -1 });

const User = mongoose.model('user', userSchema);

export default User;