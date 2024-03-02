import Image from 'next/image';

export function WavingAvatar() {
  return (
    <div className='group relative'>
      <Image
        className='z-10 rounded-full border bg-background shadow-lg group-hover:animate-wave'
        src='https://github.com/xmliszt/resources/blob/main/portfolio/avatar.png?raw=true'
        alt='Li Yuxuan avatar'
        width={150}
        height={150}
        unoptimized
      />
      <span className='group-hover absolute right-0 top-10 -z-10 -rotate-12 opacity-0 transition-[opacity_transform] duration-300 ease-out group-hover:-translate-y-4 group-hover:translate-x-32 group-hover:rotate-6 group-hover:opacity-100'>
        ~ Yo! Whatssup! 👋🏻
      </span>
    </div>
  );
}
