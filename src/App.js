import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
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

  const [turnEnded, setTurnEnded] = useState(false);

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
    const previousBuffs = [...buffs];
    const newBuffs = previousBuffs
      .map(buff => ({ ...buff, turns: buff.turns - 1 }))
      .filter(buff => buff.turns > 0);
    
    setBuffs(newBuffs);
    
    // Show visual feedback if buffs were affected
    if (previousBuffs.length > 0) {
      setTurnEnded(true);
      setTimeout(() => setTurnEnded(false), 2000); // Hide after 2 seconds
    }
  };

  const resetGame = () => {
    if (window.confirm('Are you sure you want to reset all stats and buffs? This action cannot be undone.')) {
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
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">LP STATIT</h1>
      </header>
      
      <div className="action-buttons">
        <button 
          className={`btn ${turnEnded ? 'btn-success' : 'btn-warning'}`}
          onClick={endTurn}
          aria-label="End current turn and reduce buff durations"
          disabled={turnEnded}
        >
          {turnEnded ? 'Turn Ended!' : 'End Turn'}
        </button>
        <button 
          className="btn btn-danger" 
          onClick={resetGame}
          aria-label="Reset all stats and buffs to zero"
        >
          Aloita alusta
        </button>
      </div>
      
      {turnEnded && (
        <div className="feedback-message feedback-success">
          ✓ Turn ended - buff durations reduced
        </div>
      )}
      
      <div className="stats-grid">
        {Object.keys(effectiveStats).sort().map(stat => (
          <div key={stat} className="stat-card">
            <h2 className="stat-title">{stat.toUpperCase()}</h2>
            <div className="stat-controls">
              <button 
                className="stat-btn stat-btn-decrease" 
                onClick={() => decrement(stat)}
                aria-label={`Decrease ${stat}`}
              >
                -
              </button>
              <span className="stat-value" role="status" aria-live="polite">
                {effectiveStats[stat]}
              </span>
              <button 
                className="stat-btn stat-btn-increase" 
                onClick={() => increment(stat)}
                aria-label={`Increase ${stat}`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <BuffsContainer>
        <h2 className="text-center">Buffs & Debuffs</h2>
        {buffs.length > 0 && (
          <div className="active-effects">
            {buffs.length} active effect{buffs.length !== 1 ? 's' : ''}
          </div>
        )}
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
        <div className="form-check">
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
         <label className="form-label" htmlFor="statSelect">Stat:</label>
         <div className="custom-select">
           {options.map(option => (
             <label key={option.value} className="custom-select-option">
               <input
                 type="checkbox"
                 checked={selected.some(item => item.value === option.value)}
                 onChange={(e) => {
                   if (e.target.checked) {
                     setSelected([...selected, option]);
                   } else {
                     setSelected(selected.filter(item => item.value !== option.value));
                   }
                 }}
               />
               <span className="custom-select-text">{option.label}</span>
             </label>
           ))}
         </div>
       </div>
      <div className="form-group">
        <label className="form-label" htmlFor="pointsInput">Amount:</label>
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
        <label className="form-label" htmlFor="turnsInput">Turns:</label>
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
      {show && (
        <Alert variant="primary" onClose={() => setShow(false)} dismissible>
          Buff/debuff lisätty, sulje ja lisää uusi!
        </Alert>
      )}
      <div className="form-group">
        <button 
          type="submit" 
          disabled={show} 
          className={show ? "btn btn-primary" : "btn btn-primary"}
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
      <div className="empty-state">
        <p>No active buffs or debuffs</p>
      </div>
    );
  }

  return (
    <div className="buff-list" role="list" aria-label="Active buffs and debuffs">
      {buffs.map((buff, index) => (
        <div 
          key={index} 
          className={`buff-item ${(Number(buff.points) >= 0) ? 'buff-item-success' : 'buff-item-danger'}`}
          role="listitem"
        >
          <div className="buff-content">
            <div className="buff-info">
              <span className="buff-stat">{buff.stat.toUpperCase()}:</span> 
              <span className="buff-value">{buff.points}</span>
              <span className={`buff-turns ${buff.turns <= 1 ? 'buff-turns-warning' : 'buff-turns-normal'}`}>
                (T{buff.turns} turns remaining)
              </span>
            </div>
            <button 
              className="buff-remove" 
              onClick={() => removeBuff(index)}
              aria-label={`Remove ${buff.stat} buff/debuff`}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
