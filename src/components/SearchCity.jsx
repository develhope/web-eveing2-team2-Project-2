import React, { useState, useRef } from "react";

export default function SearchCity({ apiKey, onSelect }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const lock = useRef(false);

  async function runSearch() {
    if (lock.current || !q.trim()) return;
    lock.current = true; setTimeout(() => (lock.current = false), 400);
    setLoading(true); setResults([]);

    try {
      if (apiKey) {
        const r = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${apiKey}`);
        const j = await r.json();
        if (r.ok && Array.isArray(j) && j.length) { setResults(j); setLoading(false); return; }
      }
      const r2 = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=it&format=json`);
      const j2 = await r2.json();
      const mapped = (j2.results || []).map(c => ({ name: c.name, state: c.admin1, country: c.country_code, lat: c.latitude, lon: c.longitude }));
      setResults(mapped);
    } finally { setLoading(false); }
  }

  function choose(c) {
    setResults([]);
    onSelect({ lat: c.lat, lon: c.lon, name: `${c.name}${c.country ? ` (${c.country})` : ""}` });
    setQ(`${c.name}${c.state ? ", " + c.state : ""}`);
  }

  return (
    <div className="relative w-full sm:w-72">
      <form onSubmit={(e)=>{e.preventDefault();runSearch();}} className="relative">
        <input className="input" placeholder="Cerca città…" value={q} onChange={e=>setQ(e.target.value)} />
        <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/></svg>
        </button>
      </form>
      {(loading || results.length>0) && (
        <div className="absolute left-0 right-0 mt-1 z-[200]">
          {loading && <div className="glass rounded-xl py-2 text-center text-sm hint">Ricerca…</div>}
          {!loading && (
            <ul className="glass rounded-xl max-h-56 overflow-auto text-sm">
              {results.map(c=>(
                <li key={`${c.lat}-${c.lon}`} className="px-3 py-2 hover:bg-white/20 cursor-pointer" onClick={()=>choose(c)}>
                  {c.name}{c.state ? `, ${c.state}` : ""} {c.country && `(${c.country})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
