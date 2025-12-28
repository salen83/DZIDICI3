import React, { createContext, useState, useEffect } from "react";

export const MatchesContext = createContext();

export function MatchesProvider({ children }) {
  const [rows, setRows] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rows")) || []; }
    catch { return []; }
  });

  const [futureMatches, setFutureMatches] = useState([]);

  const [predictions, setPredictions] = useState([]);

  // Čuvanje rows u localStorage
  useEffect(() => { localStorage.setItem("rows", JSON.stringify(rows)); }, [rows]);

  // ========================
  // AUTOMATSKO RACUNANJE PREDIKCIJA
  // ========================
  useEffect(() => {
    if (!futureMatches.length || !rows.length) {
      setPredictions([]);
      return;
    }

    const pct = (a,b,fallback=50) => (!b||isNaN(a)||isNaN(b)?fallback:(a/b)*100);

    // Statistika timova
    const teamStats = {};
    rows.forEach(r=>{
      if(!r.ft||!r.home||!r.away||!r.ft.includes(":")) return;
      const [hg,ag] = r.ft.split(":").map(Number);
      if(isNaN(hg)||isNaN(ag)) return;

      const init = ()=>({games:0,gg:0,ng:0,over2:0,over7:0,goalsFor:0,goalsAgainst:0});
      if(!teamStats[r.home]) teamStats[r.home]=init();
      if(!teamStats[r.away]) teamStats[r.away]=init();

      teamStats[r.home].games++; teamStats[r.away].games++;
      teamStats[r.home].goalsFor+=hg; teamStats[r.home].goalsAgainst+=ag;
      teamStats[r.away].goalsFor+=ag; teamStats[r.away].goalsAgainst+=hg;

      if(hg>0&&ag>0){ teamStats[r.home].gg++; teamStats[r.away].gg++; }
      else { teamStats[r.home].ng++; teamStats[r.away].ng++; }
      if(hg+ag>=2){ teamStats[r.home].over2++; teamStats[r.away].over2++; }
      if(hg+ag>=7){ teamStats[r.home].over7++; teamStats[r.away].over7++; }
    });

    // Statistika liga
    const leagueStats = {};
    rows.forEach(r=>{
      if(!r.ft||!r.liga||!r.ft.includes(":")) return;
      const [hg,ag]=r.ft.split(":").map(Number);
      if(isNaN(hg)||isNaN(ag)) return;

      if(!leagueStats[r.liga]) leagueStats[r.liga]={games:0,gg:0,ng:0,over2:0,over7:0,goals:0};
      const l = leagueStats[r.liga];
      l.games++; l.goals+=hg+ag;
      if(hg>0&&ag>0) l.gg++; else l.ng++;
      if(hg+ag>=2) l.over2++; if(hg+ag>=7) l.over7++;
    });

    // H2H funkcija
    const getH2H = (home,away)=>rows.filter(r=>r.ft&&r.ft.includes(":")&&((r.home===home&&r.away===away)||(r.home===away&&r.away===home))).map(r=>{
      const [hg,ag]=r.ft.split(":").map(Number);
      return {hg,ag};
    });

    // Predikcija
    const predict = m=>{
      const home=teamStats[m.home]||{};
      const away=teamStats[m.away]||{};
      const league=leagueStats[m.liga]||{};

      const formGG=(pct(home.gg,home.games,50)+pct(away.gg,away.games,50))/2;
      const formNG=(pct(home.ng,home.games,50)+pct(away.ng,away.games,50))/2;
      const formOver2=(pct(home.over2,home.games,60)+pct(away.over2,away.games,60))/2;
      const formOver7=(pct(home.over7,home.games,5)+pct(away.over7,away.games,5))/2;

      const leagueGG=pct(league.gg,league.games,50);
      const leagueNG=pct(league.ng,league.games,50);
      const leagueOver2=pct(league.over2,league.games,60);
      const leagueOver7=pct(league.over7,league.games,5);

      const h2h=getH2H(m.home,m.away);
      const h2hGG=pct(h2h.filter(x=>x.hg>0&&x.ag>0).length,h2h.length,50);

      const wForm=0.5, wLeague=0.3, wH2H=0.2;

      return {
        gg: Math.round(wForm*formGG+wLeague*leagueGG+wH2H*h2hGG),
        ng: Math.round(wForm*formNG+wLeague*leagueNG+wH2H*(100-h2hGG)),
        over2: Math.round(wForm*formOver2+wLeague*leagueOver2+wH2H*50),
        over7: Math.round(wForm*formOver7+wLeague*leagueOver7+wH2H*5),
        avgHome:pct(home.goalsFor,home.games,1),
        avgAway:pct(away.goalsFor,away.games,1),
        h2hGG:Math.round(h2hGG)
      };
    };

    const preds = futureMatches.map(m=>({...m,...predict(m)}));
    setPredictions(preds);

  }, [rows,futureMatches]);

  return (
    <MatchesContext.Provider value={{rows,setRows,futureMatches,setFutureMatches,predictions,setPredictions}}>
      {children}
    </MatchesContext.Provider>
  );
}
