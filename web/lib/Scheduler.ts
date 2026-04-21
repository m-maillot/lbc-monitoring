import path from 'path';
import fs from 'fs/promises';
import { runMonitoring } from '../../src';
import { BufferedLogger } from './BufferedLogger';

interface SearchScheduleState {
  lastRun: number | null;
}

class Scheduler {
  private state: Map<string, SearchScheduleState> = new Map();
  private tickIntervalId: ReturnType<typeof setInterval> | null = null;
  private configPath: string;
  private storePath: string;

  constructor() {
    const projectRoot = path.join(process.cwd(), '..');
    this.configPath = path.join(projectRoot, 'config', 'searches.json');
    this.storePath = path.join(projectRoot, 'data', 'seen-ads.json');
  }

  start() {
    if (this.tickIntervalId) return;
    console.log('[Scheduler] Démarrage du scheduler...');
    // Tick toutes les minutes
    this.tickIntervalId = setInterval(() => this.tick(), 60 * 1000);
    // Premier tick immédiat
    this.tick();
  }

  stop() {
    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
  }

  private async tick() {
    const now = Date.now();

    let searches: Array<{ name: string; intervalMinutes?: number }>;
    try {
      const raw = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(raw);
      searches = config.searches || [];
    } catch {
      // Config non disponible, on réessaiera au prochain tick
      return;
    }

    const dueSearchNames: string[] = [];

    for (const search of searches) {
      if (!search.intervalMinutes) continue;

      const state = this.state.get(search.name);
      const intervalMs = search.intervalMinutes * 60 * 1000;

      if (!state?.lastRun || now - state.lastRun >= intervalMs) {
        dueSearchNames.push(search.name);
        this.state.set(search.name, { lastRun: now });
      }
    }

    if (dueSearchNames.length === 0) return;

    console.log(`[Scheduler] Lancement des recherches planifiées: ${dueSearchNames.join(', ')}`);
    const logger = new BufferedLogger();
    try {
      await runMonitoring({
        configPath: this.configPath,
        storePath: this.storePath,
        logger,
        searchNames: dueSearchNames,
      });
    } catch (error) {
      console.error(`[Scheduler] Erreur lors de l'exécution: ${error}`);
    }
  }
}

export const scheduler = new Scheduler();
