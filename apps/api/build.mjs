import { build } from "esbuild";
import { rmSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const outdir = resolve("dist");
rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

// ydb-sdk и @yandex-cloud/nodejs-sdk — тяжёлые, не бандлим их
// Они будут установлены из package.json при загрузке в Cloud Function.
const EXTERNAL = [
  "ydb-sdk",
  "@yandex-cloud/nodejs-sdk",
  "@grpc/grpc-js",
  "@grpc/proto-loader",
  "google-protobuf",
  "protobufjs",
  "jsonwebtoken",
  "long",
  "luxon",
  "reflect-metadata",
  "uuid",
];

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.cjs",
  platform: "node",
  target: "node20",
  format: "cjs",
  bundle: true,
  sourcemap: false,
  minify: true,
  legalComments: "none",
  logLevel: "info",
  external: EXTERNAL,
});

// Yandex Cloud Functions installs deps из package.json при загрузке исходников.
const rootPkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
writeFileSync(
  resolve(outdir, "package.json"),
  JSON.stringify(
    {
      name: "bezbrehni-api-bundle",
      version: "0.1.0",
      main: "index.cjs",
      dependencies: {
        "ydb-sdk": rootPkg.dependencies["ydb-sdk"],
      },
    },
    null,
    2,
  ),
);

console.log("API bundle built at", outdir);
