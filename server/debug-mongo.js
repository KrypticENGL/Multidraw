const mongoose = require('mongoose');

const username = 'phanishwar07_db_user';
const password = 'iVM_mS9iTT3*JpJ';
const cluster = 'multidraw.dj9rxaf.mongodb.net';

const encodedPassword = encodeURIComponent(password);
const uri = `mongodb+srv://${username}:${encodedPassword}@${cluster}/?retryWrites=true&w=majority`;

console.log('Testing connection to:', uri.replace(encodedPassword, '****'));

mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connected successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    });
