import mongoose from 'mongoose';

const connectDb = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Database connected');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1); 
    }
};

export default connectDb;
