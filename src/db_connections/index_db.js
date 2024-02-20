import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log(`MongoDB connected !! DB HOST: ${connectionInstance.connection.host} | ${DB_NAME}`);
    } catch (error) {
        console.error("MONGODB connection error", error);
        process.exit(1)
    }
}

export default connectDB