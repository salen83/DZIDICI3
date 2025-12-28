import React, { useContext, useMemo } from "react";
import { MatchesContext } from "../MatchesContext";

/* helper: siguran procenat */
const pct = (a, b, fallback = 50) => {
  if (!b || isNaN(a) || isNaN(b)) return fallback;
  return (a / b) * 100;
};

export default function Screen4() {
  const { rows, futureMatches } = useContext(MatchesContext);

  /* =======================
     STATISTIKA TIMOVA
  ======================= */
  const teamStats = useMemo(() => {
    const stats = {};

    rows.forEach(r => {
      if (!r.ft || !r.home || !r.away) return;
      if (!r.ft.includes(":")) return;

      const [hg, ag] = r.ft.split(":").map(n => parseInt(n, 10));
      if (isNaN(hg) || isNaN(ag)) return;

      const init = () => ({
        games: 0,
        gg: 0,
        ng: 0,
        over2: 0,
        over7: 0,
        goalsFor: 0,
        goalsAgainst: 0
      });

      if (!stats[r.home]) stats[r.home] = init();
      if (!stats[r.away]) stats[r.away] = init();

      stats[r.home].games++;
      stats[r.away].games++;

      stats[r.home].goalsFor += hg;
      stats[r.home].goalsAgainst += ag;
      stats[r.away].goalsFor += ag;
      stats[r.away].goalsAgainst += hg;

      if (hg > 0 && ag > 0) {
        stats[r.home].gg++;
        stats[r.away].gg++;
      } else {
        stats[r.home].ng++;
        stats[r.away].ng++;
      }

      if (hg + ag >= 2) {
        stats[r.home].over2++;
        stats[r.away].over2++;
      }
      if (hg + ag >= 7) {
        stats[r.home].over7++;
        stats[r.away].over7++;
      }
    });

    return stats;
  }, [rows]);

  /* =======================
     STATISTIKA LIGA
  ======================= */
  const leagueStats = useMemo(() => {
    const stats = {};

    rows.forEach(r => {
      if (!r.ft || !r.liga || !r.ft.includes(":")) return;

      const [hg, ag] = r.ft.split(":").map(n => parseInt(n, 10));
      if (isNaN(hg) || isNaN(ag)) return;

      if (!stats[r.liga]) {
        stats[r.liga] = {
          games: 0,
          gg: 0,
          ng: 0,
          over2: 0,
          over7: 0,
          goals: 0
        };
      }

      const s = stats[r.liga];
      s.games++;
      s.goals += hg + ag;

      if (hg > 0 && ag > 0) s.gg++;
      else s.ng++;

      if (hg + ag >= 2) s.over2++;
      if (hg + ag >= 7) s.over7++;
    });

    return stats;
  }, [rows]);

  /* =======================
     H2H FILTER
  ======================= */
  const getH2H = (home, away) =>
    rows.filter(
      r =>
        r.ft &&
        r.ft.includes(":") &&
        ((r.home === home && r.away === away) ||
         (r.home === away && r.away === home))
    ).map(r => {
      const [hg, ag] = r.ft.split(":").map(Number);
      return { hg, ag };
    });

  /* =======================
     PREDIKCIJA
  ======================= */
  const predict = (m) => {
    const home = teamStats[m.home] || {};
    const away = teamStats[m.away] || {};
    const league = leagueStats[m.liga] || {};

    /* forma */
    const formGG =
      (pct(home.gg, home.games, 50) +
       pct(away.gg, away.games, 50)) / 2;

    const formNG =
      (pct(home.ng, home.games, 50) +
       pct(away.ng, away.games, 50)) / 2;

    const formOver2 =
      (pct(home.over2, home.games, 60) +
       pct(away.over2, away.games, 60)) / 2;

    const formOver7 =
      (pct(home.over7, home.games, 5) +
       pct(away.over7, away.games, 5)) / 2;

    /* liga */
    const leagueGG = pct(league.gg, league.games, 50);
    const leagueNG = pct(league.ng, league.games, 50);
    const leagueOver2 = pct(league.over2, league.games, 60);
    const leagueOver7 = pct(league.over7, league.games, 5);

    /* h2h */
    const h2h = getH2H(m.home, m.away);
    const h2hGG = pct(
      h2h.filter(x => x.hg > 0 && x.ag > 0).length,
      h2h.length,
      50
    );

    /* težine */
    const wForm = 0.5;
    const wLeague = 0.3;
    const wH2H = 0.2;

    return {
      gg: Math.round(wForm*formGG + wLeague*leagueGG + wH2H*h2hGG),
      ng: Math.round(wForm*formNG + wLeague*leagueNG + wH2H*(100-h2hGG)),
      over2: Math.round(wForm*formOver2 + wLeague*leagueOver2 + wH2H*50),
      over7: Math.round(wForm*formOver7 + wLeague*leagueOver7 + wH2H*5),
      avgHome: pct(home.goalsFor, home.games, 1),
      avgAway: pct(away.goalsFor, away.games, 1),
      h2hGG: Math.round(h2hGG)
    };
  };

  const predictions = futureMatches.map(m => ({
    ...m,
    ...predict(m)
  }));

  /* =======================
     UI
  ======================= */
  return (
    <div>
      <h2>Predikcije</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Datum</th>
            <th>Vreme</th>
            <th>Liga</th>
            <th>Home</th>
            <th>Away</th>
            <th>GG %</th>
            <th>NG %</th>
            <th>2+ %</th>
            <th>7+ %</th>
            <th>AVG H</th>
            <th>AVG A</th>
            <th>H2H GG</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p, i) => (
            <tr key={i}>
              <td>{i+1}</td>
              <td>{p.datum}</td>
              <td>{p.vreme}</td>
              <td>{p.liga}</td>
              <td>{p.home}</td>
              <td>{p.away}</td>
              <td>{p.gg}%</td>
              <td>{p.ng}%</td>
              <td>{p.over2}%</td>
              <td>{p.over7}%</td>
              <td>{p.avgHome.toFixed(2)}</td>
              <td>{p.avgAway.toFixed(2)}</td>
              <td>{p.h2hGG}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
