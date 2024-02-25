import Image from 'next/image';
import { fetchProfile } from './fetch-profile';

export default async function Home() {
  const profile = await fetchProfile();

  return (
    <article className='space-y-4'>
      <h1>About me</h1>
      <p></p>
      <div className='flex justify-center'>
        <Image
          src={profile.profile_url}
          width={100}
          height={100}
          className='rounded-full border-2 hover:animate-wave'
          alt='profile photo'
        />
      </div>
      <p>{profile.introduction_en}</p>
      <p>{profile.introduction_cn}</p>
    </article>
  );
}
