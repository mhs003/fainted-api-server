import { Document, Schema, model } from "mongoose";
import IConnection from "../interfaces/connection.interface";

const schema = new Schema<IConnection>({
    domain_name: { type: String, required: true },
    tld: { type: String, required: true },
    github_repo: { type: String, required: true },
    branch: { type: String, required: true },
    router: { type: Object, required: true },
    secret: { type: String, required: true, select: false },
    isPrivate: { type: Boolean, required: true },
});

export default model<IConnection>("connection", schema);
