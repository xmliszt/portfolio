import { unstable_noStore as noStore } from "next/cache";

import { Tables } from "@/lib/supabase/__generated__/types";
import { createServiceRoleClient } from "@/lib/supabase/create-service-role-client";

type HobbyItemGroup = Pick<
  Tables<"hobby_item_groups">,
  "id" | "title" | "item_kind" | "sort_order"
>;

type HobbyItem = Pick<
  Tables<"hobby_items">,
  | "group_id"
  | "title"
  | "subtitle"
  | "creator"
  | "year"
  | "image_url"
  | "external_url"
  | "sort_order"
>;

export type HobbyItemSection = {
  id: HobbyItemGroup["id"];
  title: HobbyItemGroup["title"];
  itemKind: HobbyItemGroup["item_kind"];
  items: HobbyItem[];
};

export async function fetchHobbyItemSections(
  hobbySlug: string
): Promise<HobbyItemSection[]> {
  noStore();

  const supabase = createServiceRoleClient();
  const groupsResponse = await supabase
    .from("hobby_item_groups")
    .select("id,title,item_kind,sort_order")
    .eq("hobby_slug", hobbySlug)
    .order("sort_order");

  if (groupsResponse.error) throw groupsResponse.error;
  if (groupsResponse.data.length === 0) return [];

  const groups = groupsResponse.data;
  const groupIds = groups.map((group) => group.id);
  const itemsResponse = await supabase
    .from("hobby_items")
    .select("group_id,title,subtitle,creator,year,image_url,external_url,sort_order")
    .in("group_id", groupIds)
    .order("sort_order");

  if (itemsResponse.error) throw itemsResponse.error;

  const itemsByGroupId = new Map<HobbyItem["group_id"], HobbyItem[]>();
  for (const item of itemsResponse.data) {
    const existingItems = itemsByGroupId.get(item.group_id) ?? [];
    existingItems.push(item);
    itemsByGroupId.set(item.group_id, existingItems);
  }

  return groups.map((group) => ({
    id: group.id,
    title: group.title,
    itemKind: group.item_kind,
    items: itemsByGroupId.get(group.id) ?? [],
  }));
}
