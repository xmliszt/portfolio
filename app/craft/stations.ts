import type { CraftStation } from './types';

export const stations: CraftStation[] = [
  {
    id: '1',
    title: 'Apple Vision OS resize handle animation',
    tags: ['AnimatePresence'],
    description:
      'Use react-motion to re-create the Apple Vision OS window resize handle animation. 🚧 Work in progress...',
    code: `<div className='flex justify-center items-center h-screen w-screen'>
      <div 
        className='size-64 rounded-2xl shadow-md overflow-hidden border border-border'
        style={{
          background: 'url(https://images.unsplash.com/photo-1742412615574-ce65e63598d8?q=80&w=3538&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) no-repeat center center',
          backgroundSize: 'cover'
        }}
      >
        
      </div>

      <p className='fixed text-neutral-400 text-xs bottom-6 px-4 text-center'>
        Try move your cursor around the bottom-right and bottom-left corner of this card
      </p>
    </div>`,
  },
];
