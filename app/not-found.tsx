export default function NotFound() {
  return (
    <div className='flex flex-col items-center w-full gap-2'>
      <h1 className='text-4xl font-bold'>404</h1>
      <p className='text-lg'>Page not found</p>
      <p className='border p-4'>
        {
          'TODO: Make this a interactive page where user can click on keyboard to play a note 🎵'
        }
      </p>
    </div>
  );
}
