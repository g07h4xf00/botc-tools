import fs from 'fs';
import { Command } from 'commander';
import cliProgress from 'cli-progress';
import { allIcons, downloadIcons, findNotDownloaded, saveIcons } from './images';
import { downloadCharacterData } from './character_json';
import { ScriptData, getScript } from './get_script';
import path from 'path';

const FAVORITE_SCRIPTS = "19,178,180,181,10,360,1273,1245,83,81";

async function downloadImages(imgDir: string) {
  console.log("fetching list of icons");
  var icons = await allIcons();
  icons = findNotDownloaded(icons, imgDir);

  if (icons.length == 0) {
    console.log("nothing to download");
    return;
  }

  console.log(`downloading ${icons.length} images`);
  fs.mkdirSync(imgDir, { recursive: true });

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
  bar.start(icons.length, 0);
  const downloads = await downloadIcons(icons, (n) => {
    bar.increment(n);
  });
  bar.stop();

  console.log("rescaling images")
  await saveIcons(downloads, imgDir);
}

async function makeIndex(scriptsDir: string, destFile: string) {
  const files = fs.readdirSync(scriptsDir).map(name => {
    let contents = fs.promises.readFile(`${scriptsDir}/${name}`, {
      encoding: "utf-8",
    });
    return { name, contents };
  });
  let listing: { id: string, title: string }[] = [];
  for (const file of files) {
    let id = path.basename(file.name, ".json");
    let script: ScriptData = JSON.parse(await file.contents);
    let title = script.title;
    listing.push({ id, title });
  }
  listing.sort((s1, s2) => parseInt(s1.id) - parseInt(s2.id));
  await fs.promises.writeFile(destFile, JSON.stringify({
    scripts: listing,
  }));
}

async function downloadScripts(scriptsOpt: string | null, scriptsDir: string, assetsDir: string) {
  fs.mkdirSync(scriptsDir, { recursive: true });

  var scripts: string = scriptsOpt || "";
  if (scripts == "favorites") {
    scripts = FAVORITE_SCRIPTS;
  }
  let ids = scripts.split(",").map(s => s.trim()).filter(s => s != "");

  await Promise.all(ids.map(async (id) => {
    let destFile = `${scriptsDir}/${id}.json`;
    if (fs.existsSync(destFile)) {
      console.log(`already have script ${id}.json`);
      return;
    }
    let script = await getScript(id);
    if (script == null) {
      console.error(`could not download ${id}`);
      return;
    }
    await fs.promises.writeFile(destFile, JSON.stringify(script));
    console.log(`downloaded ${id} - ${script.title}`);
  }));

  makeIndex(scriptsDir, `${assetsDir}/scripts.json`);
}

async function cleanAssets(assetsDir: string) {
  async function removeIfPresent(path: string, options?: fs.RmOptions) {
    if (fs.existsSync(path)) {
      return fs.promises.rm(path, options);
    }
  }

  const dataDir = `${assetsDir}/data`;
  const imgDir = `${assetsDir}/img`;
  const staticDir = `${assetsDir}/static`;

  await Promise.all([
    removeIfPresent(dataDir, { recursive: true }),
    removeIfPresent(staticDir, { recursive: true }),
    removeIfPresent(imgDir, { recursive: true }),
    removeIfPresent(`${assetsDir}/scripts.json`),
  ]);
}

async function main() {
  const program = new Command();

  program.version("0.2.0")
    .description("Download assets for BotC sheets")
    .option("--all", "Download all assets (shorthand for --json --img --scripts favorites)")
    .option("--clean", "Delete any existing assets")
    .option("--json", "Download JSON game data")
    .option("--img", "Download images")
    .option("--scripts <ids>", "Download scripts (by pk on botc-scripts)")
    .option("-o, --out <assets dir>", "Path to assets directory", "./assets")
    .parse(process.argv);

  const options = program.opts();

  if (options.all ||
    // if nothing is selected, fetch everything by default
    !(options.json || options.img || options.scripts !== undefined)) {
    options.json = true;
    options.img = true;
    options.scripts = "favorites";
  }

  const assetsDir = options.out;
  const dataDir = `${assetsDir}/data`;
  const imgDir = `${assetsDir}/img`;
  const scriptsDir = `${assetsDir}/static/scripts`;

  if (options.clean) {
    await cleanAssets(assetsDir);
    return;
  }

  if (options.json) {
    console.log("downloading JSON data from script tool");
    fs.mkdirSync(dataDir, { recursive: true });
    await downloadCharacterData(dataDir);
  }

  if (options.img) {
    await downloadImages(imgDir);
  }

  if (options.scripts !== undefined) {
    await downloadScripts(options.scripts, scriptsDir, assetsDir);
  }
}

main();
