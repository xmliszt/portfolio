import type { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";

export type PawsServiceClient = ReturnType<typeof createPawsServiceClient>;
