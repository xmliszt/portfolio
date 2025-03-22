import fs from 'fs';
import path from 'path';

/**
 * Loads a station component file as a string
 * @param componentName Name of the component file without extension
 * @returns The component file contents as a string
 */
export function loadStationCode(componentName: string): string {
  const filePath = path.join(
    process.cwd(),
    'app',
    'craft',
    'stations',
    `${componentName}.tsx`
  );

  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error loading station component: ${componentName}`, error);
    return `// Error loading component: ${componentName}
export default function App() {
  return <div>Error loading component: ${componentName}</div>;
}`;
  }
}
