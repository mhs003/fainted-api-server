import mongoose from "mongoose";

try {
    const mongoDBURI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";

    mongoose.connect(mongoDBURI);
} catch (err) {
    console.log("Database not connected");
    throw new Error("Database not connected");
}
export default mongoose;
