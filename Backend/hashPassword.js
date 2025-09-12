import bcrypt from 'bcrypt';

const password = 'XyZ7$pQr1@9nLm'; // Replace with your actual password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hash);
    // Copy this hash for step 2
  }
});
// XyZ7$pQr1@9nLm