// import { ObjectId } from "mongoose";

export default interface ISEO extends Document {
    domain: string;
    title: string;
    // connection: ObjectId;
    api_point: string;
    seo_data: Map<string, Object>;
    seo_text: string;
}
