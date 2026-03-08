'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface BuyerLocation {
  lat: number;
  lng: number;
  radiusKm?: number;
}

interface SearchConfig {
  name: string;
  keywords?: string;
  onlyTitle?: boolean;
  shippable?: boolean;
  locations?: (number | string)[];
  category?: string;
  ownerType?: 'all' | 'pro' | 'private';
  priceMin?: number;
  priceMax?: number;
  enums?: Record<string, string[]>;
  ranges?: Record<string, { min?: number; max?: number }>;
  buyerLocation?: BuyerLocation;
}

interface Config {
  searches: SearchConfig[];
}

export default function Home() {
  const [config, setConfig] = useState<Config>({ searches: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [monitoringOutput, setMonitoringOutput] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement de la configuration' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuration sauvegardée avec succès!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const runMonitoring = async () => {
    setMonitoring(true);
    setMessage(null);
    setMonitoringOutput('');
    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setMonitoringOutput(result.output || '');
      } else {
        setMessage({ type: 'error', text: result.message || 'Erreur lors de l\'exécution' });
        setMonitoringOutput(result.output || result.error || '');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du lancement du monitoring' });
    } finally {
      setMonitoring(false);
    }
  };

  const addSearch = () => {
    setConfig({
      ...config,
      searches: [
        ...config.searches,
        {
          name: 'Nouvelle recherche',
          keywords: '',
          ownerType: 'all',
        },
      ],
    });
  };

  const removeSearch = (index: number) => {
    setConfig({
      ...config,
      searches: config.searches.filter((_, i) => i !== index),
    });
  };

  const updateSearch = (index: number, field: keyof SearchConfig, value: any) => {
    const newSearches = [...config.searches];
    newSearches[index] = { ...newSearches[index], [field]: value };
    setConfig({ ...config, searches: newSearches });
  };

  const updateBuyerLocation = (index: number, field: 'lat' | 'lng' | 'radiusKm', value: number | undefined) => {
    const newSearches = [...config.searches];
    newSearches[index] = {
      ...newSearches[index],
      buyerLocation: {
        ...newSearches[index].buyerLocation,
        lat: newSearches[index].buyerLocation?.lat || 0,
        lng: newSearches[index].buyerLocation?.lng || 0,
        radiusKm: newSearches[index].buyerLocation?.radiusKm,
        [field]: value,
      },
    };
    setConfig({ ...config, searches: newSearches });
  };

  const removeBuyerLocation = (index: number) => {
    const newSearches = [...config.searches];
    delete newSearches[index].buyerLocation;
    setConfig({ ...config, searches: newSearches });
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Chargement...</div></div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🔍 LBC Monitoring - Configuration</h1>
        <p>Gérez vos recherches LeBonCoin</p>
      </header>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.actions}>
        <button onClick={addSearch} className={styles.btnAdd}>
          ➕ Ajouter une recherche
        </button>
        <button onClick={saveConfig} disabled={saving} className={styles.btnSave}>
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
        </button>
        <button onClick={runMonitoring} disabled={monitoring} className={styles.btnMonitor}>
          {monitoring ? '⏳ Recherche en cours...' : '🔍 Lancer la recherche'}
        </button>
      </div>

      {monitoringOutput && (
        <div className={styles.outputContainer}>
          <h3>📋 Résultat de la recherche</h3>
          <pre className={styles.output}>{monitoringOutput}</pre>
        </div>
      )}

      <div className={styles.searches}>
        {config.searches.length === 0 ? (
          <div className={styles.empty}>
            Aucune recherche configurée. Cliquez sur "Ajouter une recherche" pour commencer.
          </div>
        ) : (
          config.searches.map((search, index) => (
            <div key={index} className={styles.searchCard}>
              <div className={styles.cardHeader}>
                <h3>Recherche #{index + 1}</h3>
                <button
                  onClick={() => removeSearch(index)}
                  className={styles.btnDelete}
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>

              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Nom de la recherche *</label>
                  <input
                    type="text"
                    value={search.name}
                    onChange={(e) => updateSearch(index, 'name', e.target.value)}
                    placeholder="Ex: MacBook à Paris"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mots-clés</label>
                  <input
                    type="text"
                    value={search.keywords || ''}
                    onChange={(e) => updateSearch(index, 'keywords', e.target.value)}
                    placeholder="Ex: macbook pro"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Catégorie (ID)</label>
                    <input
                      type="text"
                      value={search.category || ''}
                      onChange={(e) => updateSearch(index, 'category', e.target.value)}
                      placeholder="Ex: 15"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Type de vendeur</label>
                    <select
                      value={search.ownerType || 'all'}
                      onChange={(e) => updateSearch(index, 'ownerType', e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="private">Particuliers</option>
                      <option value="pro">Professionnels</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Prix minimum (€)</label>
                    <input
                      type="number"
                      value={search.priceMin || ''}
                      onChange={(e) => updateSearch(index, 'priceMin', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Prix maximum (€)</label>
                    <input
                      type="number"
                      value={search.priceMax || ''}
                      onChange={(e) => updateSearch(index, 'priceMax', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="1000"
                      min="0"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={search.onlyTitle || false}
                      onChange={(e) => updateSearch(index, 'onlyTitle', e.target.checked)}
                    />
                    {' '}Chercher uniquement dans le titre
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={search.shippable || false}
                      onChange={(e) => updateSearch(index, 'shippable', e.target.checked)}
                    />
                    {' '}Expédiable uniquement
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label>Localisations (séparées par des virgules)</label>
                  <input
                    type="text"
                    value={search.locations?.join(', ') || ''}
                    onChange={(e) => {
                      const locs = e.target.value.split(',').map(l => l.trim()).filter(l => l);
                      updateSearch(index, 'locations', locs.map(l => isNaN(Number(l)) ? l : Number(l)));
                    }}
                    placeholder="Ex: Paris, Lyon ou 11, 75"
                  />
                </div>

                <div className={styles.locationSection}>
                  <div className={styles.locationHeader}>
                    <label>Position de l'acheteur (pour le tri par distance)</label>
                    {search.buyerLocation && (
                      <button
                        onClick={() => removeBuyerLocation(index)}
                        className={styles.btnRemove}
                      >
                        Retirer
                      </button>
                    )}
                  </div>

                  {search.buyerLocation ? (
                    <>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Latitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={search.buyerLocation.lat}
                            onChange={(e) => updateBuyerLocation(index, 'lat', Number(e.target.value))}
                            placeholder="48.8566"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Longitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={search.buyerLocation.lng}
                            onChange={(e) => updateBuyerLocation(index, 'lng', Number(e.target.value))}
                            placeholder="2.3522"
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Rayon (km) - Optionnel</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={search.buyerLocation.radiusKm || ''}
                          onChange={(e) => updateBuyerLocation(index, 'radiusKm', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Ex: 10"
                        />
                        <small style={{ color: '#666', fontSize: '0.9em', marginTop: '4px', display: 'block' }}>
                          Seules les annonces dans ce rayon seront envoyées par email
                        </small>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => updateSearch(index, 'buyerLocation', { lat: 48.8566, lng: 2.3522 })}
                      className={styles.btnAdd}
                    >
                      ➕ Ajouter une position
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
