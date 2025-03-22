import { useState } from 'react';

/**
 * This is a template for creating new craft stations.
 *
 * Key points:
 * 1. The default exported function should be named 'App'
 * 2. The component will be loaded in the Sandpack editor environment
 * 3. You can use any React hooks, but keep dependencies minimal
 * 4. To add a new station, create a new file in this directory and update stations.ts
 */
export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900'>
      <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
        <h1 className='mb-4 text-2xl font-bold text-gray-800 dark:text-white'>
          Template Station
        </h1>
        <p className='mb-4 text-gray-600 dark:text-gray-300'>
          This is a template for new craft stations.
        </p>
        <div className='flex items-center justify-center space-x-4'>
          <button
            className='rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600'
            onClick={() => setCount(count - 1)}
          >
            Decrement
          </button>
          <span className='text-xl font-semibold text-gray-800 dark:text-white'>
            {count}
          </span>
          <button
            className='rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600'
            onClick={() => setCount(count + 1)}
          >
            Increment
          </button>
        </div>
      </div>

      <p className='mt-8 text-sm text-gray-500 dark:text-gray-400'>
        Edit this component in app/craft/stations/TemplateStation.tsx
      </p>
    </div>
  );
}
