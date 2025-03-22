'use client';

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';
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
    <SandpackProvider
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
        externalResources: ['https://cdn.tailwindcss.com'],
      }}
      files={{
        '/App.tsx': { code: generateSandboxCode(props.code) },
      }}
    >
      <SandpackLayout>
        <SandpackCodeEditor
          showLineNumbers
          wrapContent
          style={{ height: '500px' }}
        />
        <SandpackPreview
          showOpenInCodeSandbox={false}
          style={{ height: '500px' }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
