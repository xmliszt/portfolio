'use client';

import { useCallback, useEffect, useState } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { debounce } from 'lodash';
import { Check, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as prettier from 'prettier';
import * as parserBabel from 'prettier/parser-babel';
import * as parserHTML from 'prettier/parser-html';
import * as parserTS from 'prettier/parser-typescript';
import * as prettierPluginEstree from 'prettier/plugins/estree.js';

import * as parserSCSS from 'prettier/parser-postcss';

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
        <EditorWithPrettier />
        <SandpackPreview
          showOpenInCodeSandbox={false}
          style={{ height: '666px' }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}

// Custom Editor Component
function EditorWithPrettier() {
  const { prettier } = useIsPrettier();

  return (
    <>
      <SandpackCodeEditor
        showLineNumbers
        wrapContent
        extensions={[
          javascript({ typescript: true, jsx: true }),
          autocompletion(),
        ]}
        style={{ height: '666px', fontSize: '12px' }}
      />
      {prettier && <PrettierPlugin />}
    </>
  );
}

// Prettier Plugin Button
function PrettierPlugin() {
  const { error, success, prettifyCode } = usePrettier();

  return (
    <button
      style={{ color: error ? '#ef4444' : success ? '#22c55e' : '#808080' }}
      className='bg-background absolute top-0 left-0 z-10 flex items-center gap-x-1 rounded-tl-md px-1.5 py-0.5 text-xs transition-all duration-300'
      onClick={prettifyCode}
    >
      {error ? <X size={12} /> : <Check size={12} />}
      Prettier
    </button>
  );
}

// Hook to check if Prettier is supported
const useIsPrettier = () => {
  const [prettier, setPrettier] = useState(false);
  const { sandpack } = useSandpack();

  useEffect(() => {
    const activeFile = sandpack.files[sandpack.activeFile];
    if (!activeFile) return;

    const fileExtension = sandpack.activeFile.split('.').pop()?.toLowerCase();
    if (!fileExtension) return;

    const prettierExtensions = [
      'js',
      'ts',
      'jsx',
      'tsx',
      'scss',
      'css',
      'html',
    ];
    const isPrettierSupported = !(
      activeFile.readOnly || !prettierExtensions.includes(fileExtension)
    );

    setPrettier(isPrettierSupported);
  }, [sandpack.files, sandpack.activeFile]);

  return { prettier };
};

// Hook to handle Prettier formatting
const usePrettier = () => {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { sandpack } = useSandpack();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    debounce((code: string) => {
      sandpack.updateCurrentFile(code, false);
    }, 150),
    [sandpack.activeFile, sandpack.files]
  );

  const prettifyCode = useCallback(async () => {
    const activeFile = sandpack.files[sandpack.activeFile];
    const currentCode: string = activeFile.code;

    try {
      const fileExtension = sandpack.activeFile.split('.').pop()?.toLowerCase();
      let formattedCode: string = currentCode;

      if (fileExtension === 'scss' || fileExtension === 'css') {
        formattedCode = await prettier.format(currentCode, {
          parser: 'scss',
          plugins: [parserSCSS],
        });
      } else {
        formattedCode = await prettier.format(currentCode, {
          parser:
            fileExtension === 'ts' || fileExtension === 'tsx'
              ? 'typescript'
              : 'babel',
          plugins: [parserBabel, parserTS, parserHTML, prettierPluginEstree],
        });
      }

      setError(false);
      setSuccess(true);
      debouncedUpdate(formattedCode);
    } catch (error) {
      setError(true);
      console.error(error);
    } finally {
      setTimeout(() => {
        setSuccess(false);
      }, 500);
    }
  }, [debouncedUpdate, sandpack.activeFile, sandpack.files]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        prettifyCode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sandpack.files, sandpack.activeFile, prettifyCode]);

  return { error, success, prettifyCode };
};
