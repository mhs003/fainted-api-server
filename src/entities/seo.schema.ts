import { Schema, model } from "mongoose";
import ISEO from "../interfaces/seo.interface";

const schema = new Schema<ISEO>({
    domain: { type: String, required: true },
    seo_data: { type: Map, of: Object, required: true },
});

export default model<ISEO>("seo", schema);
