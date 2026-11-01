insert into storage.buckets ("id", "name", "public", "file_size_limit", "allowed_mime_types")
values (
  'command-center-assets',
  'command-center-assets',
  false,
  209715200,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm', 'text/plain', 'application/x-subrip']
)
on conflict ("id") do nothing;
