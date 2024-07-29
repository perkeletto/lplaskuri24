import React, { useState, useEffect  } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { MultiSelect } from "react-multi-select-component";
import Alert from 'react-bootstrap/Alert';

function App() {
  const [stats, setStats] = useState(() => {
    const savedStats = JSON.parse(localStorage.getItem('stats'));
    return savedStats || { determination: 0, humor: 0, intelligence: 0, appearance: 0, wealth: 0 };
  });

  const [buffs, setBuffs] = useState(() => {
    const savedBuffs = JSON.parse(localStorage.getItem('buffs'));
    return savedBuffs || [];
  });

  useEffect(() => {
    localStorage.setItem('stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('buffs', JSON.stringify(buffs));
  }, [buffs]);

  const increment = (stat) => {
    setStats(prevStats => ({ ...prevStats, [stat]: prevStats[stat] + 1 }));
  };

  const decrement = (stat) => {
    setStats(prevStats => ({ ...prevStats, [stat]: prevStats[stat] - 1 }));
  };

  const addBuff = (stat, turns, points) => {
    setBuffs(prevBuffs => [...prevBuffs, { stat, turns, points: Number(points) }]);
  };

  const removeBuff = (index) => {
    setBuffs(prevBuffs => prevBuffs.filter((_, i) => i !== index));
  };

  const endTurn = () => {
    setBuffs(prevBuffs => 
      prevBuffs
        .map(buff => ({ ...buff, turns: buff.turns - 1 }))
        .filter(buff => buff.turns > 0)
    );
  };

  const resetGame = () => {
    setStats({
      determination: 0,
      humor: 0,
      intelligence: 0,
      appearance: 0,
      wealth: 0
    });
    setBuffs([]);
    localStorage.removeItem('stats');
    localStorage.removeItem('buffs');
  };

  const calculateEffectiveStats = () => {
    const effectiveStats = { ...stats };
    buffs.forEach(buff => {
      effectiveStats[buff.stat] += buff.points;
    });
    return effectiveStats;
  };

  const effectiveStats = calculateEffectiveStats();

  return (
    <div className="App container mt-4">
      <h1 className="text-center">LP STATIT</h1>
      <div className="text-center mt-4">
          <button className="btn btn-warning" onClick={endTurn}>End Turn</button>
      </div>
      <br />
        {Object.keys(effectiveStats).sort().map(stat => (
          <div key={stat} className="row">
          <div className="col-12 col-md-6 col-lg-4 mb-6">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="card-title">{stat.toUpperCase()}</h2>
                <div className="controls d-flex justify-content-around align-items-center">
                  <button className="btn btn-danger" onClick={() => decrement(stat)}>-</button>
                  <span className="h4">{effectiveStats[stat]}</span>
                  <button className="btn btn-success" onClick={() => increment(stat)}>+</button>
                </div>
              </div>
            </div>
          </div>
          </div>
        ))}
      <div className="buffs-container mt-4">
        <h2 className="text-center">Buffs & Debuffs</h2>
        <BuffForm addBuff={addBuff} />
        <BuffList buffs={buffs} removeBuff={removeBuff} />
        <div className="text-center mt-4">
          <button className="btn btn-warning" onClick={endTurn}>End Turn</button>
        </div>
        <div className="text-center mt-4">
          <button className="btn btn-danger ml-2" onClick={resetGame}>Aloita alusta</button>
        </div>
      </div>
    </div>
  );
}

function BuffForm({ addBuff }) {
  const [turns, setTurns] = useState(1);
  const [points, setPoints] = useState(1);
  const [selected, setSelected] = useState([]);
  const [show, setShow] = useState(false);

  const options = [
    { label: "Determination", value: "determination" },
    { label: "Humor", value: "humor" },
    { label: "Intelligence", value: "intelligence" },
    { label: "Appearance", value: "appearance" },
    { label: "Wealth", value: "wealth" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    addSubmittedBuffs(e)
  };
  
  const addSubmittedBuffs = e => {
    const debuffActivoitu = e.target.debuff.checked
    const arvo = debuffActivoitu ? -Math.abs(Number(points)) : Number(points)
    if(selected.length === 0){
      return null
    }
    for (let index = 0; index < selected?.length; index++) {
      addBuff(selected[index].value, turns, arvo);
    }
    setShow(true)
    return e
  }

  return (
    <form className="buff-form" onSubmit={handleSubmit}>
      <div className="form-group">
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="debuff"></input>
        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Debuff</label>
      </div>
      </div>
      <div className="form-group">
        <label htmlFor="statSelect">Stat:</label>
        <MultiSelect
         disableSearch={true}
          options={options}
          value={selected}
          onChange={setSelected}
          labelledBy="Select"
        />
      </div>
      <div className="form-group">
        <label htmlFor="turnsInput">Turns:</label>
        <input id="turnsInput" type="number" className="form-control" value={turns} onChange={(e) => setTurns(e.target.value)} min="1" />
      </div>
      <div className="form-group">
        <label htmlFor="pointsInput">Points:</label>
        <input id="pointsInput" type="number" className="form-control" value={points} onChange={(e) => setPoints(e.target.value)} min="1" />
      </div>
      <br />
      {show && (
        <Alert variant="primary" onClose={() => setShow(false)} dismissible>
          Buff/debuff lisätty, sulje ja lisää uusi!
      </Alert>
      )}
      <div className="row">
        <button type="submit" disabled={show} className={show ? "btn btn-primary disabled" : "btn btn-primary"}>Add Buff/Debuff</button>
      </div>
    </form>
  );
}

function BuffList({ buffs, removeBuff }) {
  return (
    <ul className="list-group">
      {buffs.map((buff, index) => (
        <li key={index} className={`list-group-item list-group-item-${(Number(buff.points) >= 0) ? 'success' : 'danger' }`}>
          <div className="row">
            <div className="col-8">
              {`${buff.stat.toUpperCase()}: ${buff.points} T${buff.turns}`}
            </div>
            <div className="col-2">
            </div>
            <div className="col-2">
              <button className="btn btn-danger" onClick={() => removeBuff(index)}>X</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default App;
