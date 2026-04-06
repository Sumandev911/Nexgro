import fs from 'fs';
import path from 'path';

const exportsDir = 'c:/Users/omnah/OneDrive/Desktop/Nexgro/stitch_exports';
const outDir = 'c:/Users/omnah/OneDrive/Desktop/Nexgro/nexgro-app/src/app';

const files = fs.readdirSync(exportsDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(exportsDir, file), 'utf-8');

  // Extract <main> Content
  const match = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let mainContent = match ? match[1] : '';

  if (!mainContent) {
    // if no main, maybe it's just in body between nav and footer
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      mainContent = bodyMatch[1].replace(/<nav[^>]*>[\s\S]*?<\/nav>/i, '').replace(/<footer[^>]*>[\s\S]*?<\/footer>/i, '');
    }
  }

  // Convert raw HTML to JSX
  let jsx = mainContent
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
    .replace(/<(img|input|br|hr)([^>]*?)(?<!\/)>/g, '<$1$2 />') // self closing tags
    .replace(/tabindex/g, 'tabIndex')
    .replace(/tabIndex="(-?\d+)"/g, 'tabIndex={$1}')
    .replace(/rows="(\d+)"/g, 'rows={$1}')
    .replace(/(required|controls|autoplay|muted|loop|disabled|readonly)=""/g, '$1')
    .replace(/stroke-width/g, 'strokeWidth')
    .replace(/stroke-linecap/g, 'strokeLinecap')
    .replace(/stroke-linejoin/g, 'strokeLinejoin')
    .replace(/clip-rule/g, 'clipRule')
    .replace(/fill-rule/g, 'fillRule')
    .replace(/style="([^"]*)"/g, ''); // strip inline styles completely

  const routeName = file.replace('.html', '');
  const isHome = routeName === 'landing';
  const finalDir = isHome ? outDir : path.join(outDir, routeName);

  if (!fs.existsSync(finalDir)) {
    fs.mkdirSync(finalDir, { recursive: true });
  }

  const componentName = routeName.charAt(0).toUpperCase() + routeName.slice(1) + 'Page';

  const finalCode = `import Image from "next/image";
import Link from "next/link";

export default function ${componentName}() {
  return (
    <main className="flex-1 flex flex-col pt-24 pb-12">
      ${jsx}
    </main>
  );
}
`;

  fs.writeFileSync(path.join(finalDir, 'page.tsx'), finalCode);
  console.log(`Converted ${file} to ${finalDir}/page.tsx`);
});
