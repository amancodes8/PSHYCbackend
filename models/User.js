const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 50 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: { 
      type: String, 
      required: true, 
      minlength: 6,
      select: false 
    },
    avatar: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ""
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say'
    },
    dateOfBirth: {
      type: Date
    },
    location: {
      type: String,
      maxlength: 100,
      default: ""
    },
    isAdmin: { 
      type: Boolean, 
      default: false 
    },
    lastLogin: {
      type: Date
    },
    socialLinks: {
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" }
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: { type: Boolean, default: true }
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    gender: this.gender,
    location: this.location,
    createdAt: this.createdAt,
    socialLinks: this.socialLinks,
    preferences: this.preferences
  };
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update last login on authentication
userSchema.methods.updateLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Filter sensitive data when sending user object
userSchema.methods.toProfileJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    gender: this.gender,
    dateOfBirth: this.dateOfBirth,
    location: this.location,
    createdAt: this.createdAt,
    socialLinks: this.socialLinks,
    preferences: this.preferences,
    isAdmin: this.isAdmin
  };
};

// Static method for updating profile
userSchema.statics.updateProfile = async function(userId, updateData) {
  const allowedUpdates = [
    'name', 'avatar', 'bio', 'gender', 
    'dateOfBirth', 'location', 'socialLinks', 'preferences'
  ];
  
  const updates = Object.keys(updateData);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new Error('Invalid updates!');
  }

  const user = await this.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  updates.forEach(update => user[update] = updateData[update]);
  await user.save();
  return user.toProfileJSON();
};

module.exports = mongoose.model("User", userSchema);