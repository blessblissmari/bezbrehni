import * as esbuild from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const watch = process.argv.includes("--watch");
const outdir = resolve("dist");
rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

const DEFINE = {
  "process.env.NODE_ENV": JSON.stringify(watch ? "development" : "production"),
  "process.env.API_URL": JSON.stringify(
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.xn--90aalbii8aw0c.xn--p1ai",
  ),
  "process.env.APP_URL": JSON.stringify(
    process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://app.xn--90aalbii8aw0c.xn--p1ai",
  ),
};

const commonOpts = {
  bundle: true,
  target: ["chrome110"],
  format: "iife",
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  logLevel: "info",
  define: DEFINE,
  jsx: "automatic",
};

const entries = [
  { in: "src/background.ts", out: "background" },
  { in: "src/content/index.tsx", out: "content" },
  { in: "src/popup/index.tsx", out: "popup" },
];

async function build() {
  const ctxs = await Promise.all(
    entries.map((e) =>
      esbuild.context({
        ...commonOpts,
        entryPoints: [e.in],
        outfile: resolve(outdir, `${e.out}.js`),
      }),
    ),
  );
  if (watch) {
    await Promise.all(ctxs.map((c) => c.watch()));
    console.log("extension: watching for changes...");
  } else {
    await Promise.all(ctxs.map((c) => c.rebuild()));
    await Promise.all(ctxs.map((c) => c.dispose()));
  }

  // Copy static files
  cpSync("manifest.json", resolve(outdir, "manifest.json"));
  cpSync("_locales", resolve(outdir, "_locales"), { recursive: true });
  cpSync("icons", resolve(outdir, "icons"), { recursive: true });
  cpSync("src/popup/index.html", resolve(outdir, "popup.html"));

  // Fix manifest version if needed
  const mf = JSON.parse(readFileSync(resolve(outdir, "manifest.json"), "utf8"));
  writeFileSync(resolve(outdir, "manifest.json"), JSON.stringify(mf, null, 2));

  console.log("extension bundle built at", outdir);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
