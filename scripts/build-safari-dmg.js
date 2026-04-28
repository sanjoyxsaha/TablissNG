#!/usr/bin/env node
import { execSync } from "child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "fs";
import { join } from "path";

const rootDir = process.cwd();
const version = JSON.parse(
  readFileSync(join(rootDir, "package.json"), "utf8").toString(),
).version;
const xcodeProject = join(
  rootDir,
  "TablissNG-Xcode-Project/TablissNG.xcodeproj",
);
const appName = "TablissNG";
const dmgDir = join(rootDir, "dist/safari-dmg");
const dmgPath = join(dmgDir, `${appName}-${version}.dmg`);

function run(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { stdio: "inherit", ...opts });
}

console.log(`==> Building Safari web extension (v${version})...`);
run("pnpm run build:safari");

console.log(
  "==> Extension resources are referenced directly from dist/safari via the Xcode project.",
);

console.log("==> Building Xcode project...");
run(
  `xcodebuild -project "${xcodeProject}" -scheme ${appName} -configuration Release -derivedDataPath "${rootDir}/TablissNG-Xcode-Project/build" clean build`,
);

const appPath = `${rootDir}/TablissNG-Xcode-Project/build/Build/Products/Release/${appName}.app`;

if (!existsSync(appPath)) {
  console.error("ERROR: App not found. Build may have failed.");
  process.exit(1);
}

console.log("==> Creating DMG...");
if (!existsSync(dmgDir)) mkdirSync(dmgDir, { recursive: true });
if (existsSync(dmgPath)) rmSync(dmgPath);

const stagingDir = join(dmgDir, "staging");
if (existsSync(stagingDir)) rmSync(stagingDir, { recursive: true });
mkdirSync(stagingDir);

cpSync(appPath, join(stagingDir, `${appName}.app`), { recursive: true });
run(`ln -s /Applications "${stagingDir}/Applications"`);

run(
  `hdiutil create -volname ${appName} -srcfolder "${stagingDir}" -ov -format UDZO "${dmgPath}"`,
);

rmSync(stagingDir, { recursive: true });

console.log(`==> Done! DMG created at: ${dmgPath}`);
