'use server';

import { createServiceRoleClient } from '@/lib/supabase/create-service-role-client';

type IncrementRatingsOptions = {
  id: string;
  direction: 'up' | 'down';
};

export async function updateRatings(options: IncrementRatingsOptions) {
  const supabase = createServiceRoleClient();
  const fetchResponse = await supabase
    .from('ratings')
    .select()
    .eq('id', options.id)
    .maybeSingle();
  if (fetchResponse.error) throw fetchResponse.error;
  const { positive_rating, negative_rating } = fetchResponse.data ?? {
    positive_rating: 0,
    negative_rating: 0,
  };
  const positive =
    options.direction === 'up' ? positive_rating + 1 : positive_rating;
  const negative =
    options.direction === 'down' ? negative_rating + 1 : negative_rating;

  const updateResponse = await supabase
    .from('ratings')
    .upsert(
      {
        id: options.id,
        positive_rating: positive,
        negative_rating: negative,
      },
      {
        onConflict: 'id',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();
  if (updateResponse.error) throw updateResponse.error;

  return updateResponse.data;
}
