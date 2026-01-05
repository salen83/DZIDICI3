import React, { useContext } from "react";
import { MatchesContext } from "../MatchesContext";
import TicketPanel from "../components/TicketPanel";

export default function Screen8() {
  const {
    predictions,
    activeTicket,
    toggleMatchInActiveTicket
  } = useContext(MatchesContext);

  const list = [...predictions]
    .filter(p => !isNaN(p.over7))
    .sort((a, b) => b.over7 - a.over7);

  const isMatchInTicket = (match) => {
    if (!activeTicket) return false;
    return activeTicket.matches.some(
      m =>
        m.home === match.home &&
        m.away === match.away &&
        m.datum === match.datum &&
        m.vreme === match.vreme &&
        m.tip === "7+"
    );
  };

  const handleToggleMatch = (match) => {
    // Screen8 → tip je uvek 7+
    toggleMatchInActiveTicket(match, "7+");
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
            <th style={{ textAlign: "left", width: "50px" }}>7+ %</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p, i) => {
            const inTicket = isMatchInTicket(p);
            const bgColor = inTicket
              ? "#add8e6"
              : p.over7 > 80
              ? "#f8d1f0"
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
                <td style={{ padding: "2px 4px" }}>{p.over7}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <TicketPanel />
    </div>
  );
}
