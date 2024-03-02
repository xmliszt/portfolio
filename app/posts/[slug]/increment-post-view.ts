import { cookies } from 'next/headers';

import { createServiceRoleClient } from '@/lib/supabase/create-service-role-client';

type IncrementPostViewOptions = {
  slug: string;
};

export async function incrementPostView(options: IncrementPostViewOptions) {
  // Force revalidate the cache
  cookies();

  const supabase = createServiceRoleClient();
  const fetchCurrentViewResponse = await supabase
    .from('post_views')
    .select()
    .eq('slug', options.slug)
    .maybeSingle();
  if (fetchCurrentViewResponse.error) throw fetchCurrentViewResponse.error;
  if (fetchCurrentViewResponse.data == null) {
    // insert the row first
    const insertResponse = await supabase
      .from('post_views')
      .insert([{ slug: options.slug, view: 1 }])
      .single();
    if (insertResponse.error) throw insertResponse.error;
    return {
      views: 1,
    };
  }
  // Existing row, increment the view
  const incrementedView = fetchCurrentViewResponse.data.view + 1;
  const response = await supabase
    .from('post_views')
    .update({
      view: incrementedView,
    })
    .eq('slug', options.slug)
    .select()
    .single();
  if (response.error) throw response.error;
  return {
    views: response.data.view,
  };
}
