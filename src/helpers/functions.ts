function ltrim(heystack: string, needle: string): string {
    return heystack.replace(new RegExp("^" + needle + "+"), "");
}

function rtrim(heystack: string, needle: string): string {
    return heystack.replace(new RegExp(needle + "+$"), "");
}

export { ltrim, rtrim };
