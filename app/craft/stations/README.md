# Craft Stations

This directory contains React components that are used in the Craft section of the site. Each component is loaded as a string and injected into a Sandpack editor for interactive demonstrations.

## How It Works

1. Create a new `.tsx` file in this directory (use `TemplateStation.tsx` as an example)
2. Implement your component with a default export named `App`
3. Update `app/craft/stations.ts` to include your component using `loadStationCode('YourComponentName')`

## Guidelines

- Keep dependencies minimal (use only what's available in the Sandpack environment)
- Make sure to export a default component named `App`
- Use functional React components and hooks
- Prefer declarative solutions over mutative ones
- Avoid type assertions or type casting in TypeScript
- Create proper types and type guard functions when necessary

## Example

```tsx
// NewComponent.tsx
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>My Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

Then in `app/craft/stations.ts`:

```ts
import type { CraftStation } from './types';
import { loadStationCode } from './utils/load-station-code';

export const stations: CraftStation[] = [
  // ... existing stations
  {
    id: '2',
    title: 'My New Component',
    tags: ['useState', 'Button'],
    description: 'Description of what this component demonstrates',
    code: loadStationCode('NewComponent'),
  },
];
```
