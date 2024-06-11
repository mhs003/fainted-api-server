import { Schema, model } from "mongoose";
import ISEO from "../interfaces/seo.interface";

const schema = new Schema<ISEO>({
    domain: { type: String, required: true },
    // connection: { type: Schema.Types.ObjectId, ref: "connection" },
    title: { type: String, required: true },
    api_point: { type: String, required: true },
    seo_data: { type: Map, of: Object, required: true },
    seo_text: { type: String, required: true },
});

// schema.index({ domain: "text", seo_text: "text" });

export default model<ISEO>("seo", schema);
