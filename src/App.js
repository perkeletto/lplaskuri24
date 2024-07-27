import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [stats, setStats] = useState({
    determination: 0,
    humor: 0,
    intelligence: 0,
    appearance: 0,
    wealth: 0
  });

  const [buffs, setBuffs] = useState([]);

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

  const calculateEffectiveStats = () => {
    const effectiveStats = { ...stats };
    buffs.forEach(buff => {
      console.log(effectiveStats[buff.stat], buff.points)
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
        {Object.keys(effectiveStats).map(stat => (
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
      </div>
    </div>
  );
}

function BuffForm({ addBuff }) {
  const [stat, setStat] = useState('determination');
  const [turns, setTurns] = useState(1);
  const [points, setPoints] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    addBuff(stat, turns, Number(points));
  };

  return (
    <form className="buff-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="statSelect">Stat:</label>
        <select id="statSelect" className="form-control" value={stat} onChange={(e) => setStat(e.target.value)}>
          <option value="determination">Determination</option>
          <option value="humor">Humor</option>
          <option value="intelligence">Intelligence</option>
          <option value="appearance">Appearance</option>
          <option value="wealth">Wealth</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="turnsInput">Turns:</label>
        <input id="turnsInput" type="number" className="form-control" value={turns} onChange={(e) => setTurns(e.target.value)} min="1" />
      </div>
      <div className="form-group">
        <label htmlFor="pointsInput">Points:</label>
        <input id="pointsInput" type="number" className="form-control" value={points} onChange={(e) => setPoints(e.target.value)} />
      </div>
      <br />
      <div className="row">
        <button type="submit" className="btn btn-primary">Add Buff/Debuff</button>
      </div>
    </form>
  );
}

function BuffList({ buffs, removeBuff }) {
  return (
    <ul class="list-group">
      {buffs.map((buff, index) => (
        <li class={`list-group-item list-group-item-${(Number(buff.points) >= 0) ? 'success' : 'danger' }`}>
          <div class="row">
            <div class="col-8">
              {`${buff.stat.toUpperCase()}: ${buff.points} T${buff.turns}`}
            </div>
            <div class="col-2">
            </div>
            <div class="col-2">
              <button className="btn btn-danger" onClick={() => removeBuff(index)}>X</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default App;
