


export function markdownToSlack(input: string): string {
    let text = input.replace(/\r\n/g, "\n");

    // Headings → bold
    text = text.replace(/^#{1,6}\s+(.*)$/gm, "*$1*");

    // **1. Title:** → *1. Title*
    text = text.replace(
        /^\*\*(\d+\.\s+[^*]+)\*\*:?$/gm,
        "*$1*"
    );

    // Bullet with bold title
    text = text.replace(
        /^\s*[*-]\s+\*\*(.*?)\*\*:\s*(.*)$/gm,
        "• *$1:* $2"
    );

    // Bold => * **text** → *text*
    text = text.replace(/\*\*(.*?)\*\*/g, "*$1*");

    // Bulleted lists => * - item / * item → • item
    text = text.replace(/^\s*[*-]\s+(.*)$/gm, "• $1");

    //  Numbered lists → bullets
    text = text.replace(/^\s*\d+\.\s+(.*)$/gm, "• $1");

    // Strikethrough
    text = text.replace(/~~(.*?)~~/g, "~$1~");

    // Cleanup
    text = text
        .replace(/^\s{2,}/gm, "")   // remove indentation
        .replace(/\n{3,}/g, "\n\n") // normalize spacing
        .trim();

    return text;
}
