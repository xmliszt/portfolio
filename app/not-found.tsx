import { Piano } from '@/components/custom/piano/piano';

export default async function NotFound() {
  return (
    <div className='flex w-full flex-col items-center gap-2'>
      <h1 className='text-center font-bold'>
        No page here, but you can enjoy some music?
      </h1>
      <div className='my-32 w-max rotate-90 rounded-lg bg-stone-700 p-4 shadow-[inset_0_0_20px_10px_rgba(0,0,0,0.4),0_0_20px_10px_rgba(0,0,0,0.4)] piano:my-8 piano:rotate-0'>
        <Piano />
      </div>
    </div>
  );
}
