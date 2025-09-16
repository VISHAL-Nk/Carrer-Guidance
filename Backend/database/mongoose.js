import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const dbUri = process.env.DB_URI || process.env.MONGODB_URI;
        
        if (!dbUri) {
            throw new Error('Database URI is not defined in environment variables. Please set DB_URI or MONGODB_URI.');
        }
        
        const conn = await mongoose.connect(dbUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

export default connectDB;