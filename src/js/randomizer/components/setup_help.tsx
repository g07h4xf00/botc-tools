import "../../icons";
import { CharacterContext } from "../character_context";
import { Selection } from "../selection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  SetupModification,
  SetupChanges,
  Distribution,
  effectiveDistribution,
  sameDistribution,
  modifyingCharacters,
  targetDistributions,
  splitSelectedChars,
  uniqueDistributions,
} from "botc/setup";
import classnames from "classnames";
import { characterClass } from "components/character_icon";
import { Distr } from "components/num_players";
import React, { useContext } from "react";

export function LegionDistr({ dist }: { dist: Distribution }): JSX.Element {
  return (
    <span className="distribution">
      <span className="good">{dist.townsfolk + dist.outsider}</span>/
      <span className="evil">{dist.demon}</span>
    </span>
  );
}

export function AtheistDistr({ dist }: { dist: Distribution }): JSX.Element {
  return (
    <span className="distribution">
      <span className="good">{dist.townsfolk + dist.outsider}</span>/
      <span className="evil">0</span>
    </span>
  );
}

function arrayEq<T>(a1: T[], a2: T[]): boolean {
  return a1.length == a2.length && a1.every((v, i) => a2[i] === v);
}

function ModificationExplanation(props: {
  mod: SetupModification;
}): JSX.Element {
  const { mod } = props;
  switch (mod.type) {
    case "outsider_count": {
      if (mod.delta.length == 1) {
        const delta = mod.delta[0];
        const change = Math.abs(delta);
        const sign = delta > 0 ? <>+</> : <>&#x2212;</>;
        const plural = change == 1 ? "" : "s";
        return (
          <span>
            ({sign}
            {change} outsider{plural})
          </span>
        );
      }
      if (arrayEq(mod.delta, [+1, -1])) {
        return <span>(+1 or &#x2212;1 outsider)</span>;
      }
      if (arrayEq(mod.delta, [0, +1, -1])) {
        return <span>(might be +1 or &#x2212;1 outsider)</span>;
      }
      console.warn(`unhandled modifier ${mod}`);
      return <span>(unknown)</span>;
    }
    case "drunk":
    case "marionette": {
      return <span>(+1 townsfolk, not distributed)</span>;
    }
    case "lilmonsta": {
      return <span>(+1 minion, not distributed)</span>;
    }
    case "huntsman": {
      return (
        <span>
          (+the <span className="good">Damsel</span>)
        </span>
      );
    }
    case "choirboy": {
      return (
        <span>
          (+the <span className="good">King</span>)
        </span>
      );
    }
    case "riot": {
      return (
        <span>
          (All minions are <span className="evil">Riot</span>)
        </span>
      );
    }
    case "legion": {
      return (
        <span>
          (Most players are <span className="evil">Legion</span>)
        </span>
      );
    }
    case "atheist": {
      return <span>(No evil, setup is arbitrary)</span>;
    }
  }
}

export function SetupModifiers(props: {
  numPlayers: number;
  selection: Selection;
}) {
  const { numPlayers, selection } = props;
  const characters = useContext(CharacterContext);
  const modified = modifyingCharacters(selection);
  const newDistributions = targetDistributions(
    numPlayers,
    modified,
    characters
  );

  const selected = characters.filter((c) => selection.has(c.id));
  const actual = effectiveDistribution(numPlayers, selected);
  const distributionCorrect = newDistributions.some((dist) =>
    sameDistribution(dist, actual)
  );

  let goalDistributionElement: JSX.Element = (
    <>
      {newDistributions
        .map((dist, i) => <Distr dist={dist} key={i} />)
        .reduce((acc, x) =>
          acc === null ? (
            x
          ) : (
            <>
              {acc} or {x}
            </>
          )
        )}
    </>
  );
  if (selection.has("legion")) {
    // only for presentation purposes
    const newLegionDistributions: Distribution[] = uniqueDistributions(
      newDistributions.map((dist) => {
        return {
          townsfolk: dist.townsfolk + dist.outsider,
          outsider: 0,
          minion: 0,
          demon: dist.demon,
        };
      })
    );
    goalDistributionElement = (
      <>
        {newLegionDistributions
          .map((dist, i) => <LegionDistr dist={dist} key={i} />)
          .reduce((acc, x) =>
            acc === null ? (
              x
            ) : (
              <>
                {acc} or {x}
              </>
            )
          )}
      </>
    );
  }
  if (selection.has("atheist")) {
    const atheistDistribution: Distribution = {
      townsfolk: numPlayers,
      outsider: 0,
      minion: 0,
      demon: 0,
    };
    goalDistributionElement = <AtheistDistr dist={atheistDistribution} />;
  }

  return (
    <div className="modifiers">
      <br />
      {modified.map((char) => {
        return (
          <div key={char.id}>
            <span className={classnames(characterClass(char), "bold")}>
              {char.name}
            </span>
            <span>
              {" "}
              {<ModificationExplanation mod={SetupChanges[char.id]} />}
            </span>
          </div>
        );
      })}
      <div className="distribution-help">
        <div>
          <span className="label">goal</span>
          <FontAwesomeIcon icon="location-crosshairs" />
          {goalDistributionElement}
        </div>
        <div>
          <span className="label">current</span>
          <FontAwesomeIcon icon="down-long" />
          <Distr dist={actual} />
          {distributionCorrect && (
            <span className="success">
              <FontAwesomeIcon icon="circle-check" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function BagSetupHelp(props: {
  numPlayers: number;
  selection: Selection;
}): JSX.Element {
  const { numPlayers, selection } = props;
  const characters = useContext(CharacterContext);
  const modified = modifyingCharacters(selection);
  const targets = targetDistributions(numPlayers, modified, characters);
  const selected = characters.filter((c) => selection.has(c.id));
  const actual = effectiveDistribution(numPlayers, selected);

  const { bag } = splitSelectedChars(characters, selection, numPlayers);

  if (bag.length == numPlayers) {
    if (targets.some((d) => sameDistribution(d, actual))) {
      return (
        <span className="success">
          {bag.length}/{numPlayers} characters &nbsp;
          <FontAwesomeIcon icon="circle-check" />
        </span>
      );
    }
    // the right total number but something is wrong with the distribution
    return (
      <>
        {bag.length}/{numPlayers} characters
        <span className="error">
          {" "}
          (<FontAwesomeIcon icon="thumbs-down" /> distribution)
        </span>
      </>
    );
  }
  return (
    <span className="error">
      {bag.length}/{numPlayers} characters
    </span>
  );
}