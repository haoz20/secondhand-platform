import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long.'],
    maxlength: [20, 'Username cannot be more than 20 characters long.']
  },
  name: {
    type: String, 
    required: [true, 'Name is required.'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters long.']
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address.']
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: [6, 'Password must be at least 6 characters long.']
    
  },
}, {
  timestamps: true 
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
