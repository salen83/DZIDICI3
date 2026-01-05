// ticketInfluence.js
// Računa uticaj tiketa na predikcije

export function calculateTicketInfluence(tickets) {
  const influenceMap = {}; // { tim: { tip: cumulativeEffect } }

  // redosled po datumu: prvo stari tiketi
  const allTickets = [...tickets.dobitni, ...tickets.gubitni].sort((a,b) => new Date(a.date) - new Date(b.date));

  allTickets.forEach(ticket => {
    const isWin = ticket.status === "win" ? 1 : -1; // +1 ako je prošao, -1 ako nije
    ticket.matches.forEach(match => {
      if (!influenceMap[match.home]) influenceMap[match.home] = {};
      if (!influenceMap[match.away]) influenceMap[match.away] = {};
      if (!influenceMap[match.home][match.tip]) influenceMap[match.home][match.tip] = 0;
      if (!influenceMap[match.away][match.tip]) influenceMap[match.away][match.tip] = 0;

      // +3% ili -3% po timu i tipu
      influenceMap[match.home][match.tip] += 3 * isWin;
      influenceMap[match.away][match.tip] += 3 * isWin;

      // plafoniranje ±30%
      if (influenceMap[match.home][match.tip] > 30) influenceMap[match.home][match.tip] = 30;
      if (influenceMap[match.home][match.tip] < -30) influenceMap[match.home][match.tip] = -30;
      if (influenceMap[match.away][match.tip] > 30) influenceMap[match.away][match.tip] = 30;
      if (influenceMap[match.away][match.tip] < -30) influenceMap[match.away][match.tip] = -30;
    });
  });

  return influenceMap; // primer: { "Bayern": { "GG": 6, "7+": -3 }, ... }
}
