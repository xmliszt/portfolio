alter table "paws"."chat_messages"
  add column "status" text not null default 'pending' check ("status" in ('pending', 'sent', 'refused'));
