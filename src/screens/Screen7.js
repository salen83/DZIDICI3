import React, { useContext } from "react";
import { MatchesContext } from "../MatchesContext";

export default function Screen7() {
  const { predictions } = useContext(MatchesContext);

  const list = [...predictions]
    .filter(p => !isNaN(p.over2))
    .sort((a,b) => b.over2 - a.over2);

  return (
    <div>
      <h2>Rang 2+ %</h2>
      <table style={{ borderCollapse: "collapse", width: "auto" }}>
        <thead>
          <tr>
            <th style={{textAlign:"left", width:"30px"}}>#</th>
            <th style={{textAlign:"left", width:"120px"}}>Domaćin</th>
            <th style={{textAlign:"left", width:"120px"}}>Gost</th>
            <th style={{textAlign:"left", width:"50px"}}>2+ %</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p,i) => {
            const bgColor = p.over2 > 80 ? "#c8facc" : "transparent";
            return (
              <tr key={i} style={{backgroundColor: bgColor}}>
                <td style={{textAlign:"left", padding:"2px 4px"}}>{i+1}</td>
                <td style={{textAlign:"left", padding:"2px 4px", whiteSpace:"nowrap"}}>{p.home}</td>
                <td style={{textAlign:"left", padding:"2px 4px", whiteSpace:"nowrap"}}>{p.away}</td>
                <td style={{textAlign:"left", padding:"2px 4px"}}>{p.over2}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
