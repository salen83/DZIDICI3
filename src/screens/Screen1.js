import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import './Screen1.css';
import { MatchesContext } from "../MatchesContext";

export default function Screen1() {
  const { rows, setRows } = useContext(MatchesContext);
  const [countryColors, setCountryColors] = useState({});
  const tableWrapperRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  const rowHeight = 35; // visina jednog reda
  const buffer = 20;    // dodatni redovi izvan viewa

  // Load saved colors
  useEffect(() => {
    const savedColors = JSON.parse(localStorage.getItem('countryColors') || '{}');
    setCountryColors(savedColors);
  }, []);

  // Generate colors for new countries
  useEffect(() => {
    if (!rows) return;
    const newColors = { ...countryColors };
    rows.forEach(r => {
      const country = (r.liga || '').split(' ')[0] || r.liga;
      if (country && !newColors[country]) {
        let hash = 0;
        for (let i = 0; i < country.length; i++) {
          hash = country.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        newColors[country] = `hsl(${hue}, 70%, 70%)`;
      }
    });
    setCountryColors(newColors);
    localStorage.setItem('countryColors', JSON.stringify(newColors));
  }, [rows]);

  const normalizeDate = (val) => {
    if (!val) return '';
    if (!isNaN(val)) {
      const date = new Date((val - 25569) * 86400 * 1000);
      return `${String(date.getDate()).padStart(2,'0')}.${String(date.getMonth()+1).padStart(2,'0')}.${date.getFullYear()}`;
    }
    const str = String(val).trim();
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) return str;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [d,m,y]=str.split('/');
      return `${d}.${m}.${y}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y,m,d]=str.split('-');
      return `${d}.${m}.${y}`;
    }
    return str;
  };

  const getExcelDate = row => row?.['Datum'] ?? row?.['datum'] ?? row?.['DATE'] ?? row?.['Date'] ?? row?.['date'] ?? '';
  const getCountryColor = country => countryColors[country] || '#fff';

  // Excel import
  const importExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

      const newRows = data.map((r, i) => ({
        rb: rows.length + i + 1,
        datum: normalizeDate(getExcelDate(r)),
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

  // Add new row
  const addNewRow = () => {
    const newRow = {
      rb: 0,
      datum: '',
      vreme: '',
      liga: '',
      home: '',
      away: '',
      ft: '',
      ht: '',
      sh: ''
    };
    const newRows = [newRow, ...rows];
    newRows.forEach((r,i)=>r.rb=i+1);
    setRows(newRows);
    localStorage.setItem('rows', JSON.stringify(newRows));
  };

  const deleteRow = index => {
    const copy = [...rows];
    copy.splice(index, 1);
    copy.forEach((r,i)=>r.rb=i+1);
    setRows(copy);
    localStorage.setItem('rows', JSON.stringify(copy));
  };

  const handleCellChange = (i, key, value) => {
    const copy = [...rows];
    copy[i][key] = value;
    setRows(copy);
    localStorage.setItem('rows', JSON.stringify(copy));
  };

  // Virtualization
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const containerHeight = 600;
  const totalRows = rows?.length || 0;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const endIndex = Math.min(totalRows, Math.ceil((scrollTop + containerHeight)/rowHeight) + buffer);
  const visibleRows = rows?.slice(startIndex, endIndex);

  return (
    <div className="screen1-container">
      <div className="screen1-topbar">
        <input type="file" accept=".xls,.xlsx" onChange={importExcel} />
        <button onClick={addNewRow}>Dodaj novi mec</button>
      </div>

      <div
        className="screen1-table-wrapper"
        style={{ height: containerHeight, overflowY: 'auto' }}
        ref={tableWrapperRef}
        onScroll={handleScroll}
      >
        <table className="screen1-table">
          <thead>
            <tr>
              <th className="col-min">#</th>
              <th>Datum</th>
              <th>Vreme</th>
              <th>Liga</th>
              <th>Home</th>
              <th>Away</th>
              <th>FT</th>
              <th>HT</th>
              <th>SH</th>
              <th className="col-min"></th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: startIndex * rowHeight }}></tr>
            {visibleRows?.map((r,i)=>{
              const idx = startIndex + i;
              const country = (r.liga || '').split(' ')[0] || r.liga;
              const color = getCountryColor(country);
              return (
                <tr key={idx}>
                  <td className="col-min">{r.rb}</td>
                  <td><input value={r.datum} onChange={e=>handleCellChange(idx,'datum',e.target.value)} /></td>
                  <td><input value={r.vreme} onChange={e=>handleCellChange(idx,'vreme',e.target.value)} /></td>
                  <td style={{ backgroundColor: color, fontWeight: 'bold' }}>
                    <input value={r.liga} onChange={e=>handleCellChange(idx,'liga',e.target.value)} />
                  </td>
                  <td style={{ backgroundColor: color, fontWeight: 'bold' }}>
                    <input value={r.home} onChange={e=>handleCellChange(idx,'home',e.target.value)} />
                  </td>
                  <td style={{ backgroundColor: color, fontWeight: 'bold' }}>
                    <input value={r.away} onChange={e=>handleCellChange(idx,'away',e.target.value)} />
                  </td>
                  <td className="col-min"><input value={r.ft} onChange={e=>handleCellChange(idx,'ft',e.target.value)} /></td>
                  <td className="col-min"><input value={r.ht} onChange={e=>handleCellChange(idx,'ht',e.target.value)} /></td>
                  <td className="col-min"><input value={r.sh} onChange={e=>handleCellChange(idx,'sh',e.target.value)} /></td>
                  <td className="col-min"><button onClick={()=>deleteRow(idx)}>x</button></td>
                </tr>
              );
            })}
            <tr style={{ height: (totalRows - endIndex) * rowHeight }}></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
