# Feature highlights

BotC tools is a way of running in-person games with a digital grimoire.  You can
use it at <https://botc-tools.xyz>.

As a storyteller, I use it on an iPad to select roles, show them to players, and
then create a "grimoire" image. That image goes into a drawing app (Concepts)
where I write on it to track tokens and anything else I need to for the game.
The app stays on the side and shows me the night order and gives me ways to show
players information ("THIS PLAYER SELECTED YOU" for example), including
character tokens.

The app understands essentially all setup rules, reducing my errors in setup,
especially for custom scripts and lots of setup-impacting abilities. (No more
accidentally using a normal outsider count in a Vigormortis game!)

I prefer players to not use their phones, but sometimes if we don't have a
script printed out the app does provide a mobile-friendly character sheet for
custom scripts.

## Script list

<img src="screenshots/home.webp"
alt="Screenshot showing home page of the app"
width="400">

The tool pulls in all the scripts in the [unofficial script
database](https://botc-scripts.azurewebsites.net/). It does this once and saves
the results, so search is really fast.

The custom scripts listed by default are some that I've recently been playing.

## Roles sheet

<img src="screenshots/roles.webp"
alt="Screenshot showing roles sheet"
width="400">

The roles sheet works better on mobile than using the script tool's PDFs. The
icon in the top right pulls up a QR code to quickly share the page with players.

## Night sheet

<img src="screenshots/night.webp"
alt="Screenshot showing night"
width="400">

On mobile or iPad, the night sheet is a handy reference while running a game. It
can also be printed out. This night sheet gives detailed Storyteller reminders
for each character, similar to the base 3 night sheets but unlike the script
tool.

## Assigning roles

This is most unique part of the app: a helper for selecting, randomizing, and
assigning roles for an in-person game.

The app understands roles that modify setup and tells you when the setup is
correct:

<img src="screenshots/assign.webp"
alt="Screenshot showing assignment feedback"
width="400">

In the screenshot above, we've selected a 7 player game which has base 5/0/1/1
for townsfolk/outsiders/minions/demon. The Drunk requires selecting an
additional townsfolk and the Baron adds two outsiders (subtracting two
townsfolk). The app lets you know this means you need to select 4/2/1/1, and
that's exactly what we have selected. The other roles are grayed out since they
aren't needed to have a valid setup, but they can still be selected.

The rules for setup can really get quite complex (see
[setup.ts](./src/js/botc/setup.ts) for the core logic). For example, there can
be multiple allowed distributions, for characters like the Godfather (+1 or -1
outsider). The number of outsiders can't go above the number on the script, or
below zero, but Vigormortis -1 does cancel Godfather +1. Riot and Legion create
duplicate roles during setup. High Stakes Betting has no Minions at all and only
Riot, which is handled correctly. The Huntsman requires the Damsel, which can be
one of the usual Outsiders or might replace a townsfolk.

---

Below the list of characters the assignment tool shows what tokens are in the
"bag" (or really townsquare, since they are already ordered randomly):

<img src="screenshots/bag.webp"
alt="Screenshot showing assigned roles"
width="400">

Notice that the Drunk is listed because it's in play, but it won't be
distributed to anybody. There are also four buttons:

- Shuffle the roles, if you want to re-randomize setup.
- Clear the current selections.
- Undo the last shuffle/clear, if you made a mistake.
- Redo.

The selections and random order are persisted so if you restart you won't lose
them. (The undo/redo history currently isn't, but that can be implemented as well.)

<img src="screenshots/grimoire.webp"
alt="Screenshot showing townsquare grimoire setup"
width="400">

Finally we have an image that shows the initial Grimoire setup. Player names are
chosen by adding a list just below the image. The grimoire has tokens for every
player, as well as in-play roles that aren't distributed (like Drunk and Fabled)
and the bluffs as reminders for the storyteller.

On my iPad I drag the grimoire image out of the website and into a drawing app
(Concepts), which then serves as a Grimoire where I can track reminders and
communicate with players by writing (you can instead click on the image to copy
it). This is my favorite feature of the app - it really speeds up setup, and
it's much easier to run the game with characters, abilities, and player names
clearly visible.

---

Once you've set up the game, you also have to tell players their roles. Clicking
on a role in the bag list will make it full screen, and you can show that to
each player in turn:

<img src="screenshots/character.webp"
alt="Screenshot showing character assignment screen"
width="400">

You can also show the demon their bluffs:

<img src="screenshots/bluffs.webp"
alt="Screenshot showing bluffs for demon"
width="400">

This also really helps with setup.

## Offline support

An important feature is that the app works offline. This should work
automatically after first load in any browser. You can also "install" the
website as if it were a native mobile app: on iOS or iPadOS, open it in Safari,
click on the share icon, and select "Add to Home Screen". On Android in Chrome
you can click the "three dots" menu and click on "Add to Home Screen". Opening
the site from here will look and feel like any other app - it won't have any
browser UI and will work offline. Note that this is the same website and will
have identical functionality.

## Technical notes

The site relies only on static hosting (provided by GitHub Pages). Everything
runs on the client in JavaScript. There's no synchronization or interaction
between players and the Storyteller, but all storyteller state is stored locally
so you don't lose what you're doing in the middle of a game.
