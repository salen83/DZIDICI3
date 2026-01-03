import React, { useState } from "react";
import "./Screen9.css";

const fakeTickets = {
  otvoreni: [
    {
      id: 1,
      name: "Tiket #1",
      matches: [
        "Chelsea – Arsenal (GG)",
        "Inter – Milan (GG)",
      ],
    },
  ],
  dobitni: [
    {
      id: 2,
      name: "Tiket #2",
      matches: [
        "Real – Barca (GG)",
        "PSG – Lyon (GG)",
      ],
    },
  ],
  gubitni: [
    {
      id: 3,
      name: "Tiket #3",
      matches: [
        "Bayern – Dortmund (GG)",
      ],
    },
  ],
};

export default function Screen9() {
  const [activeTab, setActiveTab] = useState("otvoreni");
  const [selectedTicket, setSelectedTicket] = useState(null);

  return (
    <div className="screen9-container">
      <h2>Tiketi</h2>

      {/* TABOVI */}
      <div className="tabs">
        {["otvoreni", "dobitni", "gubitni"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* LISTA TIKETA */}
      <div className="tab-content">
        {fakeTickets[activeTab].map((ticket) => (
          <div
            key={ticket.id}
            style={{
              border: "1px solid #ccc",
              padding: "8px",
              marginBottom: "6px",
              cursor: "pointer",
            }}
            onClick={() => setSelectedTicket(ticket)}
          >
            {ticket.name}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedTicket && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedTicket(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: "15px",
              width: "90%",
              maxWidth: "400px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selectedTicket.name}</h3>
            <ul>
              {selectedTicket.matches.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <button onClick={() => setSelectedTicket(null)}>Zatvori</button>
          </div>
        </div>
      )}
    </div>
  );
}
