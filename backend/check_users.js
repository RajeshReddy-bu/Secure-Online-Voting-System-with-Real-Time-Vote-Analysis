const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
    await mongoose.connect('mongodb://localhost:27017/voting-system');
    const users = await User.find({});
    console.log(users.map(u => ({ username: u.username, role: u.role })));
    mongoose.connection.close();
}
checkUsers();
