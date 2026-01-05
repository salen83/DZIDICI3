import React, { createContext, useState, useEffect } from "react";
import { calculateTicketInfluence } from "./ticketInfluence";

export const MatchesContext = createContext();

export function MatchesProvider({ children }) {
  const [rows, setRows] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rows")) || []; } 
    catch { return []; }
  });

  const [futureMatches, setFutureMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const [tickets, setTickets] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tickets")) || { otvoreni: [], dobitni: [], gubitni: [] }; } 
    catch { return { otvoreni: [], dobitni: [], gubitni: [] }; }
  });

  const [activeTicket, setActiveTicket] = useState(() => {
    try { return JSON.parse(localStorage.getItem("activeTicket")) || null; } 
    catch { return null; }
  });

  const toggleMatchInActiveTicket = (match, tip) => {
    setActiveTicket(prev => {
      const baseMatch = { datum: match.datum, vreme: match.vreme, liga: match.liga, home: match.home, away: match.away, tip, rezultat: "", status: "pending" };
      if (!prev) {
        const now = new Date();
        const name = `Tiket ${now.toISOString().replace("T"," ").slice(0,19)}`;
        return { id: Date.now(), name, matches: [baseMatch] };
      }
      const exists = prev.matches.find(m => m.home===baseMatch.home && m.away===baseMatch.away && m.datum===baseMatch.datum && m.vreme===baseMatch.vreme && m.tip===baseMatch.tip);
      if (exists) return { ...prev, matches: prev.matches.filter(m => m!==exists) };
      return { ...prev, matches: [...prev.matches, baseMatch] };
    });
  };

  const saveActiveTicket = () => {
    if (!activeTicket || !activeTicket.matches.length) return;
    setTickets(prev => ({ ...prev, otvoreni: [...prev.otvoreni, activeTicket] }));
    setActiveTicket(null);
  };

  const checkTicketsFromResults = () => {
    setTickets(prev => {
      const opened = [];
      const won = [...prev.dobitni];
      const lost = [...prev.gubitni];

      prev.otvoreni.forEach(ticket => {
        let allChecked = true;
        let allPassed = true;

        const checkedMatches = ticket.matches.map(m => {
          const r = rows.find(x => x.home===m.home && x.away===m.away && x.datum===m.datum && x.vreme===m.vreme && x.ft && x.ft.includes(":"));
          if (!r) { allChecked=false; return m; }
          const [hg, ag] = r.ft.split(":").map(Number);
          let passed = false;
          if (m.tip==="GG") passed = hg>0 && ag>0;
          if (m.tip==="NG") passed = hg===0 || ag===0;
          if (m.tip==="2+") passed = hg+ag>=2;
          if (m.tip==="7+") passed = hg+ag>=7;
          if (!passed) allPassed=false;
          return { ...m, rezultat: passed?"✔":"✖", status: passed?"win":"lose" };
        });

        const newTicket = { ...ticket, matches: checkedMatches };
        if (!allChecked) opened.push(newTicket);
        else if (allPassed) won.push({ ...newTicket, status:"win" });
        else lost.push({ ...newTicket, status:"lose" });
      });

      return { otvoreni: opened, dobitni: won, gubitni: lost };
    });
  };

  useEffect(() => { if(rows.length) checkTicketsFromResults(); }, [rows]);
  useEffect(() => { localStorage.setItem("rows", JSON.stringify(rows)); }, [rows]);
  useEffect(() => { localStorage.setItem("tickets", JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem("activeTicket", JSON.stringify(activeTicket)); }, [activeTicket]);

  // ===============================
  // PREDIKCIJA SA FORMOM, LIGOM, H2H I TIKETIMA
  // ===============================
  useEffect(() => {
    if (!futureMatches.length || !rows.length) { setPredictions([]); return; }

    const pct = (a,b,f=50) => (!b ? f : (a/b)*100);

    // Team stats
    const teamStats = {};
    rows.forEach(r => {
      if (!r.ft || !r.home || !r.away) return;
      const [hg, ag] = r.ft.split(":").map(Number);
      if (isNaN(hg) || isNaN(ag)) return;
      const init = () => ({ g:0, gg:0, ng:0, o2:0, o7:0, goalsFor:0, goalsAgainst:0 });
      teamStats[r.home] ??= init();
      teamStats[r.away] ??= init();
      teamStats[r.home].g++; teamStats[r.away].g++;
      teamStats[r.home].goalsFor += hg; teamStats[r.home].goalsAgainst += ag;
      teamStats[r.away].goalsFor += ag; teamStats[r.away].goalsAgainst += hg;
      if(hg>0 && ag>0){ teamStats[r.home].gg++; teamStats[r.away].gg++; }
      else { teamStats[r.home].ng++; teamStats[r.away].ng++; }
      if(hg+ag>=2){ teamStats[r.home].o2++; teamStats[r.away].o2++; }
      if(hg+ag>=7){ teamStats[r.home].o7++; teamStats[r.away].o7++; }
    });

    // H2H map
    const h2hMap = {};
    rows.forEach(r => {
      if(!r.ft || !r.home || !r.away) return;
      const [hg, ag] = r.ft.split(":").map(Number);
      if(isNaN(hg)||isNaN(ag)) return;
      h2hMap[r.home] ??= {};
      h2hMap[r.away] ??= {};
      h2hMap[r.home][r.away] ??= [];
      h2hMap[r.away][r.home] ??= [];
      h2hMap[r.home][r.away].push({ hg, ag });
      h2hMap[r.away][r.home].push({ hg: ag, ag: hg });
    });

    // League stats
    const leagueStats = {};
    rows.forEach(r=>{
      if(!r.ft || !r.liga) return;
      const [hg, ag] = r.ft.split(":").map(Number);
      if(isNaN(hg)||isNaN(ag)) return;
      leagueStats[r.liga] ??= { g:0, gg:0, ng:0, o2:0, o7:0, goals:0 };
      const s = leagueStats[r.liga];
      s.g++; s.goals += hg+ag;
      if(hg>0 && ag>0) s.gg++; else s.ng++;
      if(hg+ag>=2) s.o2++; if(hg+ag>=7) s.o7++;
    });

    // Ticket influence map
    const ticketMap = calculateTicketInfluence(tickets);

    const wForm=0.5, wLeague=0.3, wH2H=0.2;

    const preds = futureMatches.map(m => {
      const home=teamStats[m.home]||{};
      const away=teamStats[m.away]||{};
      const league=leagueStats[m.liga]||{};

      const formGG=(pct(home.gg,home.g,50)+pct(away.gg,away.g,50))/2;
      const formNG=(pct(home.ng,home.g,50)+pct(away.ng,away.g,50))/2;
      const formOver2=(pct(home.o2,home.g,60)+pct(away.o2,away.g,60))/2;
      const formOver7=(pct(home.o7,home.g,5)+pct(away.o7,away.g,5))/2;

      const leagueGG=pct(league.gg,league.g,50);
      const leagueNG=pct(league.ng,league.g,50);
      const leagueOver2=pct(league.o2,league.g,60);
      const leagueOver7=pct(league.o7,league.g,5);

      const h2h=h2hMap[m.home]?.[m.away];
      const h2hGG=h2h ? pct(h2h.filter(x=>x.hg>0 && x.ag>0).length,h2h.length,50) : 50;

      // Ticket influence per team/type
      const tiGG=(ticketMap[m.home]?.GG||0) + (ticketMap[m.away]?.GG||0);
      const tiNG=(ticketMap[m.home]?.NG||0) + (ticketMap[m.away]?.NG||0);
      const tiOver2=(ticketMap[m.home]?.["2+"]||0) + (ticketMap[m.away]?.["2+"]||0);
      const tiOver7=(ticketMap[m.home]?.["7+"]||0) + (ticketMap[m.away]?.["7+"]||0);

      return {
        ...m,
        gg: Math.round(wForm*formGG + wLeague*leagueGG + wH2H*h2hGG + tiGG),
        ng: Math.round(wForm*formNG + wLeague*leagueNG + wH2H*(100-h2hGG) + tiNG),
        over2: Math.round(wForm*formOver2 + wLeague*leagueOver2 + wH2H*50 + tiOver2),
        over7: Math.round(wForm*formOver7 + wLeague*leagueOver7 + wH2H*5 + tiOver7)
      };
    });

    setPredictions(preds);

  }, [rows, futureMatches, tickets]);

  return (
    <MatchesContext.Provider value={{
      rows, setRows,
      futureMatches, setFutureMatches,
      predictions,
      tickets, setTickets,
      activeTicket, setActiveTicket,
      toggleMatchInActiveTicket,
      saveActiveTicket
    }}>
      {children}
    </MatchesContext.Provider>
  );
}
