import React, { createContext, useState, useEffect } from "react";
import { buildPoissonModel, predictMatch } from "./utils/poissonEngine";
import { calculateTicketInfluence } from "./ticketInfluence";

export const MatchesContext = createContext();

export function MatchesProvider({ children }) {

  const [rows, setRows] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rows")) || []; }
    catch { return []; }
  });

  const [futureMatches, setFutureMatches] = useState([]);
  const [tickets, setTickets] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tickets")) || { otvoreni: [], dobitni: [], gubitni: [] }; }
    catch { return { otvoreni: [], dobitni: [], gubitni: [] }; }
  });
  const [activeTicket, setActiveTicket] = useState(() => {
    try { return JSON.parse(localStorage.getItem("activeTicket")) || null; }
    catch { return null; }
  });

  const [selectedMatchesByScreen, setSelectedMatchesByScreen] = useState({
    screen5: [],
    screen6: [],
    screen7: [],
    screen8: []
  });

  const [predictionsHybrid, setPredictionsHybrid] = useState([]);
  const [predictionsPoisson, setPredictionsPoisson] = useState([]);
  const [predictionsFinal, setPredictionsFinal] = useState([]);
  const [teamPoissonStats, setTeamPoissonStats] = useState([]);

  // --- Toggle meča u aktivnom tiketu ---
  const toggleMatchInActiveTicket = (match, tip, screen=null) => {
    setActiveTicket(prev => {
      const baseMatch = { datum: match.datum, vreme: match.vreme, liga: match.liga, home: match.home, away: match.away, tip, rezultat:"", status:"pending" };
      if(!prev){
        const now = new Date();
        const name = `Tiket ${now.toISOString().replace("T"," ").slice(0,19)}`;
        return { id: Date.now(), name, matches: [baseMatch] };
      }
      const exists = prev.matches.find(m => m.home===baseMatch.home && m.away===baseMatch.away && m.datum===baseMatch.datum && m.vreme===baseMatch.vreme && m.tip===baseMatch.tip);
      if(exists) return { ...prev, matches: prev.matches.filter(m=>m!==exists) };
      return { ...prev, matches: [...prev.matches, baseMatch] };
    });

    if(screen){
      setSelectedMatchesByScreen(prev=>{
        const existing = prev[screen] || [];
        const exists = existing.find(m=>m.home===match.home && m.away===match.away && m.datum===match.datum && m.vreme===match.vreme);
        const updated = exists ? existing.filter(m=>!(m.home===match.home && m.away===match.away && m.datum===match.datum && m.vreme===match.vreme)) : [...existing, match];
        return {...prev, [screen]: updated};
      });
    }
  };

  // --- Toggle selekcije mečeva po screenu ---
  const toggleMatchSelection = (screen, match) => {
    setSelectedMatchesByScreen(prev=>{
      const existing = prev[screen] || [];
      const exists = existing.find(m=>m.home===match.home && m.away===match.away && m.datum===match.datum && m.vreme===match.vreme);
      const updated = exists ? existing.filter(m=>!(m.home===match.home && m.away===match.away && m.datum===match.datum && m.vreme===match.vreme)) : [...existing, match];
      return {...prev, [screen]: updated};
    });
  };

  const saveActiveTicket = () => {
    if(!activeTicket || !activeTicket.matches.length) return;
    setTickets(prev=>({ ...prev, otvoreni: [...prev.otvoreni, activeTicket] }));
    setActiveTicket(null);
  };

  useEffect(() => { localStorage.setItem("rows", JSON.stringify(rows)); }, [rows]);
  useEffect(() => { localStorage.setItem("tickets", JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem("activeTicket", JSON.stringify(activeTicket)); }, [activeTicket]);

  // --- Team stats za Poisson ---
  useEffect(()=>{
    if(!rows.length){ setTeamPoissonStats([]); return; }

    const teams = {};
    rows.forEach(r=>{
      if(!r.ft || !r.home || !r.away) return;
      const [hg, ag] = r.ft.split(":").map(Number);
      if(isNaN(hg) || isNaN(ag)) return;

      if(!teams[r.home]) teams[r.home] = { homeGoals:0, homeGames:0, awayGoals:0, awayGames:0 };
      if(!teams[r.away]) teams[r.away] = { homeGoals:0, homeGames:0, awayGoals:0, awayGames:0 };

      teams[r.home].homeGoals += hg;
      teams[r.home].homeGames++;
      teams[r.away].awayGoals += ag;
      teams[r.away].awayGames++;

      teams[r.away].homeGoals += ag;
      teams[r.away].homeGames++;
      teams[r.home].awayGoals += hg;
      teams[r.home].awayGames++;
    });

    const data = Object.entries(teams).map(([team, stats])=>{
      const lambdaHome = stats.homeGames ? stats.homeGoals / stats.homeGames : 0;
      const lambdaAway = stats.awayGames ? stats.awayGoals / stats.awayGames : 0;
      return { team, lambdaHome, lambdaAway };
    });

    setTeamPoissonStats(data);
  }, [rows]);

  // --- Predikcije Poisson ---
  useEffect(()=>{
    if(!rows.length || !futureMatches.length){
      setPredictionsPoisson([]);
      return;
    }
    const model = buildPoissonModel(rows);
    const poissonPreds = futureMatches.map(m=>{
      const p = predictMatch(model, m.liga, m.home, m.away);
      return { ...m, ...p };
    });
    setPredictionsPoisson(poissonPreds);
  }, [rows, futureMatches]);

  // --- Predikcije Hybrid ---
  useEffect(()=>{
    if(!rows.length || !futureMatches.length){
      setPredictionsHybrid([]);
      return;
    }

    const ticketMap = calculateTicketInfluence(tickets);

    const hybridPreds = futureMatches.map(m=>{
      const poisson = predictionsPoisson.find(p=>p.home===m.home && p.away===m.away) || {};
      const tiGG = (ticketMap[m.home]?.gg||0) + (ticketMap[m.away]?.gg||0);
      const tiNG = (ticketMap[m.home]?.ng||0) + (ticketMap[m.away]?.ng||0);
      const tiOver2 = (ticketMap[m.home]?.over2||0) + (ticketMap[m.away]?.over2||0);
      const tiOver7 = (ticketMap[m.home]?.over7||0) + (ticketMap[m.away]?.over7||0);
      return {
        ...m,
        gg: (poisson.gg||50)+tiGG,
        ng: (poisson.ng||50)+tiNG,
        over2: (poisson.over2||50)+tiOver2,
        over7: (poisson.over7||50)+tiOver7
      };
    });

    setPredictionsHybrid(hybridPreds);
  }, [rows, futureMatches, tickets, predictionsPoisson]);

  // --- Predikcije Final ---
  useEffect(()=>{
    if(!predictionsPoisson.length || !predictionsHybrid.length) {
      setPredictionsFinal([]);
      return;
    }
    const tips = ["gg","ng","over2","over7"];
    const ticketMap = calculateTicketInfluence(tickets);
    const finalPreds = futureMatches.map(m=>{
      const poisson = predictionsPoisson.find(p => p.home===m.home && p.away===m.away) || {};
      const hybrid = predictionsHybrid.find(p => p.home===m.home && p.away===m.away) || {};
      const tMapHome = ticketMap[m.home] || {};
      const tMapAway = ticketMap[m.away] || {};
      const final = {};
      tips.forEach(tip=>{
        const poissonVal = poisson[tip] ?? 50;
        const hybridVal = hybrid[tip] ?? 50;
        const ticketVal = (tMapHome[tip]||0) + (tMapAway[tip]||0);
        final[tip] = Math.min(100, Math.max(0, 0.65*poissonVal + 0.35*hybridVal + ticketVal));
      });
      return { ...m, poisson, hybrid, ticketInfluence: {...tMapHome, ...tMapAway}, final };
    });
    setPredictionsFinal(finalPreds);
  }, [predictionsPoisson, predictionsHybrid, futureMatches, tickets]);

  return (
    <MatchesContext.Provider value={{
      rows, setRows,
      futureMatches, setFutureMatches,
      tickets, setTickets,
      activeTicket, setActiveTicket,
      toggleMatchInActiveTicket,
      toggleMatchSelection,
      saveActiveTicket,
      selectedMatchesByScreen,
      predictionsHybrid,
      predictionsPoisson,
      predictionsFinal,
      teamPoissonStats
    }}>
      {children}
    </MatchesContext.Provider>
  );
}
