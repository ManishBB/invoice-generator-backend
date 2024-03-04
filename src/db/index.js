import mongoose from "mongoose";

const connectToDatabase = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/levitation`
        );
        console.log(
            `\nConnected to MongoDB!! DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("Mongodb error: " + error);
        process.exit(1);
    }
};

export default connectToDatabase;
