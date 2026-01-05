import React, { useContext } from "react";
import { MatchesContext } from "../MatchesContext";
import TicketPanel from "../components/TicketPanel";

export default function Screen7() {
  const {
    predictions,
    activeTicket,
    toggleMatchInActiveTicket
  } = useContext(MatchesContext);

  const list = [...predictions]
    .filter(p => !isNaN(p.over2))
    .sort((a, b) => b.over2 - a.over2);

  const isMatchInTicket = (match) => {
    if (!activeTicket) return false;
    return activeTicket.matches.some(
      m =>
        m.home === match.home &&
        m.away === match.away &&
        m.datum === match.datum &&
        m.vreme === match.vreme &&
        m.tip === "2+"
    );
  };

  const handleToggleMatch = (match) => {
    // Screen7 → tip je uvek 2+
    toggleMatchInActiveTicket(match, "2+");
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <table style={{ borderCollapse: "collapse", width: "auto" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", width: "30px" }}>#</th>
            <th style={{ textAlign: "left", width: "70px" }}>Datum</th>
            <th style={{ textAlign: "left", width: "45px" }}>Vreme</th>
            <th style={{ textAlign: "left", width: "88px" }}>Liga</th>
            <th style={{ textAlign: "left", width: "96px" }}>Domaćin</th>
            <th style={{ textAlign: "left", width: "96px" }}>Gost</th>
            <th style={{ textAlign: "left", width: "50px" }}>2+ %</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p, i) => {
            const inTicket = isMatchInTicket(p);
            const bgColor = inTicket
              ? "#add8e6"
              : p.over2 > 80
              ? "#fce8c8"
              : "transparent";

            return (
              <tr
                key={i}
                style={{ backgroundColor: bgColor, cursor: "pointer" }}
                onClick={() => handleToggleMatch(p)}
              >
                <td style={{ padding: "2px 4px" }}>{i + 1}</td>
                <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>{p.datum}</td>
                <td style={{ padding: "2px 4px" }}>{p.vreme}</td>
                <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>{p.liga}</td>
                <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>{p.home}</td>
                <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>{p.away}</td>
                <td style={{ padding: "2px 4px" }}>{p.over2}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <TicketPanel />
    </div>
  );
}
