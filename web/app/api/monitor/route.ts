import { NextResponse } from 'next/server';
import path from 'path';
import { runMonitoring } from '../../../../src';
import { BufferedLogger } from '../../../lib/BufferedLogger';

export async function POST() {
  const logger = new BufferedLogger();

  try {
    const projectRoot = path.join(process.cwd(), '..');
    const configPath = path.join(projectRoot, 'config', 'searches.json');
    const storePath = path.join(projectRoot, 'data', 'seen-ads.json');

    await runMonitoring({
      configPath,
      storePath,
      logger,
    });

    return NextResponse.json({
      success: true,
      output: logger.getOutput(),
      message: 'Monitoring exécuté avec succès',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      output: logger.getOutput(),
      error: (error as Error).message,
      message: 'Erreur lors du lancement du monitoring',
    }, { status: 500 });
  }
}
