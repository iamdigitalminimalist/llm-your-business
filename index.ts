import concurrently from 'concurrently';

concurrently([
  {
    name: 'client-api',
    command: 'bun run dev',
    cwd: 'services/client-api',
    prefixColor: 'cyan',
  },
  {
    name: 'client',
    command: 'bun run dev',
    cwd: 'services/client',
    prefixColor: 'green',
  },
]);
