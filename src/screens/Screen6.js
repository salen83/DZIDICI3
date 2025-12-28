import React, { useContext } from "react";
import { MatchesContext } from "../MatchesContext";

export default function Screen6() {
  const { predictions } = useContext(MatchesContext);

  const list = [...predictions]
    .filter(p => !isNaN(p.ng))
    .sort((a,b) => b.ng - a.ng);

  return (
    <div>
      <h2>Rang NG %</h2>
      <table style={{ borderCollapse: "collapse", width: "auto" }}>
        <thead>
          <tr>
            <th style={{textAlign:"left", width:"30px"}}>#</th>
            <th style={{textAlign:"left", width:"120px"}}>Domaćin</th>
            <th style={{textAlign:"left", width:"120px"}}>Gost</th>
            <th style={{textAlign:"left", width:"50px"}}>NG %</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p,i) => {
            const bgColor = p.ng > 80 ? "#c8facc" : "transparent";
            return (
              <tr key={i} style={{backgroundColor: bgColor}}>
                <td style={{textAlign:"left", padding:"2px 4px"}}>{i+1}</td>
                <td style={{textAlign:"left", padding:"2px 4px", whiteSpace:"nowrap"}}>{p.home}</td>
                <td style={{textAlign:"left", padding:"2px 4px", whiteSpace:"nowrap"}}>{p.away}</td>
                <td style={{textAlign:"left", padding:"2px 4px"}}>{p.ng}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
