import { nightorder } from "./nightorder";

// To show nothing for a night reminder, set it to an empty string "".
//
// nights sets both firstNight and otherNights implicitly
export interface Override {
  ability?: string;
  nights?: string;
  homebrew?: {
    name: string;
    roleType: "townsfolk" | "outsider" | "minion" | "demon";
    firstNightIndex?: number;
    otherNightsIndex?: number;
  };
  firstNight?: string;
  otherNights?: string;
  firstNightIndex?: number;
  otherNightsIndex?: number;
}

type Overrides = { [key: string]: Override };

// Changes to base + experimental roles, usually to make more concise or fix
// formatting for the tool.
const baseOverrides: Overrides = {
  philosopher: {
    nights:
      `The Philosopher might pick a good character. If they chose a character:` +
      `<tab>Give them that ability.
      <tab>If the character is in play, make them drunk.`,
  },
  washerwoman: {
    firstNight: "Show a Townsfolk token and two players.",
  },
  librarian: {
    firstNight: "Show an Outsider token and two players.",
  },
  investigator: {
    firstNight: "Show a Minion token and two players.",
  },
  chef: {
    firstNight: "Show the number of pairs of neighboring evil players.",
  },
  clockmaker: {
    firstNight: "Show the number of places from Demon to closest Minion.",
  },
  lunatic: {
    firstNight: `If 7 or more players: <tab>Show THESE ARE YOUR MINIONS. Point to "Minions".
    <tab>Show three bluffs.
    <tab>Put the Lunatic to sleep.
    Wake the demon. Show the YOU ARE token, and the Demon token.
    Show THIS PLAYER IS and the Lunatic token, point to the Lunatic.
    `,
    otherNights: "Do whatever is needed to simulate the demon.",
  },
  cerenovus: {
    nights: `The Cerenovus chooses a player and character. Wake the target.
    Show THIS CHARACTER SELECTED YOU, the Cerenovus token, and the madness character.`,
  },
  poisoner: {
    nights: "The Poisoner picks a player to poison.",
  },
  fortuneteller: {
    nights:
      "The Fortune Teller points to two players. Give a yes if one is the Demon (or red herring).",
  },
  cultleader: {
    nights:
      "The Cult Leader might change alignment to match an alive neighbor. If it changed, tell the Cult Leader YOU ARE EVIL or YOU ARE GOOD.",
  },
  monk: {
    otherNights: "The Monk protects a player from the Demon.",
  },
  innkeeper: {
    otherNights:
      "The Innkeeper points to two players, who are both safe from the Demon. One is drunk.",
  },
  imp: {
    otherNights: `The Imp kills a player. If they chose themselves,
    replace an alive Minion with an Imp token. Show them YOU ARE and then the Imp token.`,
  },
  towncrier: {
    otherNights: "Give a 'yes' or 'no' for if a Minion nominated today.",
  },
  snakecharmer: {
    nights: `The Snake Charmer points to a player. If that player is the Demon:<tab>swap the Demon and Snake Charmer character and alignments.
<tab>Wake each player and show them YOU ARE and their new role and alignment.
The new Snake Charmer is poisoned.
    `,
  },
  // use new more-specific token texts
  damsel: {
    firstNight: `Wake all the Minions, show them THIS CHARACTER IS IN PLAY and the Damsel token.`,
  },
  king: {
    firstNight: `Wake the Demon, show them THIS PLAYER IS and point to the King player.`,
  },
  marionette: {
    firstNight:
      `Select one of the good players next to the Demon and mark them ` +
      `with Is the Marionette. Wake the Demon and show them THIS PLAYER IS ` +
      `and the Marionette token.`,
  },
  exorcist: {
    otherNights:
      `The Exorcist points to a player, different from the previous night. If that player is the Demon: ` +
      `<tab>Wake the Demon.
      <tab>Show THIS PLAYER IS and the Exorcist.
      <tab>The Demon does not act tonight.`,
  },
  bountyhunter: {
    firstNight: `Point to 1 evil player. Wake the townsfolk who is evil and show them YOU ARE EVIL and the thumbs-down sign.`,
  },
  mezepheles: {
    otherNights: `Wake the 1st good player that said the Mezepheles' secret word and show them YOU ARE EVIL and the thumbs-down sign.`,
  },
};

// new roles not in BotC online
const newRoles: Overrides = {
  knight: {
    ability: "You start knowing 2 players that are not the Demon.",
    firstNight: "Point to the two players marked Know (one is the Demon).",
  },
  steward: {
    ability: "You start knowing 1 good player.",
    firstNight: "Point to the player marked Know (who is good).",
  },
  vizier: {
    ability:
      "All players know who you are. You cannot die during the day. If good voted, you may choose to execute immediately.",
    firstNight: "Announce which player is the Vizier.",
  },
  organgrinder: {
    ability:
      "All players keep their eyes closed when voting & the vote tally is secret. Votes for you only count if you vote.",
  },
  highpriestess: {
    ability:
      "Each night, learn which player the Storyteller believes you should talk to most.",
    nights: "Point to a player the High Priestess should talk to.",
  },
};

