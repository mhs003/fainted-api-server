import { Document, Schema, model } from "mongoose";

export interface IConnection extends Document {
    domain_name: string;
    tld: string;
    github_repo: string;
    branch: string;
    router: object;
    secret: string;
    isPrivate: boolean;
}

const schema = new Schema<IConnection>({
    domain_name: { type: String, required: true, unique: true },
    tld: { type: String, required: true },
    github_repo: { type: String, required: true },
    branch: { type: String, required: true },
    router: { type: Object, required: true },
    secret: { type: String, required: true, select: false },
    isPrivate: { type: Boolean, required: true },
});

export default model<IConnection>("connection", schema);
