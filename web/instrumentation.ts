export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { scheduler } = await import('./lib/Scheduler');
    scheduler.start();
  }
}
