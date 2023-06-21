import classnames from "classnames";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect } from "react";

export function PlayerNameInput(props: {
  numPlayers: number;
  players: string[];
  setPlayers: (players: string[]) => void;
  haveSetup: boolean;
}): JSX.Element {
  const { numPlayers, players } = props;

  function handleChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    props.setPlayers(ev.target.value.split("\n"));
  }

  const debouncedHandleChange = useCallback(debounce(handleChange, 300), [
    props,
  ]);

  useEffect(() => {
    return () => {
      debouncedHandleChange.cancel();
    };
  }, []);

  function handleClear() {
    props.setPlayers([]);
  }

  return (
    <div className={classnames({ hidden: !props.haveSetup })}>
      <textarea
        id="player_names"
        name="player names"
        cols={15}
        rows={Math.max(numPlayers, players.length)}
        onChange={debouncedHandleChange}
        value={players.join("\n")}
        spellCheck={false}
        autoCapitalize="on"
        autoComplete="off"
      ></textarea>
      <br />
      <button
        className="btn"
        id="clear_players"
        type="button"
        onClick={handleClear}
      >
        clear
      </button>
    </div>
  );
}
