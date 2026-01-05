import React, { useContext } from "react";
import { MatchesContext } from "../MatchesContext";
import TicketPanel from "../components/TicketPanel";

export default function Screen6() {
  const {
    predictions,
    activeTicket,
    toggleMatchInActiveTicket
  } = useContext(MatchesContext);

  const list = [...predictions]
    .filter(p => !isNaN(p.ng))
    .sort((a, b) => b.ng - a.ng);

  const isMatchInTicket = (match) => {
    if (!activeTicket) return false;
    return activeTicket.matches.some(
      m =>
        m.home === match.home &&
        m.away === match.away &&
        m.datum === match.datum &&
        m.vreme === match.vreme &&
        m.tip === "NG"
    );
  };

  const handleToggleMatch = (match) => {
    // Screen6 → tip je uvek NG
    toggleMatchInActiveTicket(match, "NG");
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* Tabela mečeva */}
      <table style={{ borderCollapse: "collapse", width: "auto" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", width: "30px" }}>#</th>
            <th style={{ textAlign: "left", width: "70px" }}>Datum</th>
            <th style={{ textAlign: "left", width: "45px" }}>Vreme</th>
            <th style={{ textAlign: "left", width: "88px" }}>Liga</th>
            <th style={{ textAlign: "left", width: "96px" }}>Domaćin</th>
            <th style={{ textAlign: "left", width: "96px" }}>Gost</th>
            <th style={{ textAlign: "left", width: "50px" }}>NG %</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p, i) => {
            const inTicket = isMatchInTicket(p);
            const bgColor = inTicket
              ? "#add8e6"
              : p.ng > 80
              ? "#fcdcc8"
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
                <td style={{ padding: "2px 4px" }}>{p.ng}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Panel sa tiketom */}
      <TicketPanel />
    </div>
  );
}