// fabled do not have abilities in the botc online data
const fabledRoles: Overrides = {
  spiritofivory: {
    ability: "There can't be more than 1 extra evil player.",
  },
  doomsayer: {
    ability: `If 4 or more players live, each living player may publicly
choose (once per game) that a player of their own alignment dies.`,
  },
  duchess: {
    ability: `Each day, 3 players may choose to visit you.
At night*, each visitor learns how many visitors are evil, but 1 gets false info.`,
  },
  sentinel: {
    ability: `There might be 1 extra or 1 fewer Outsider in play.`,
  },
  stormcatcher: {
    ability: `Name a good character. If in play, they can only
die by execution, but evil players learn which player it is.`,
  },
  angel: {
    ability: `Something bad might happen to whoever is most responsible for the death of a new player.`,
  },
  toymaker: {
    ability: `The Demon may choose not to attack & must do this at least once per game. Evil players get normal starting info.`,
  },
  buddhist: {
    ability: `For the first 2 minutes of each day, veteran players may not talk.`,
  },
  hellslibrarian: {
    ability: `Something bad might happen to whoever talks when the Storyteller has asked for silence.`,
  },
  fiddler: {
    ability: `Once per game, the Demon secretly chooses an opposing player: all players choose which of these 2 players win.`,
  },
  fibbin: {
    ability: `Once per game, 1 good player might get incorrect information.`,
  },
};

// homebrew characters
const homebrewRoles: Overrides = {
  actor: {
    ability: `Whoever wins, loses & whoever loses, wins, even if you are dead. [All good players are Actors and know each other]`,
    firstNight: `Wake up all Actors and let them see each other.`,
    homebrew: {
      name: "Actor",
      roleType: "townsfolk",
      firstNightIndex: nightorder.firstNight("Pukka") + 1,
    },
  },
  lout: {
    ability: `On night three, learn an evil townsfolk. [1 Townsfolk is evil]`,
    firstNight: `Wake the townsfolk who is evil and show them YOU ARE EVIL and the thumbs-down sign.`,
    otherNights: `If it is night three, wake the Lout and point to an evil townsfolk.`,
    homebrew: {
      name: "Lout",
      roleType: "outsider",
      // very early
      firstNightIndex: 1,
      otherNightsIndex: nightorder.otherNights("Empath"),
    },
  },
};

// amnesiacs of any category
const amnesiacs: Overrides = {
  amnesiacoutsider: {
    ability: `Outsider. You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.`,
    firstNight: `Decide the Amnesiac's entire ability.
    If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    otherNights: `If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    homebrew: {
      name: "Amnesiac (O)",
      roleType: "outsider",
      firstNightIndex: nightorder.firstNight("Amnesiac"),
      otherNightsIndex: nightorder.otherNights("Amnesiac"),
    },
  },
  amnesiacminion: {
    ability: `Minion. You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.`,
    firstNight: `Decide the Amnesiac's entire ability.
    If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    otherNights: `If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    homebrew: {
      name: "Amnesiac (M)",
      roleType: "minion",
      firstNightIndex: nightorder.firstNight("Amnesiac"),
      otherNightsIndex: nightorder.otherNights("Amnesiac"),
    },
  },
  amnesiacdemon: {
    ability: `Demon. You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.`,
    firstNight: `Decide the Amnesiac's entire ability.
    If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    otherNights: `If the Amnesiac's ability causes them to wake tonight:
    Wake the Amnesiac and run their ability.`,
    homebrew: {
      name: "Amnesiac (D)",
      roleType: "demon",
      firstNightIndex: nightorder.firstNight("Amnesiac"),
      otherNightsIndex: nightorder.otherNights("Amnesiac"),
    },
  },
};

const overrideList: { [key: string]: Override } = {
  ...baseOverrides,
  ...newRoles,
  ...fabledRoles,
  ...homebrewRoles,
  ...amnesiacs,
};

function getOverride(id: string): Override {
  return overrideList[id] ?? {};
}

export const overrides = {
  all: overrideList,
  get: getOverride,
  firstNight: (id: string): string | null => {
    const override = getOverride(id);
    return override.nights ?? override.firstNight ?? null;
  },
  firstNightIndex: (id: string): number | null => {
    const override = getOverride(id);
    return override.homebrew?.firstNightIndex ?? null;
  },
  otherNights: (id: string): string | null => {
    const override = getOverride(id);
    return override.nights ?? override.otherNights ?? null;
  },
  otherNightsIndex: (id: string): number | null => {
    const override = getOverride(id);
    return override.homebrew?.otherNightsIndex ?? null;
  },
  ability: (id: string): string | null => {
    const override = getOverride(id);
    return override.ability ?? null;
  },
};
