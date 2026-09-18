import React, { useState } from 'react';
import { Globe, Trophy, Award, MapPin, Play, CheckCircle2, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { WORLD_COUNTRIES, getPassportStamps } from '../../data/worldTour';
import { sounds } from '../../audio/soundSystem';

export function WorldTourView({ onStartChallenge }) {
  const [stamps, setStamps] = useState(() => getPassportStamps());
  const [selectedCountry, setSelectedCountry] = useState(WORLD_COUNTRIES[0]);
  const [filter, setFilter] = useState('all'); // 'all', 'conquered', 'unconquered'

  const totalCountries = WORLD_COUNTRIES.length;
  const conqueredCount = WORLD_COUNTRIES.filter(c => stamps[c.id]).length;
  const progressPercent = Math.round((conqueredCount / totalCountries) * 100);

  const filteredCountries = WORLD_COUNTRIES.filter(c => {
    const isConquered = !!stamps[c.id];
    if (filter === 'conquered') return isConquered;
    if (filter === 'unconquered') return !isConquered;
    return true;
  });

  const handleSelectCountry = (country) => {
    sounds.playClick();
    setSelectedCountry(country);
  };

  const handleLaunchMatch = (country) => {
    sounds.playStart();
    if (onStartChallenge) {
      onStartChallenge(country);
    }
  };

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '24px 20px 80px',
      animation: 'fadeIn 0.4s ease-out'
    }}>
      {/* ── Top Hero Banner ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(20, 10, 40, 0.9) 0%, rgba(10, 5, 25, 0.95) 100%)',
        border: '1px solid rgba(255, 0, 127, 0.3)',
        borderRadius: '24px',
        padding: '32px 36px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        marginBottom: '32px'
      }}>
        {/* Glow background accent */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(255, 0, 127, 0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '20%',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(255, 0, 127, 0.15)', border: '1px solid rgba(255, 0, 127, 0.4)', color: '#ff77aa', fontSize: '0.82rem', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Globe size={15} /> World Tour & Nations Cup
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', margin: '0 0 10px', background: 'linear-gradient(135deg, #ffffff 40%, #ff88bb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              CHESSX WORLD TOUR
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1.05rem', margin: 0, maxWidth: '640px', lineHeight: 1.6 }}>
              Travel across the globe, play on <strong>authentic 3D cultural boards</strong>, challenge national chess masters, and collect stamps in your official <strong>World Chess Passport</strong>!
            </p>
          </div>

          {/* Passport Progress Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            borderRadius: '18px',
            padding: '20px 24px',
            minWidth: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 215, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 215, 0, 0.4)', color: '#ffd700' }}>
                  <Trophy size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Passport Stamps</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{conqueredCount} of {totalCountries} Conquered</div>
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#00f0ff' }}>{progressPercent}%</div>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #ff007f 0%, #00f0ff 100%)',
                borderRadius: '999px',
                transition: 'width 0.6s ease'
              }} />
            </div>

            {/* Mini Stamp Badges */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {WORLD_COUNTRIES.map(c => {
                const isStamped = !!stamps[c.id];
                return (
                  <div
                    key={c.id}
                    title={`${c.name}: ${isStamped ? 'Conquered!' : 'Unchallenged'}`}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isStamped ? c.stampColor : 'rgba(255, 255, 255, 0.05)',
                      border: isStamped ? `1px solid ${c.stampColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      opacity: isStamped ? 1 : 0.35,
                      filter: isStamped ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'grayscale(1)',
                      transition: 'all 0.3s'
                    }}
                  >
                    {c.flag}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: `All Destinations (${totalCountries})` },
            { id: 'unconquered', label: `Unconquered (${totalCountries - conqueredCount})` },
            { id: 'conquered', label: `Conquered (${conqueredCount})` }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => { sounds.playClick(); setFilter(btn.id); }}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: filter === btn.id ? '1px solid var(--accent-dragonfruit)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: filter === btn.id ? 'rgba(255, 0, 127, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: filter === btn.id ? '#fff' : 'rgba(255, 255, 255, 0.65)',
                transition: 'all 0.2s'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Layout: Country Grid + Master Spotlight ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredCountries.map(country => {
          const isConquered = !!stamps[country.id];
          const isSelected = selectedCountry?.id === country.id;

          return (
            <div
              key={country.id}
              onClick={() => handleSelectCountry(country)}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(30, 20, 50, 0.85) 0%, rgba(20, 12, 35, 0.95) 100%)'
                  : 'rgba(20, 15, 30, 0.65)',
                border: isSelected
                  ? '2px solid var(--accent-dragonfruit)'
                  : isConquered
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isSelected ? 'translateY(-4px)' : 'none',
                boxShadow: isSelected
                  ? '0 12px 30px rgba(255, 0, 127, 0.25)'
                  : '0 4px 20px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px'
              }}
            >
              {/* Country Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{country.flag}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{country.name}</h3>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {country.city}
                      </div>
                    </div>
                  </div>

                  {isConquered ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid #22c55e',
                      color: '#4ade80',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={13} /> Conquered
                    </div>
                  ) : (
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Unchallenged
                    </div>
                  )}
                </div>

                {/* Venue Badge */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '14px'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    Venue & Board Style
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                    🏛️ {country.venueName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.4 }}>
                    {country.venueDesc}
                  </div>
                </div>

                {/* Master Details */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{country.master.avatar}</span>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>{country.master.name}</div>
                        <div style={{ fontSize: '0.72rem', color: country.stampColor, fontWeight: 700 }}>{country.master.title}</div>
                      </div>
                    </div>
                    <div style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 215, 0, 0.12)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      color: '#ffd700',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      ⚡ {country.master.rating} ELO
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                    <strong>Style:</strong> {country.master.playstyle}
                  </div>

                  {/* Speech Bubble */}
                  <div style={{
                    position: 'relative',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.76rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontStyle: 'italic',
                    lineHeight: 1.4
                  }}>
                    "{country.master.quote}"
                  </div>
                </div>
              </div>

              {/* Challenge Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLaunchMatch(country);
                }}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  borderRadius: '12px',
                  background: isConquered
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, var(--accent-dragonfruit) 0%, #7928ca 100%)',
                  boxShadow: '0 4px 15px rgba(255, 0, 127, 0.3)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Play size={16} /> Challenge {country.master.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
