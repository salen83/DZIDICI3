import React, { useContext } from "react";
import { MatchesContext } from "../MatchesContext";

export default function Screen5() {
  const { predictions } = useContext(MatchesContext);

  const list = [...predictions]
    .filter(p => !isNaN(p.gg))
    .sort((a, b) => b.gg - a.gg);

  return (
    <div>
      <h2>Rang GG %</h2>

      <table style={{ borderCollapse: "collapse", width: "auto" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", width: "30px" }}>#</th>
            <th style={{ textAlign: "left", width: "70px" }}>Datum</th>
            <th style={{ textAlign: "left", width: "45px" }}>Vreme</th>
            <th style={{ textAlign: "left", width: "110px" }}>Liga</th>
            <th style={{ textAlign: "left", width: "120px" }}>Domaćin</th>
            <th style={{ textAlign: "left", width: "120px" }}>Gost</th>
            <th style={{ textAlign: "left", width: "50px" }}>GG %</th>
          </tr>
        </thead>

        <tbody>
          {list.map((p, i) => {
            const bgColor = p.gg > 80 ? "#c8facc" : "transparent";

            return (
              <tr key={i} style={{ backgroundColor: bgColor }}>
                <td style={{ padding: "2px 4px" }}>{i + 1}</td>
                <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>
                  {p.datum}
                </td>
                <td style={{ padding: "2px 4px" }}>
                  {p.vreme}
                </td>
                <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>
                  {p.liga}
                </td>
                <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>
                  {p.home}
                </td>
                <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>
                  {p.away}
                </td>
                <td style={{ padding: "2px 4px" }}>
                  {p.gg}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
