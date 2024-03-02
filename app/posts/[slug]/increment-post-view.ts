import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { Database } from '@/lib/supabase/__generated__/types';

type IncrementPostViewOptions = {
  slug: string;
};

export async function incrementPostView(options: IncrementPostViewOptions) {
  // Force revalidate the cache
  cookies();

  const supabase = createClient<Database>(
    process.env.SUPABASE_DB_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
