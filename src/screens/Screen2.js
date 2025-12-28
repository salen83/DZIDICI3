import React, { useContext, useMemo, useState } from "react";
import { MatchesContext } from "../MatchesContext";
import "./Screen2.css";

export default function Screen2() {
  const { rows } = useContext(MatchesContext);
  const [openCol, setOpenCol] = useState("");
  const [activeTeam, setActiveTeam] = useState("");

  // Funkcija za boju po ligi (primer)
  const leagueColor = (league) => {
    switch (league.toLowerCase()) {
      case "liga1": return "#f0f0f0";
      case "liga2": return "#d0f0d0";
      default: return "#fff";
    }
  };

  const calculateStats = (rows) => {
    const teams = {};
    const byLeague = {};

    rows.forEach(r => {
      if (!r.home || !r.away) return;
      const [homeGoals, awayGoals] = (r.ft || "0:0").split(":").map(Number);

      // Inicijalizacija
      if (!teams[r.home]) teams[r.home] = { games: 0, goalsFor: 0, goalsAgainst: 0, GG: 0, NG: 0, twoPlus: 0, sevenPlus: 0, last5: [] };
      if (!teams[r.away]) teams[r.away] = { games: 0, goalsFor: 0, goalsAgainst: 0, GG: 0, NG: 0, twoPlus: 0, sevenPlus: 0, last5: [] };
      if (!byLeague[r.home]) byLeague[r.home] = {};
      if (!byLeague[r.away]) byLeague[r.away] = {};
      if (!byLeague[r.home][r.liga]) byLeague[r.home][r.liga] = { games: 0, goalsFor: 0, goalsAgainst: 0, GG: 0, NG: 0, twoPlus: 0, sevenPlus: 0 };
      if (!byLeague[r.away][r.liga]) byLeague[r.away][r.liga] = { games: 0, goalsFor: 0, goalsAgainst: 0, GG: 0, NG: 0, twoPlus: 0, sevenPlus: 0 };

      // Ukupna statistika
      [ [r.home, homeGoals, awayGoals], [r.away, awayGoals, homeGoals] ].forEach(([team, gf, ga]) => {
        teams[team].games += 1;
        teams[team].goalsFor += gf;
        teams[team].goalsAgainst += ga;
        teams[team].GG += (gf > 0 && ga > 0 ? 1 : 0);
        teams[team].NG += (gf === 0 || ga === 0 ? 1 : 0);
        teams[team].twoPlus += ((gf+ga) >= 2 ? 1 : 0);
        teams[team].sevenPlus += ((gf+ga) >= 7 ? 1 : 0);

        teams[team].last5.push({ gf, ga });
        if (teams[team].last5.length > 5) teams[team].last5.shift();
      });

      // Statistika po ligama
      byLeague[r.home][r.liga].games += 1;
      byLeague[r.home][r.liga].goalsFor += homeGoals;
      byLeague[r.home][r.liga].goalsAgainst += awayGoals;
      byLeague[r.home][r.liga].GG += (homeGoals > 0 && awayGoals > 0 ? 1 : 0);
      byLeague[r.home][r.liga].NG += (homeGoals === 0 || awayGoals === 0 ? 1 : 0);
      byLeague[r.home][r.liga].twoPlus += ((homeGoals+awayGoals) >= 2 ? 1 : 0);
      byLeague[r.home][r.liga].sevenPlus += ((homeGoals+awayGoals) >= 7 ? 1 : 0);

      byLeague[r.away][r.liga].games += 1;
      byLeague[r.away][r.liga].goalsFor += awayGoals;
      byLeague[r.away][r.liga].goalsAgainst += homeGoals;
      byLeague[r.away][r.liga].GG += (homeGoals > 0 && awayGoals > 0 ? 1 : 0);
      byLeague[r.away][r.liga].NG += (homeGoals === 0 || awayGoals === 0 ? 1 : 0);
      byLeague[r.away][r.liga].twoPlus += ((homeGoals+awayGoals) >= 2 ? 1 : 0);
      byLeague[r.away][r.liga].sevenPlus += ((homeGoals+awayGoals) >= 7 ? 1 : 0);
    });

    // Dodavanje AVG i poslednjih 5 mečeva
    Object.keys(teams).forEach(team => {
      const last5 = teams[team].last5.slice(-5);
      teams[team].GG5 = last5.filter(m => m.gf>0 && m.ga>0).length;
      teams[team].NG5 = last5.filter(m => m.gf===0 || m.ga===0).length;
      teams[team].twoPlus5 = last5.filter(m => m.gf+m.ga>=2).length;
      teams[team].avg5 = last5.length ? (last5.reduce((sum,m)=>sum+m.gf+m.ga,0)/last5.length).toFixed(2) : 0;
    });

    return { teams, byLeague };
  };

  const { teams: teamStats, byLeague } = useMemo(() => calculateStats(rows || []), [rows]);

  const toggleColHelp = (col) => {
    setOpenCol(openCol === col ? "" : col);
  };

  const handleTeamClick = (team) => {
    setActiveTeam(activeTeam === team ? "" : team);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th style={{ width:'28px' }}>#</th>
            <th style={{ width:'50px' }}>Tim</th>
            <th onClick={()=>toggleColHelp("G")}>G {openCol==="G" && <div>Golovi dati</div>}</th>
            <th onClick={()=>toggleColHelp("GA")}>GA {openCol==="GA" && <div>Golovi primljeni</div>}</th>
            <th onClick={()=>toggleColHelp("GG")}>GG% {openCol==="GG" && <div>Both scored %</div>}</th>
            <th onClick={()=>toggleColHelp("NG")}>NG% {openCol==="NG" && <div>No goal %</div>}</th>
            <th onClick={()=>toggleColHelp("2+")}>2+% {openCol==="2+" && <div>2+ goals %</div>}</th>
            <th onClick={()=>toggleColHelp("7+")}>7+% {openCol==="7+" && <div>7+ goals %</div>}</th>
            <th onClick={()=>toggleColHelp("AVG")}>AVG(5) {openCol==="AVG" && <div>Average goals last 5</div>}</th>
            <th onClick={()=>toggleColHelp("GG5")}>GG(5) {openCol==="GG5" && <div>Both scored last 5</div>}</th>
            <th onClick={()=>toggleColHelp("NG5")}>NG(5) {openCol==="NG5" && <div>No goal last 5</div>}</th>
            <th onClick={()=>toggleColHelp("2plus5")}>2+(5) {openCol==="2plus5" && <div>2+ goals last 5</div>}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(teamStats).map(([team, stats], index) => (
            <React.Fragment key={team}>
              <tr>
                <td>{index+1}</td>
                <td onClick={()=>handleTeamClick(team)}>{team}</td>
                <td>{stats.goalsFor}</td>
                <td>{stats.goalsAgainst}</td>
                <td>{stats.games?((stats.GG/stats.games)*100).toFixed(0):0}%</td>
                <td>{stats.games?((stats.NG/stats.games)*100).toFixed(0):0}%</td>
                <td>{stats.games?((stats.twoPlus/stats.games)*100).toFixed(0):0}%</td>
                <td>{stats.games?((stats.sevenPlus/stats.games)*100).toFixed(0):0}%</td>
                <td>{stats.avg5}</td>
                <td>{stats.GG5}</td>
                <td>{stats.NG5}</td>
                <td>{stats.twoPlus5}</td>
              </tr>
              {activeTeam===team && (
                <tr>
                  <td colSpan="12">
                    {Object.entries(byLeague[team]).map(([liga, lstats])=>(
                      <div key={liga} style={{padding:'2px 0'}}>
                        <b>{liga}</b> - G:{lstats.goalsFor}, GA:{lstats.goalsAgainst}, GG%:{(lstats.GG/lstats.games*100).toFixed(0)}, NG%:{(lstats.NG/lstats.games*100).toFixed(0)}
                      </div>
                    ))}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
