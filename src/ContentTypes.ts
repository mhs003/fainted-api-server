export default class ContentTypes {
    private contentTypes: Map<string, string>;
    private constructor() {
        this.contentTypes = new Map<string, string>();

        // common
        this.contentTypes.set("txt", "text/plain");
        this.contentTypes.set("html", "text/html");
        this.contentTypes.set("css", "text/css");
        this.contentTypes.set("js", "text/javascript");
        this.contentTypes.set("json", "application/json");
        this.contentTypes.set("xml", "application/xml");

        // programming languages
        this.contentTypes.set("php", "text/x-php");
        this.contentTypes.set("py", "text/x-python");
        this.contentTypes.set("sh", "text/x-sh");

        // images
        this.contentTypes.set("png", "image/png");
        this.contentTypes.set("jpg", "image/jpeg");
        this.contentTypes.set("jpeg", "image/jpeg");
        this.contentTypes.set("gif", "image/gif");
        this.contentTypes.set("svg", "image/svg+xml");
        this.contentTypes.set("webp", "image/webp");
        this.contentTypes.set("ico", "image/x-icon");
        this.contentTypes.set("bmp", "image/bmp");

        // fonts
        this.contentTypes.set("woff", "application/font-woff");
        this.contentTypes.set("woff2", "application/font-woff2");
        this.contentTypes.set("ttf", "application/font-ttf");
        this.contentTypes.set("otf", "application/font-otf");
        this.contentTypes.set("eot", "application/vnd.ms-fontobject");

        // docs
        this.contentTypes.set("pdf", "application/pdf");
        this.contentTypes.set("doc", "application/msword");
        this.contentTypes.set(
            "docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        this.contentTypes.set("xls", "application/vnd.ms-excel");
        this.contentTypes.set(
            "xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        this.contentTypes.set("ppt", "application/vnd.ms-powerpoint");
        this.contentTypes.set(
            "pptx",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );

        // archives
        this.contentTypes.set("zip", "application/zip");
        this.contentTypes.set("rar", "application/x-rar-compressed");
        this.contentTypes.set("gz", "application/x-gzip");
        this.contentTypes.set("7z", "application/x-7z-compressed");
        this.contentTypes.set("tar", "application/x-tar");
        this.contentTypes.set("iso", "application/x-iso9660-image");

        // media
        this.contentTypes.set("mp3", "audio/mpeg");
        this.contentTypes.set("mp4", "video/mp4");
        this.contentTypes.set("m4a", "audio/x-m4a");
        this.contentTypes.set("mp3", "audio/mpeg");
        this.contentTypes.set("mp4", "video/mp4");
        this.contentTypes.set("m4a", "audio/x-m4a");
    }

    public static all(): ContentTypes {
        return new ContentTypes();
    }

    public get(extension: string): string {
        return this.contentTypes.get(extension) || "text/plain";
    }
}
