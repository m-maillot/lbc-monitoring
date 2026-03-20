'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface BuyerLocation {
  lat: number;
  lng: number;
  radiusKm?: number;
}

interface Location {
  locationType: string;
  label?: string;
  city?: string;
  zipcode?: string;
  department_id?: string;
  region_id?: string;
  area?: {
    lat: number;
    lng: number;
    default_radius: number;
    radius?: number;
  };
}

interface SearchConfig {
  name: string;
  keywords?: string;
  onlyTitle?: boolean;
  shippable?: boolean;
  locations?: (number | string | Location)[];
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
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});

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


  const addLocationToSearch = (index: number) => {
    const newLocation: Location = {
      locationType: 'city',
      label: 'Vallans (79270)',
      city: 'Vallans',
      zipcode: '79270',
      department_id: '79',
      region_id: '20',
      area: {
        lat: 46.21444,
        lng: -0.55246,
        default_radius: 5000,
        radius: 1000
      }
    };

    const currentLocations = config.searches[index].locations || [];
    updateSearch(index, 'locations', [...currentLocations, newLocation]);
  };

  const removeLocationFromSearch = (searchIndex: number, locationIndex: number) => {
    const currentLocations = config.searches[searchIndex].locations || [];
    updateSearch(searchIndex, 'locations', currentLocations.filter((_, i) => i !== locationIndex));
  };

  const updateLocationField = (searchIndex: number, locationIndex: number, field: string, value: any) => {
    const currentLocations = [...(config.searches[searchIndex].locations || [])];
    const location = currentLocations[locationIndex];

    if (typeof location === 'object') {
      if (field.startsWith('area.')) {
        const areaField = field.split('.')[1];
        const existingArea = location.area || { lat: 0, lng: 0, default_radius: 5000, radius: 1000 };
        currentLocations[locationIndex] = {
          ...location,
          area: {
            ...existingArea,
            [areaField]: value
          }
        };
      } else {
        currentLocations[locationIndex] = {
          ...location,
          [field]: value
        };
      }
      updateSearch(searchIndex, 'locations', currentLocations);
    }
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
                  <label style={{ marginBottom: '8px', display: 'block' }}>Localisations</label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {search.locations?.map((loc, locIndex) => {
                      if (typeof loc !== 'object') return null;
                      const location = loc as Location;
                      return (
                        <div key={locIndex} style={{
                          padding: '15px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          background: '#f8f9fa'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <strong style={{ color: '#333' }}>Localisation #{locIndex + 1}</strong>
                            <button
                              type="button"
                              onClick={() => removeLocationFromSearch(index, locIndex)}
                              className={styles.btnDelete}
                              style={{ padding: '4px 8px', fontSize: '0.85em' }}
                            >
                              🗑️
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Type</label>
                              <select
                                value={location.locationType}
                                onChange={(e) => updateLocationField(index, locIndex, 'locationType', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              >
                                <option value="city">Ville</option>
                                <option value="department">Département</option>
                                <option value="region">Région</option>
                              </select>
                            </div>

                            <div>
                              <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Label</label>
                              <input
                                type="text"
                                value={location.label || ''}
                                onChange={(e) => updateLocationField(index, locIndex, 'label', e.target.value)}
                                placeholder="Vallans (79270)"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Ville</label>
                              <input
                                type="text"
                                value={location.city || ''}
                                onChange={(e) => updateLocationField(index, locIndex, 'city', e.target.value)}
                                placeholder="Vallans"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Code postal</label>
                              <input
                                type="text"
                                value={location.zipcode || ''}
                                onChange={(e) => updateLocationField(index, locIndex, 'zipcode', e.target.value)}
                                placeholder="79270"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Département ID</label>
                              <input
                                type="text"
                                value={location.department_id || ''}
                                onChange={(e) => updateLocationField(index, locIndex, 'department_id', e.target.value)}
                                placeholder="79"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Région ID</label>
                              <input
                                type="text"
                                value={location.region_id || ''}
                                onChange={(e) => updateLocationField(index, locIndex, 'region_id', e.target.value)}
                                placeholder="20"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                              />
                            </div>
                          </div>

                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
                            <strong style={{ fontSize: '0.9em', color: '#333', display: 'block', marginBottom: '8px' }}>Coordonnées GPS et rayon</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Latitude</label>
                                <input
                                  type="text"
                                  value={editingFields[`${index}-${locIndex}-lat`] ?? (location.area?.lat !== undefined && location.area.lat !== 0 ? location.area.lat : '')}
                                  onChange={(e) => {
                                    const strVal = e.target.value;
                                    const fieldKey = `${index}-${locIndex}-lat`;
                                    setEditingFields({ ...editingFields, [fieldKey]: strVal });

                                    const val = parseFloat(strVal);
                                    if (!isNaN(val)) {
                                      updateLocationField(index, locIndex, 'area.lat', val);
                                    }
                                  }}
                                  onBlur={() => {
                                    const fieldKey = `${index}-${locIndex}-lat`;
                                    const newFields = { ...editingFields };
                                    delete newFields[fieldKey];
                                    setEditingFields(newFields);
                                  }}
                                  placeholder="46.21444"
                                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Longitude</label>
                                <input
                                  type="text"
                                  value={editingFields[`${index}-${locIndex}-lng`] ?? (location.area?.lng !== undefined && location.area.lng !== 0 ? location.area.lng : '')}
                                  onChange={(e) => {
                                    const strVal = e.target.value;
                                    const fieldKey = `${index}-${locIndex}-lng`;
                                    setEditingFields({ ...editingFields, [fieldKey]: strVal });

                                    const val = parseFloat(strVal);
                                    if (!isNaN(val)) {
                                      updateLocationField(index, locIndex, 'area.lng', val);
                                    }
                                  }}
                                  onBlur={() => {
                                    const fieldKey = `${index}-${locIndex}-lng`;
                                    const newFields = { ...editingFields };
                                    delete newFields[fieldKey];
                                    setEditingFields(newFields);
                                  }}
                                  placeholder="-0.55246"
                                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Rayon par défaut (m)</label>
                                <input
                                  type="text"
                                  value={editingFields[`${index}-${locIndex}-default_radius`] ?? (location.area?.default_radius || '')}
                                  onChange={(e) => {
                                    const strVal = e.target.value;
                                    const fieldKey = `${index}-${locIndex}-default_radius`;
                                    setEditingFields({ ...editingFields, [fieldKey]: strVal });

                                    const val = parseInt(strVal);
                                    if (!isNaN(val)) {
                                      updateLocationField(index, locIndex, 'area.default_radius', val);
                                    }
                                  }}
                                  onBlur={() => {
                                    const fieldKey = `${index}-${locIndex}-default_radius`;
                                    const newFields = { ...editingFields };
                                    delete newFields[fieldKey];
                                    setEditingFields(newFields);
                                  }}
                                  placeholder="5000"
                                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.85em', fontWeight: '600', color: '#555', display: 'block', marginBottom: '4px' }}>Rayon personnalisé (m)</label>
                                <input
                                  type="text"
                                  value={editingFields[`${index}-${locIndex}-radius`] ?? (location.area?.radius || '')}
                                  onChange={(e) => {
                                    const strVal = e.target.value;
                                    const fieldKey = `${index}-${locIndex}-radius`;
                                    setEditingFields({ ...editingFields, [fieldKey]: strVal });

                                    const val = parseInt(strVal);
                                    if (!isNaN(val)) {
                                      updateLocationField(index, locIndex, 'area.radius', val);
                                    }
                                  }}
                                  onBlur={() => {
                                    const fieldKey = `${index}-${locIndex}-radius`;
                                    const newFields = { ...editingFields };
                                    delete newFields[fieldKey];
                                    setEditingFields(newFields);
                                  }}
                                  placeholder="1000"
                                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => addLocationToSearch(index)}
                      className={styles.btnAdd}
                      style={{ marginTop: '10px' }}
                    >
                      ➕ Ajouter une localisation
                    </button>
                  </div>
                  <small style={{ color: '#666', fontSize: '0.85em', marginTop: '8px', display: 'block' }}>
                    Créez des localisations avec coordonnées GPS et rayon personnalisé
                  </small>
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
