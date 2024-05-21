import mongoose from "mongoose";

const dbConnect = async() => {
    try {
        mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to Mongo");
    } catch (error) {
        console.log(error, "Couldn't connect to Mongo");
    }
}

export default dbConnect;