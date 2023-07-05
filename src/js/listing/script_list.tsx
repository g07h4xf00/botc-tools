import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { nameToId } from "botc/roles";
import {
  ScriptData,
  getCharacterList,
  isTeensyville,
  onlyBaseThree,
} from "botc/script";
import { darken } from "polished";
import { pageUrl } from "routing";

export const BaseThree = [178, 180, 181];

const TagSpan = styled.span`
  border: 2px dotted gray;
  border-radius: 0.25rem;
  background-color: ${darken(0.1, "white")};
  font-size: 90%;
  padding: 0.1rem;
`;

function ScriptTitleTags({ script }: { script: ScriptData }): JSX.Element {
  // TODO: normalizing these ids is an ugly hack, we should standardize on
  // script tool IDs
  const chars = getCharacterList(script.characters.map((id) => nameToId(id)));
  return (
    <>
      <a href={pageUrl("roles", script.pk)}>{script.title}</a>
      {isTeensyville(chars) && (
        <>
          &nbsp;<TagSpan>teensy</TagSpan>
        </>
      )}
      {onlyBaseThree(chars) && !BaseThree.includes(script.pk) && (
        <>
          &nbsp;<TagSpan>base3</TagSpan>
        </>
      )}
    </>
  );
}

export function ScriptList(props: { scripts: ScriptData[] }): JSX.Element {
  return (
    <ul css={{ fontSize: "120%" }}>
      {props.scripts.map((script) => {
        return (
          <li key={script.pk}>
            <FontAwesomeIcon icon="table-list" />
            &nbsp;
            <ScriptTitleTags script={script} />
          </li>
        );
      })}
    </ul>
  );
}
