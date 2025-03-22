'use client';

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';
import { useTheme } from 'next-themes';

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
          '@uidotdev/usehooks': '^2.4.1',
        },
      }}
      options={{
        externalResources: ['https://cdn.tailwindcss.com'],
      }}
      files={{
        '/App.tsx': { code: props.code },
      }}
    >
      <SandpackLayout>
        <SandpackCodeEditor
          showLineNumbers
          wrapContent
          style={{ height: '666px', fontSize: '12px' }}
        />
        <SandpackPreview
          showOpenInCodeSandbox={false}
          style={{ height: '666px' }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
