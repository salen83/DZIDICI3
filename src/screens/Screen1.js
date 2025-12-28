import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './Screen1.css';

export default function Screen1() {
  const [rows, setRows] = useState([]);
  const [countryColors, setCountryColors] = useState({});

  useEffect(() => {
    const savedRows = JSON.parse(localStorage.getItem('rows')) || [];
    const savedColors = JSON.parse(localStorage.getItem('countryColors')) || {};
    setRows(savedRows);
    setCountryColors(savedColors);
  }, []);

  const formatDatum = (val) => {
    if (!val) return '';
    if (val.includes('.')) return val;
    if (val.includes('/')) {
      const [m, d, y] = (val || '').split('/');
      return `${d.padStart(2,'0')}.${m.padStart(2,'0')}.${y}`;
    }
    return val;
  };

  const getCountryColor = (country) => {
    if (!country) return '#ffffff';
    if (countryColors[country]) return countryColors[country];

    let hash = 0;
    for (let i = 0; i < country.length; i++) {
      hash = country.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    const color = `hsl(${hue}, 70%, 70%)`;

    const newColors = { ...countryColors, [country]: color };
    setCountryColors(newColors);
    localStorage.setItem('countryColors', JSON.stringify(newColors));
    return color;
  };

  const importExcel = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

      const newRows = data.map((r, i) => ({
        rb: rows.length + i + 1,
        datum: formatDatum(String(r['datum'] ?? '')),
        vreme: String(r['Time'] ?? ''),
        liga: r['Liga'] ?? '',
        home: r['Home'] ?? '',
        away: r['Away'] ?? '',
        ft: r['FT'] ?? '',
        ht: r['HT'] ?? '',
        sh: r['SH'] ?? '',
      }));

      const allRows = [...rows, ...newRows];
      setRows(allRows);
      localStorage.setItem('rows', JSON.stringify(allRows));
    };

    reader.readAsBinaryString(file);
  };

  const deleteRow = (index) => {
    const copy = [...rows];
    copy.splice(index, 1);
    copy.forEach((r, i) => r.rb = i + 1);
    setRows(copy);
    localStorage.setItem('rows', JSON.stringify(copy));
  };

  return (
    <div>
      <input type="file" accept=".xls,.xlsx" onChange={importExcel} />

      <table>
        <thead>
          <tr>
            <th style={{ width: '28px' }}>#</th>
            <th style={{ width: '55px' }}>Datum</th>
            <th style={{ width: '45px' }}>Vreme</th>
            <th style={{ width: '90px' }}>Liga</th>
            <th style={{ width: '90px' }}>Home</th>
            <th style={{ width: '90px' }}>Away</th>
            <th style={{ width: '18px' }}>FT</th>
            <th style={{ width: '18px' }}>HT</th>
            <th style={{ width: '18px' }}>SH</th>
            <th style={{ width: '18px' }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const country = (r.liga || '').split(' ')[0] || r.liga;
            const color = getCountryColor(country);

            return (
              <tr key={i}>
                <td>{r.rb}</td>
                <td>{r.datum}</td>
                <td>{r.vreme}</td>
                <td style={{ backgroundColor: color, fontWeight: 'bold' }}>{r.liga}</td>
                <td style={{ backgroundColor: color, fontWeight: 'bold', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.home}</td>
                <td style={{ backgroundColor: color, fontWeight: 'bold', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.away}</td>
                <td>{r.ft}</td>
                <td>{r.ht}</td>
                <td>{r.sh}</td>
                <td>
                  <button
                    onClick={() => deleteRow(i)}
                    style={{ padding: '0', fontSize: '10px', height: '16px', width: '16px' }}
                  >
                    x
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
