import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Alert from 'react-bootstrap/Alert';

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

  const [inventory, setInventory] = useState(() => {
    try {
      const savedInventory = JSON.parse(localStorage.getItem('inventory'));
      return savedInventory || [];
    } catch (error) {
      console.error('Error loading inventory from localStorage:', error);
      return [];
    }
  });

  const [money, setMoney] = useState(() => {
    try {
      const savedMoney = JSON.parse(localStorage.getItem('money'));
      return savedMoney || 0;
    } catch (error) {
      console.error('Error loading money from localStorage:', error);
      return 0;
    }
  });

  const [statuses, setStatuses] = useState(() => {
    try {
      const savedStatuses = JSON.parse(localStorage.getItem('statuses'));
      return savedStatuses || [];
    } catch (error) {
      console.error('Error loading statuses from localStorage:', error);
      return [];
    }
  });

  const [turnEnded, setTurnEnded] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('turnEnded'));
      return saved || false;
    } catch {
      return false;
    }
  });
  const [isMyTurn, setIsMyTurn] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('isMyTurn'));
      return saved !== null ? saved : false; // Default to false, so player must press 'It's My Turn' to start
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState('stats');

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

  useEffect(() => {
    try {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    } catch (error) {
      console.error('Error saving inventory to localStorage:', error);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('money', JSON.stringify(money));
    } catch (error) {
      console.error('Error saving money to localStorage:', error);
    }
  }, [money]);

  useEffect(() => {
    try {
      localStorage.setItem('statuses', JSON.stringify(statuses));
    } catch (error) {
      console.error('Error saving statuses to localStorage:', error);
    }
  }, [statuses]);

  useEffect(() => {
    try {
      localStorage.setItem('turnEnded', JSON.stringify(turnEnded));
    } catch {}
  }, [turnEnded]);

  useEffect(() => {
    try {
      localStorage.setItem('isMyTurn', JSON.stringify(isMyTurn));
    } catch {}
  }, [isMyTurn]);

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

  const addItem = (title, description) => {
    setInventory(prevInventory => [...prevInventory, { 
      id: Date.now(), 
      title, 
      description 
    }]);
  };

  const removeItem = (id) => {
    setInventory(prevInventory => prevInventory.filter(item => item.id !== id));
  };

  const addMoney = (amount) => {
    setMoney(prevMoney => prevMoney + amount);
  };

  const addStatus = (title, description, turns) => {
    setStatuses(prevStatuses => [
      ...prevStatuses,
      { id: Date.now(), title, description, turns: Number(turns) }
    ]);
  };
  const removeStatus = (id) => {
    setStatuses(prevStatuses => prevStatuses.filter(status => status.id !== id));
  };

  const endTurn = () => {
    const previousBuffs = [...buffs];
    const newBuffs = previousBuffs
      .map(buff => ({ ...buff, turns: buff.turns - 1 }))
      .filter(buff => buff.turns > 0);
    
    setBuffs(newBuffs);
    
    // Statuses: decrement turns and remove expired
    const previousStatuses = [...statuses];
    const newStatuses = previousStatuses
      .map(status => ({ ...status, turns: status.turns - 1 }))
      .filter(status => status.turns > 0);
    setStatuses(newStatuses);

    // End turn - buffs decrease, but no money gain yet
    setTurnEnded(true);
    setIsMyTurn(false);
    setTimeout(() => setTurnEnded(false), 2000); // Hide after 2 seconds
  };

  const startMyTurn = () => {
    // Calculate money increase based on Wealth stat at start of turn
    const wealthPoints = effectiveStats.wealth;
    const moneyIncrease = wealthPoints * 10;
    setMoney(prevMoney => prevMoney + moneyIncrease);
    
    // Start turn - money gained, buffs remain the same
    setIsMyTurn(true);
  };

  const resetGame = () => {
    if (window.confirm('Are you sure you want to reset all stats, buffs, and money? This action cannot be undone.')) {
      setStats({
        determination: 0,
        humor: 0,
        intelligence: 0,
        appearance: 0,
        wealth: 0
      });
      setBuffs([]);
      setInventory([]);
      setMoney(0);
      setIsMyTurn(false); // After reset, require player to press 'It's My Turn'
      setTurnEnded(false);
      try {
        localStorage.removeItem('stats');
        localStorage.removeItem('buffs');
        localStorage.removeItem('inventory');
        localStorage.removeItem('money');
        localStorage.removeItem('statuses');
        localStorage.removeItem('turnEnded');
        localStorage.removeItem('isMyTurn');
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

  const renderTabContent = () => {
    switch (activeTab) {
             case 'stats':
         return <StatsTab 
           stats={effectiveStats} 
           increment={increment} 
           decrement={decrement}
           turnEnded={turnEnded}
           isMyTurn={isMyTurn}
           endTurn={endTurn}
           startMyTurn={startMyTurn}
           resetGame={resetGame}
         />;
      case 'buffs':
        return <BuffsTab 
          buffs={buffs} 
          addBuff={addBuff} 
          removeBuff={removeBuff}
        />;
      case 'statuses':
        return <StatusesTab
          statuses={statuses}
          addStatus={addStatus}
          removeStatus={removeStatus}
        />;
      case 'inventory':
        return <InventoryTab 
          inventory={inventory} 
          addItem={addItem} 
          removeItem={removeItem}
          money={money}
          addMoney={addMoney}
        />;
             default:
         return <StatsTab 
           stats={effectiveStats} 
           increment={increment} 
           decrement={decrement}
           turnEnded={turnEnded}
           isMyTurn={isMyTurn}
           endTurn={endTurn}
           startMyTurn={startMyTurn}
           resetGame={resetGame}
         />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">LP STATIT</h1>
      </header>
      
      <main className="tab-content">
        {renderTabContent()}
      </main>
      
      <nav className="bottom-nav">
        <button 
          className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
          aria-label="Stats tab"
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Stats</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'buffs' ? 'active' : ''}`}
          onClick={() => setActiveTab('buffs')}
          aria-label="Buffs and debuffs tab"
        >
          <span className="nav-icon">⚡</span>
          <span className="nav-label">Buffs</span>
          {buffs.length > 0 && (
            <span className="nav-badge">{buffs.length}</span>
          )}
        </button>
        <button
          className={`nav-tab ${activeTab === 'statuses' ? 'active' : ''}`}
          onClick={() => setActiveTab('statuses')}
          aria-label="Statuses tab"
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Statuses</span>
          {statuses.length > 0 && (
            <span className="nav-badge">{statuses.length}</span>
          )}
        </button>
        <button 
          className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
          aria-label="Inventory tab"
        >
          <span className="nav-icon">🎒</span>
          <span className="nav-label">Items</span>
          {inventory.length > 0 && (
            <span className="nav-badge">{inventory.length}</span>
          )}
        </button>
      </nav>
    </div>
  );
}

function StatsTab({ stats, increment, decrement, turnEnded, isMyTurn, endTurn, startMyTurn, resetGame }) {
  return (
    <div className="stats-tab">
      <div className="action-buttons">
        {isMyTurn ? (
          <button 
            className="btn btn-warning"
            onClick={endTurn}
            aria-label="End current turn and reduce buff durations"
            disabled={turnEnded}
          >
            End Turn
          </button>
        ) : (
          <button 
            className="btn btn-success"
            onClick={startMyTurn}
            aria-label="Start my turn and collect money"
          >
            It's My Turn!
          </button>
        )}
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
      
      {!isMyTurn && (
        <div className="turn-reminder">
          <div className="reminder-icon">💰</div>
          <div className="reminder-text">
            <strong>Remember to collect your money from the bank!</strong>
            <p>You'll gain {stats.wealth * 10} money when you start your turn.</p>
          </div>
        </div>
      )}
      
      <div className="stats-grid">
        {Object.keys(stats).sort().map(stat => (
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
                {stats[stat]}
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
    </div>
  );
}

function BuffsTab({ buffs, addBuff, removeBuff }) {
  return (
    <div className="buffs-tab">
      <h2 className="tab-title">Buffs & Debuffs</h2>
      {buffs.length > 0 && (
        <div className="active-effects">
          {buffs.length} active effect{buffs.length !== 1 ? 's' : ''}
        </div>
      )}
      <BuffForm addBuff={addBuff} />
      <div className="buff-list-scroll">
        <BuffList buffs={buffs} removeBuff={removeBuff} />
      </div>
    </div>
  );
}

function StatusesTab({ statuses, addStatus, removeStatus }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [turns, setTurns] = useState(1);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (turns < 1) {
      setError('Turns must be at least 1');
      return;
    }
    addStatus(title, description, turns);
    setShow(true);
    setTitle('');
    setDescription('');
    setTurns(1);
  };

  return (
    <div className="buffs-tab">
      <h2 className="tab-title">Statuses</h2>
      {statuses.length > 0 && (
        <div className="active-effects">
          {statuses.length} active status{statuses.length !== 1 ? 'es' : ''}
        </div>
      )}
      <form className="buff-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="statusTitle">Title:</label>
          <input
            id="statusTitle"
            type="text"
            className="form-control"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="statusDescription">Description:</label>
          <input
            id="statusDescription"
            type="text"
            className="form-control"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="statusTurns">Turns:</label>
          <input
            id="statusTurns"
            type="number"
            className="form-control"
            value={turns}
            onChange={e => setTurns(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        {error && <div className="form-text text-danger">{error}</div>}
        {show && (
          <Alert variant="primary" onClose={() => setShow(false)} dismissible>
            Status added!
          </Alert>
        )}
        <div className="form-group">
          <button type="submit" disabled={show} className="btn btn-primary" aria-label="Add status">
            Add Status
          </button>
        </div>
      </form>
      <div className="buff-list" role="list" aria-label="Active statuses">
        {statuses.length === 0 ? (
          <div className="empty-state">
            <p>No active statuses</p>
          </div>
        ) : (
          statuses.map(status => (
            <div key={status.id} className="buff-item buff-item-success" role="listitem">
              <div className="buff-content">
                <div className="buff-info">
                  <span className="buff-stat">{status.title}:</span>
                  <span className="buff-value">{status.description}</span>
                  <span className={`buff-turns ${status.turns <= 1 ? 'buff-turns-warning' : 'buff-turns-normal'}`}>
                    (T{status.turns} turns remaining)
                  </span>
                </div>
                <button
                  className="buff-remove"
                  onClick={() => removeStatus(status.id)}
                  aria-label={`Remove status ${status.title}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InventoryTab({ inventory, addItem, removeItem, money, addMoney }) {
  return (
    <div className="inventory-tab">
      <h2 className="tab-title">Inventory</h2>
      
      <MoneySection money={money} addMoney={addMoney} />
      
      {inventory.length === 0 ? (
        <div className="empty-inventory">
          <p>No items in inventory</p>
        </div>
      ) : (
        <div className="inventory-items">
          {inventory.map(item => (
            <div key={item.id} className="inventory-item">
              <div className="item-info">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">{item.description}</p>
              </div>
              <button 
                className="item-remove"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.title}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="inventory-actions">
        <AddItemForm addItem={addItem} />
      </div>
    </div>
  );
}

function MoneySection({ money, addMoney }) {
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState('');

  const validateAmount = (value) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return '';
    }
    if (numValue < 10) {
      return 'Minimum amount is 10';
    }
    if (numValue > 1000) {
      return 'Maximum amount is 1000';
    }
    if (numValue % 10 !== 0) {
      return 'Amount must be a multiple of 10';
    }
    return '';
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;

    const numValue = parseInt(value);
    // Update amount first, then validate
    setAmount(numValue);
    
    // Validate and show error if needed
    const errorMsg = validateAmount(value);
    setError(errorMsg);
  };

  const handleAddMoney = () => {
    if (!error) {
      addMoney(amount);
    }
  };

  const handleSubtractMoney = () => {
    if (!error && money >= amount) {
      addMoney(-amount);
    }
  };

  const isValid = !error && amount >= 10 && amount <= 1000 && amount % 10 === 0;

  return (
    <div className="money-section">
      <div className="money-display">
        <span className="money-icon">💰</span>
        <span className="money-amount">{money.toLocaleString()}</span>
      </div>
      
      <div className="money-controls">
        <div className="money-input-group">
          <label className="form-label">Amount (10-1000, multiples of 10):</label>
          <input
            type="number"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            value={amount}
            onChange={handleAmountChange}
            min="10"
            max="1000"
            step="10"
            aria-label="Money amount to add or subtract (must be multiple of 10)"
          />
          {error && (
            <div className="invalid-feedback">
              {error}
            </div>
          )}
        </div>
        
        <div className="money-buttons">
          <button 
            className="btn btn-success"
            onClick={handleAddMoney}
            disabled={!isValid}
            aria-label={`Add ${amount} money`}
          >
            +{amount}
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleSubtractMoney}
            disabled={!isValid || money < amount}
            aria-label={`Subtract ${amount} money`}
          >
            -{amount}
          </button>
        </div>
      </div>
      
      <div className="money-info">
        <p>💡 Money increases by 10 × Wealth stat at the start of each turn</p>
        <p>💰 Valid amounts: 10, 20, 30... up to 1000</p>
      </div>
    </div>
  );
}

function AddItemForm({ addItem }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItemTitle.trim() && newItemDescription.trim()) {
      addItem(newItemTitle.trim(), newItemDescription.trim());
      setNewItemTitle('');
      setNewItemDescription('');
      setShowAddForm(false);
    }
  };

  if (!showAddForm) {
    return (
      <button 
        className="btn btn-primary"
        onClick={() => setShowAddForm(true)}
      >
        Add Item
      </button>
    );
  }

  return (
    <form onSubmit={handleAddItem} className="add-item-form">
      <div className="form-group">
        <label className="form-label">Title:</label>
        <input
          type="text"
          className="form-control"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Item title"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description:</label>
        <textarea
          className="form-control"
          value={newItemDescription}
          onChange={(e) => setNewItemDescription(e.target.value)}
          placeholder="Item description"
          rows="3"
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-success">
          Add Item
        </button>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={() => {
            setShowAddForm(false);
            setNewItemTitle('');
            setNewItemDescription('');
          }}
        >
          Cancel
        </button>
      </div>
    </form>
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
