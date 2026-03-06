import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), '..', 'config', 'searches.json');

export async function GET() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(data);
    return NextResponse.json(config);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ searches: [] }, { status: 200 });
    }
    return NextResponse.json(
      { error: 'Erreur lors de la lecture de la configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.searches || !Array.isArray(body.searches)) {
      return NextResponse.json(
        { error: 'Format invalide: "searches" doit être un tableau' },
        { status: 400 }
      );
    }

    // Sauvegarder la configuration
    await fs.writeFile(
      CONFIG_PATH,
      JSON.stringify(body, null, 2),
      'utf-8'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la configuration' },
      { status: 500 }
    );
  }
}
