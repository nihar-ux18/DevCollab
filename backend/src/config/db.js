const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Clean up any incorrect unique index on password if it exists
        try {
            await mongoose.connection.db.collection('users').dropIndex('password_1');
            console.log('✅ Dropped duplicate password_1 index');
        } catch (err) {
            // Index might not exist or already dropped, which is fine
        }
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;