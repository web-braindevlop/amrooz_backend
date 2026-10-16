// Quick script to generate bcrypt password hash for admin user
// Run: node generate-password-hash.js

const bcrypt = require('bcrypt');

const password = 'Admin@123'; // Change this if you want a different password

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\n===========================================');
    console.log('Admin Password Hash Generated Successfully');
    console.log('===========================================\n');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nCopy the hash above and replace "$2b$10$YourHashedPasswordHere" in database-schema.sql');
    console.log('Then run the SQL script in phpMyAdmin.\n');
  })
  .catch(err => {
    console.error('Error generating hash:', err);
    process.exit(1);
  });
