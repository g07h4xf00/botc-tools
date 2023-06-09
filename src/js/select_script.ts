import { ScriptData } from "./botc/script";
import { getScripts } from "./get_scripts";

function selectedScriptId(): string {
  if (window.location.hash != "") {
    const id = window.location.hash.substring(1);
    return id;
  }
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    return id;
  }
  // default to Trouble Brewing
  return "178";
}

export async function selectedScript(): Promise<ScriptData> {
  const id = selectedScriptId();
  const scripts = await getScripts();
  const script = scripts.find(s => s.pk.toString() == id);
  if (!script) {
    throw new Error(`unknown script id ${id}`);
  }
  return script;
}
