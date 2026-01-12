#!/usr/bin/env bun
import plugin from "bun-plugin-tailwind";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import path from "path";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Build Script

Usage: bun run build.ts [options]

Options:
  --outdir <path>     Output directory (default: "dist")
  --minify            Enable minification
  --sourcemap <type>  Sourcemap type: none|linked|inline|external
  --help, -h          Show this help message

Example:
  bun run build.ts --outdir=dist --minify --sourcemap=linked
`);
    process.exit(0);
}

console.log("\nStarting build process...\n");

const outdir = process.argv.find(a => a.startsWith("--outdir="))?.split("=")[1]
    ?? path.join(process.cwd(), "dist");

if (existsSync(outdir)) {
    console.log(`Cleaning previous build at ${outdir}`);
    await rm(outdir, { recursive: true, force: true });
}

// Copy public directory contents
const publicDir = path.join(process.cwd(), "public");
if (existsSync(publicDir)) {
    console.log("Copying public directory to dist...");
    await Bun.write(path.join(outdir, ".keep"), ""); // Ensure dir exists
    // Using cp -r behavior via system call or recursive read/write? 
    // Bun doesn't have a simple recursive copy in one line in standard lib yet? 
    // Actually, let's use the shell cp command or node fs.cp
    // Node fs.cp is available in Bun via 'node:fs/promises'
    const { cp } = await import("node:fs/promises");
    await cp(publicDir, outdir, { recursive: true });
}

const start = performance.now();

const entrypoints = [...new Bun.Glob("**.html").scanSync("src")]
    .map(a => path.resolve("src", a))
    .filter(dir => !dir.includes("node_modules"));

console.log(`Found ${entrypoints.length} HTML ${entrypoints.length === 1 ? "file" : "files"} to process\n`);

const result = await Bun.build({
    entrypoints,
    outdir,
    plugins: [plugin],
    minify: process.argv.includes("--minify"),
    target: "browser",
    sourcemap: "linked",
    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
    },
});

const end = performance.now();

const formatFileSize = (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

const outputTable = result.outputs.map(output => ({
    File: path.relative(process.cwd(), output.path),
    Type: output.kind,
    Size: formatFileSize(output.size),
}));

console.table(outputTable);
console.log(`\nBuild completed in ${(end - start).toFixed(2)}ms\n`);
