import { createServiceRoleClient } from '@/lib/supabase/create-service-role-client';

import { ImageDialog } from './image-dialog';
import { ScrollArea, ScrollBar } from './scroll-area';

export async function PhotoBentoGrid() {
  const supabaseClient = createServiceRoleClient();
  const { data, error } = await supabaseClient.storage.from('photos').list();
  if (!data || error) return <div>Error loading photos...</div>;

  const photos = data.map((photo) => ({
    id: photo.id,
    name: photo.name,
    url: supabaseClient.storage.from('photos').getPublicUrl(photo.name).data
      .publicUrl,
  }));

  // Render the bento-grid
  return (
    <ScrollArea className='whitespace-nowrap rounded-xl py-4'>
      <div className='flex h-[80vh] w-max flex-col flex-wrap gap-4 p-4'>
        {photos.map((photo) => (
          <ImageDialog key={photo.id} src={photo.url} alt={photo.name} />
        ))}
      </div>
      <ScrollBar orientation='horizontal' className='mx-auto w-[90%]' />
    </ScrollArea>
  );
}
