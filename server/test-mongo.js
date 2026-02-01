const mongoose = require('mongoose');
const uri = "mongodb+srv://kryptical:kryptical@cluster0.z5i8a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { family: 4 })
    .then(() => {
        console.log('Connected successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
