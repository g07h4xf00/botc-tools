/** Encode the rules for BotC setup. */

import { Ranking } from "../randomizer/bag";
import { CardInfo } from "../randomizer/characters";
import { CharacterInfo, RoleType } from "./roles";

export interface Distribution {
  townsfolk: number,
  outsider: number,
  minion: number,
  demon: number,
}

export function zeroDistribution(): Distribution {
  return { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
}

export function distributionForCount(numPlayers: number): Distribution {
  var dist = zeroDistribution();
  dist.demon = 1;
  if (numPlayers == 5 || numPlayers == 6) {
    dist.outsider = numPlayers - 5;
    dist.minion = 1;
  } else {
    dist.outsider = (numPlayers - 7) % 3;
    dist.minion = Math.floor((numPlayers - 7) / 3) + 1;
  }
  dist.townsfolk = numPlayers - dist.outsider - dist.minion - dist.demon;
  return dist;
}

export function actualDistribution(characters: CharacterInfo[]): Distribution {
  var dist = zeroDistribution();
  for (const c of characters) {
    dist[c.roleType]++;
  }
  return dist;
}

/** Get the number of characters of each type taking into account an extra demon
 * (Riot) for each nominal minion. */
export function effectiveDistribution(numPlayers: number, characters: CharacterInfo[]): Distribution {
  var dist = zeroDistribution();
  for (const c of characters) {
    if (c.id == "riot") {
      dist.demon += distributionForCount(numPlayers).minion;
    }
    dist[c.roleType]++;
  }
  return dist;
}

export type SetupModification =
  {
    // eg, Baron (+2), Fang Gu (+1), Vigormortis (-1)
    type: "outsider_count",
    delta: number,
  }
  // +1 townsfolk and does not go in bag (these are identical but it's easier to
  // separate them)
  | { type: "drunk", notInBag: true }
  | { type: "marionette", notInBag: true }
  // +1 minion and does not go in bag
  | { type: "lilmonsta", notInBag: true }
  // +1 or -1 outsider (non-deterministic)
  | { type: "godfather" }
  // +1, -1, or unchanged outsiders
  | { type: "sentinel" }
  // +damsel (allows/might require adding an outsider)
  | { type: "huntsman" }
  // all minions are riot (requires duplicate characters in bag)
  | { type: "riot" }

  // Legion is complicated (need duplicates, non-deterministic).
  // Atheist is complicated (setup is arbitrary but all good).
  ;

function outsiders(delta: number): SetupModification {
  return { type: "outsider_count", delta };
}

export const SetupChanges: { [key: string]: SetupModification } = {
  "baron": outsiders(+2),
  "vigormortis": outsiders(-1),
  "fanggu": outsiders(+1),
  "balloonist": outsiders(+1),
  "drunk": { type: "drunk", notInBag: true },
  "lilmonsta": { type: "lilmonsta", notInBag: true },
  "marionette": { type: "marionette", notInBag: true },
  "godfather": { type: "godfather" },
  "huntsman": { type: "huntsman" },
  "riot": { type: "riot" },
  "sentinel": { type: "sentinel" },
};

export function goesInBag(char: CardInfo): boolean {
  if (char.roleType == "fabled") {
    return false;
  }
  const mod = SetupChanges[char.id];
  if (!mod) {
    return true;
  }
  if (!("notInBag" in mod)) {
    return true;
  }
  return !mod.notInBag;
}

function applyModification(old_dist: Distribution, mod: SetupModification): Distribution[] {
  var dist: Distribution = { ...old_dist };
  switch (mod.type) {
    case "outsider_count": {
      dist.townsfolk -= mod.delta;
      dist.outsider += mod.delta;
      return [dist];
    }
    // these are actually handled the same way
    case "drunk":
    case "marionette": {
      dist.townsfolk++;
      return [dist];
    }
    case "lilmonsta": {
      dist.minion++;
      return [dist];
    }
    case "godfather": {
      dist.townsfolk--;
      dist.outsider++;
      var otherDist = { ...old_dist };
      otherDist.townsfolk++;
      otherDist.townsfolk--;
      return [dist, otherDist];
    }
    case "sentinel": {
      dist.townsfolk--;
      dist.outsider++;
      var otherDist = { ...old_dist };
      otherDist.townsfolk++;
      otherDist.townsfolk--;
      return [dist, otherDist, { ...old_dist }];
    }
    case "huntsman": {
      if (dist.outsider == 0) {
        dist.outsider = 1;
        dist.townsfolk--;
        return [dist];
      }
      // allowed to add Damsel by adding an outsider
      dist.townsfolk--;
      dist.outsider++;
      // ...but we don't have to
      const sameDist = { ...old_dist };
      return [sameDist, dist];
    }
    case "riot": {
      dist.demon += dist.minion;
      dist.minion = 0;
      return [dist];
    }
  }
}

function clampNum(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

function clampDistribution(dist: Distribution, characters: CharacterInfo[]) {
  var totalDist = actualDistribution(characters);
  // allow arbitrary number of demons for clamping purposes (for Riot, Legion)
  totalDist.demon = 15;
  for (const roleType of Object.keys(dist)) {
    dist[roleType] = clampNum(dist[roleType], 0, totalDist[roleType]);
  }
}

export function modifiedDistribution(
  dist: Distribution,
  mods: SetupModification[],
  characters: CharacterInfo[])
  : Distribution[] {
  var dists = [dist];
  for (const mod of mods) {
    dists = dists.flatMap(dist => applyModification(dist, mod));
  }
  for (var dist of dists) {
    clampDistribution(dist, characters);
  }
  // remove duplicates
  var uniqueDists: Distribution[] = [];
  for (const dist of dists) {
    if (uniqueDists.some(d => sameDistribution(d, dist))) {
      // duplicate
      continue;
    }
    uniqueDists.push(dist);
  }
  return uniqueDists;
}

export function modifyingCharacters(
  selection: Set<string>,
  characters: CharacterInfo[],
): CharacterInfo[] {
  var modified: CharacterInfo[] = [];
  selection.forEach(id => {
    if (id in SetupChanges) {
      const c = characters.find(c => c.id == id);
      if (c) { modified.push(c); }
    }
  })
  modified.sort((c1, c2) => c1.name.localeCompare(c2.name));
  return modified;
}

export function targetDistributions(
  numPlayers: number,
  modifying: CharacterInfo[],
  characters: CharacterInfo[],
): Distribution[] {
  const baseDistribution = distributionForCount(numPlayers);
  const newDistributions = modifiedDistribution(
    baseDistribution,
    modifying.map(c => SetupChanges[c.id]),
    characters,
  );
  return newDistributions;
}

function differentRoleTypes(d1: Distribution, d2: Distribution): string[] {
  return ["townsfolk", "outsider", "minion", "demon"].filter(
    roleType => d1[roleType] != d2[roleType]
  );
}

export function sameDistribution(d1: Distribution, d2: Distribution): boolean {
  return differentRoleTypes(d1, d2).length == 0;
}

export function roleTypesDefinitelyDone(targets: Distribution[], d: Distribution): RoleType[] {
  const roles: RoleType[] = ["townsfolk", "outsider", "minion", "demon"];
  return roles.filter(
    roleType => targets.every(td => d[roleType] >= td[roleType])
  );
}

/** Divide the selection into characters in the bag and those "outside" (in play
 * but not distributed). */
export function splitSelectedChars(
  characters: CharacterInfo[],
  selection: Set<string>,
  numPlayers: number): {
    bag: (CardInfo & { riotNum?: number })[],
    outsideBag: CardInfo[],
  } {
  var selected = characters.filter(char => selection.has(char.id));
  var bag: (CardInfo & { riotNum?: number })[] = selected.filter(c => goesInBag(c));
  const numMinions = distributionForCount(numPlayers).minion;
  const riot = bag.find(c => c.id == "riot");
  if (riot) {
    for (var i = 0; i < numMinions; i++) {
      const thisRiot = { riotNum: i, ...riot };
      bag.push(thisRiot);
    }
  }

  var outsideBag = selected.filter(char => !goesInBag(char));
  outsideBag.sort((c1, c2) => c1.name.localeCompare(c2.name));
  return { bag, outsideBag };
}
