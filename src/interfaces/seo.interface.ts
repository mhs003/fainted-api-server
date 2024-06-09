export default interface ISEO extends Document {
    domain: string;
    seo_data: Record<string, Record<string, string>>; // page_url : {api_url : seo_content}
}
