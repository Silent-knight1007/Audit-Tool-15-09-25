import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/auth.js'; 
import AdminPassword from '../models/adminPasswordStore.js';
const router = express.Router();
const hashedSharedPassword = '$2b$10$hdmOGo5du0IJUxIo406MC.KJMX.2rvaoN72L8kz6pFkXDqu/CQwxa';

const admin = [
"pooja.punyani@onextel.com"
];

const allowedEmails = [
"saurabh.gupta@onextel.com",
"ritika.singh@onextel.com",
"tina.khanna@onextel.com",
"diya.ghakhar@onextel.com"
];

const auditor = [
"mohit.agarwal@onextel.com"
];

function isOnextelEmail(email) {
   return /^[a-zA-Z0-9._%+-]+@onextel\.com$/.test(email);
}
// Helper to store plain passwords for admin collection
async function storePlainPasswordForAdmin(email, plainPassword, role) {
try {
await AdminPassword.findOneAndUpdate(
{ email },
{ plainPassword, role },
{ upsert: true }
);
console.log(`Stored plain password for admin: ${email}`);
} catch (err) {
console.error('Error storing plain password for admin:', err); }
}

router.get('/test-adminpass', async (req, res) => {
try {
await AdminPassword.create({
email: 'test@example.com',
plainPassword: 'MyPlainPassword123', role: 'admin'
});
res.status(200).send('Test password saved');
} catch (error) {
console.error(error);
res.status(500).send('Test failed');
}
});

// SIGNIN
router.post('/signin', async (req, res) => {
try {
const { email, password } = req.body;
if (!email || !password) {
return res.status(400).json({ message: 'Email and password are required.' });
}
if (!isOnextelEmail(email)) {
return res.status(400).json({ message: 'Only @onextel.com emails are allowed.' }); }
let role = null;
if (admin.includes(email)) {
role = "admin";
} else if (auditor.includes(email)) {
role = "auditor";
} else if (allowedEmails.includes(email)) {
role = "user";
} else {
return res.status(401).json({ message: 'Not authorized. Contact admin.' });
}
const user = await User.findOne({ email });
if (user) {
const isMatch = await user.comparePassword(password);
if (!isMatch) {
return res.status(401).json({ message: 'Invalid password.' });
}
return res.status(200).json({ 
message: 'Sign-in successful.', 
id: user._id,
name: user.name || user.email.split('@')[0],
email: user.email,
role: user.role || role 
});
} else {
const isSharedPasswordMatch = await bcrypt.compare(password, hashedSharedPassword);
if (!isSharedPasswordMatch) {
return res.status(401).json({ message: 'Invalid password.' });
}
const defaultName = email.split('@')[0];
const newUser = new User({ name: defaultName, email, password, role });
await newUser.save();
// Store plain password for admin collection
await storePlainPasswordForAdmin(newUser.email, password, newUser.role);
return res.status(200).json({ 
message: 'Sign-in successful.', 
id: newUser._id,
name: newUser.name,
email: newUser.email, 
role: newUser.role
});
}
} catch (err) {
console.error('Sign-in error:', err);
return res.status(500).json({ message: 'Internal Server Error' });
}
});

// SIGNUP
router.post('/signup', async (req, res) => {
const { name, email, password, role } = req.body;
if (!name || !email || !password || !role) {
return res.status(400).json({ message: 'All fields required' });
}
const existingUser = await User.findOne({ email });
if (existingUser) return res.status(409).json({ message: 'Email already exists' });
const newUser = new User({ name, email, password, role });
await newUser.save();
// Store plain password for admin collection
await storePlainPasswordForAdmin(newUser.email, password, newUser.role);
res.status(201).json({ 
id: newUser._id,
name: newUser.name,
email: newUser.email,
role: newUser.role,
});
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
try {
const { email, oldPassword, newPassword, confirmNewPassword } = req.body;
if (!email || !oldPassword || !newPassword || !confirmNewPassword) {
return res.status(400).json({ message: 'All fields are required.' });
}
if (newPassword !== confirmNewPassword) {
return res.status(400).json({ message: 'New passwords do not match.' });
}
const user = await User.findOne({ email });
if (!user) {
return res.status(404).json({ message: 'User not found.' });
}
 // Verify old password
const isMatch = await user.comparePassword(oldPassword);
if (!isMatch) {
return res.status(401).json({ message: 'Old password is incorrect.'});
}
user.password = newPassword; // not hashed!
await user.save();
await storePlainPasswordForAdmin(user.email, newPassword, user.role);
// Store plain password for admin collection
await storePlainPasswordForAdmin(user.email, newPassword, user.role);
res.status(200).json({ message: 'Password reset successful.' });
} catch (err) {
console.error('Reset password error:', err);
res.status(500).json({ message: 'Internal server error.' });
}
});

export default router;