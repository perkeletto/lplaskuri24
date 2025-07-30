import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { MultiSelect } from "react-multi-select-component";
import Alert from 'react-bootstrap/Alert';
import BuffsContainer from './components/BuffsContainer';

function App() {
  const [stats, setStats] = useState(() => {
    try {
      const savedStats = JSON.parse(localStorage.getItem('stats'));
      return savedStats || { determination: 0, humor: 0, intelligence: 0, appearance: 0, wealth: 0 };
    } catch (error) {
      console.error('Error loading stats from localStorage:', error);
      return { determination: 0, humor: 0, intelligence: 0, appearance: 0, wealth: 0 };
    }
  });

  const [buffs, setBuffs] = useState(() => {
    try {
      const savedBuffs = JSON.parse(localStorage.getItem('buffs'));
      return savedBuffs || [];
    } catch (error) {
      console.error('Error loading buffs from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving stats to localStorage:', error);
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem('buffs', JSON.stringify(buffs));
    } catch (error) {
      console.error('Error saving buffs to localStorage:', error);
    }
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
    try {
      localStorage.removeItem('stats');
      localStorage.removeItem('buffs');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  const effectiveStats = useMemo(() => {
    const effectiveStats = { ...stats };
    buffs.forEach(buff => {
      effectiveStats[buff.stat] += buff.points;
    });
    return effectiveStats;
  }, [stats, buffs]);

  return (
    <div className="App container mt-4">
      <h1 className="text-center">LP STATIT</h1>
      <div className="text-center mt-4">
        <button 
          className="btn btn-warning" 
          onClick={endTurn}
          aria-label="End current turn and reduce buff durations"
        >
          End Turn
        </button>
      </div>
      <br />
      {Object.keys(effectiveStats).sort().map(stat => (
        <div key={stat} className="row">
          <div className="col-12 col-md-6 col-lg-4 mb-6">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="card-title">{stat.toUpperCase()}</h2>
                <div className="controls d-flex justify-content-around align-items-center">
                  <button 
                    className="btn btn-danger" 
                    onClick={() => decrement(stat)}
                    aria-label={`Decrease ${stat}`}
                  >
                    -
                  </button>
                  <span className="h4" role="status" aria-live="polite">{effectiveStats[stat]}</span>
                  <button 
                    className="btn btn-success" 
                    onClick={() => increment(stat)}
                    aria-label={`Increase ${stat}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="text-center mt-4">
        <button 
          className="btn btn-danger ml-2" 
          onClick={resetGame}
          aria-label="Reset all stats and buffs to zero"
        >
          Aloita alusta
        </button>
      </div>
      <BuffsContainer>
        <h2 className="text-center">Buffs & Debuffs</h2>
        <BuffForm addBuff={addBuff} />
        <BuffList buffs={buffs} removeBuff={removeBuff} />
      </BuffsContainer>
    </div>
  );
}

function BuffForm({ addBuff }) {
  const [turns, setTurns] = useState(1);
  const [points, setPoints] = useState(1);
  const [selected, setSelected] = useState([]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const options = [
    { label: "Determination", value: "determination" },
    { label: "Humor", value: "humor" },
    { label: "Intelligence", value: "intelligence" },
    { label: "Appearance", value: "appearance" },
    { label: "Wealth", value: "wealth" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (selected.length === 0) {
      setError('Please select at least one stat');
      return;
    }
    
    if (turns < 1 || points < 1) {
      setError('Turns and points must be at least 1');
      return;
    }
    
    addSubmittedBuffs(e);
  };
  
  const addSubmittedBuffs = e => {
    try {
      const debuffActivoitu = e.target.debuff.checked;
      const arvo = debuffActivoitu ? -Math.abs(Number(points)) : Number(points);
      
      for (let index = 0; index < selected.length; index++) {
        addBuff(selected[index].value, turns, arvo);
      }
      setShow(true);
      setSelected([]);
      setTurns(1);
      setPoints(1);
    } catch (error) {
      console.error('Error adding buff:', error);
      setError('Failed to add buff/debuff');
    }
  };

  return (
    <form className="buff-form" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      <div className="form-group">
        <div className="form-check form-switch">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="debuff"
            aria-describedby="debuff-help"
          />
          <label className="form-check-label" htmlFor="debuff">Debuff</label>
          <div id="debuff-help" className="form-text">Check to make this a negative effect</div>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="statSelect">Stat:</label>
        <MultiSelect
          disableSearch={true}
          options={options}
          value={selected}
          onChange={setSelected}
          labelledBy="Select stats"
          hasSelectAll={false}
          aria-label="Select stats to affect"
        />
      </div>
      <div className="form-group">
        <label htmlFor="pointsInput">Amount:</label>
        <input 
          id="pointsInput" 
          type="number" 
          className="form-control" 
          value={points} 
          onChange={(e) => setPoints(e.target.value)} 
          min="1" 
          aria-describedby="points-help"
        />
        <div id="points-help" className="form-text">The amount to add or subtract from the stat</div>
      </div>
      <div className="form-group">
        <label htmlFor="turnsInput">Turns:</label>
        <input 
          id="turnsInput" 
          type="number" 
          className="form-control" 
          value={turns} 
          onChange={(e) => setTurns(e.target.value)} 
          min="1" 
          aria-describedby="turns-help"
        />
        <div id="turns-help" className="form-text">How many turns this effect will last</div>
      </div>
      <br />
      {show && (
        <Alert variant="primary" onClose={() => setShow(false)} dismissible>
          Buff/debuff lisätty, sulje ja lisää uusi!
        </Alert>
      )}
      <div className="row">
        <button 
          type="submit" 
          disabled={show} 
          className={show ? "btn btn-primary disabled" : "btn btn-primary"}
          aria-label="Add buff or debuff to selected stats"
        >
          Add Buff/Debuff
        </button>
      </div>
    </form>
  );
}

function BuffList({ buffs, removeBuff }) {
  if (buffs.length === 0) {
    return (
      <div className="text-center text-muted">
        <p>No active buffs or debuffs</p>
      </div>
    );
  }

  return (
    <ul className="list-group" role="list" aria-label="Active buffs and debuffs">
      {buffs.map((buff, index) => (
        <li 
          key={index} 
          className={`list-group-item list-group-item-${(Number(buff.points) >= 0) ? 'success' : 'danger'}`}
          role="listitem"
        >
          <div className="row align-items-center">
            <div className="col-8">
              <span className="fw-bold">{buff.stat.toUpperCase()}:</span> {buff.points} 
              <span className="text-muted"> (T{buff.turns} turns remaining)</span>
            </div>
            <div className="col-4 text-end">
              <button 
                className="btn btn-danger btn-sm" 
                onClick={() => removeBuff(index)}
                aria-label={`Remove ${buff.stat} buff/debuff`}
              >
                ×
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default App;
