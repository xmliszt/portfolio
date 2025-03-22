'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import { useTheme } from 'next-themes';

function generateSandboxCode(code: string) {
  return `import { motion } from 'motion/react';

export default function App() {
  return (
    ${code}
  );
}
`;
}

type SandboxProps = {
  code: string;
};

export function Sandbox(props: SandboxProps) {
  const { theme } = useTheme();

  return (
    <Sandpack
      theme={(() => {
        switch (theme) {
          case 'light':
            return 'light';
          case 'dark':
            return 'dark';
          default:
            return 'auto';
        }
      })()}
      template='react-ts'
      customSetup={{
        dependencies: {
          motion: '^12.4.10',
        },
      }}
      options={{
        editorHeight: '600px',
        externalResources: ['https://cdn.tailwindcss.com'],
        showConsole: false,
        showLineNumbers: true,
        resizablePanels: true,
        wrapContent: true,
        layout: 'preview',
      }}
      files={{
        '/App.tsx': { code: generateSandboxCode(props.code) },
      }}
    />
  );
}
