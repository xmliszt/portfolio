import { createServiceRoleClient } from "@/lib/supabase/create-service-role-client";

import { ImageDialog } from "./image-dialog";

export async function PhotoBentoGrid() {
  if (!process.env.SUPABASE_DB_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <div>Photos are unavailable in this environment.</div>;
  }

  const supabaseClient = createServiceRoleClient();
  const { data, error } = await supabaseClient.storage.from("photos").list();
  if (!data || error) return <div>Error loading photos...</div>;

  const photos = data.map((photo) => ({
    id: photo.id,
    name: photo.name,
    url: supabaseClient.storage.from("photos").getPublicUrl(photo.name).data
      .publicUrl,
  }));

  // Render the bento-grid
  return (
    <div className="grid w-full grid-cols-1 gap-4 p-4 lg:grid-cols-2">
      {photos.map((photo) => (
        <ImageDialog key={photo.id} src={photo.url} alt={photo.name} />
      ))}
    </div>
  );
}
