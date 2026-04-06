import fs from 'fs';
import path from 'path';

function walk(dir, call) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            walk(full, call);
        } else if (full.endsWith('.tsx')) {
            call(full);
        }
    }
}

walk('c:/Users/omnah/OneDrive/Desktop/Nexgro/nexgro-app/src', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace all <img ... /> with <Image ... />
    // If it has w-full h-full, we use fill
    // We add unoptimized if needed or just let it optimize
    let replaced = false;

    content = content.replace(/<img([^>]*)\/>/g, (match, attrs) => {
        replaced = true;
        let newAttrs = attrs;

        // Determine if we need 'fill'
        if (newAttrs.includes('w-full') || newAttrs.includes('h-full') || newAttrs.includes('object-cover')) {
            newAttrs += ' fill={true}';
            // NextJS fill images require parent to be relative
        } else {
            // default width/height for logos
            newAttrs += ' width={120} height={40}';
        }

        // Specifically swap the abstract contact image with /gemini.png
        if (newAttrs.includes('AB6AXuBZcAYoO_OblLvLqOlyxjqX3yBwWcamFtnyL3za')) {
            newAttrs = newAttrs.replace(/src="[^"]*"/, 'src="/gemini.png"');
        } else if (newAttrs.includes('src="https://lh3.')) {
            // Keep remote src
        }

        return `<Image${newAttrs}/>`;
    });

    if (replaced && !content.includes('import Image')) {
        content = `import Image from "next/image";\n` + content;
    }

    fs.writeFileSync(filePath, content);
});

console.log('Image replacements complete.');
