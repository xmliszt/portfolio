alter table "command_center"."campaigns"
  add column "code" text,
  add column "color" text;

update "command_center"."campaigns" c
set
  "code" = case
    when length(regexp_replace(c.name, '[^A-Za-z0-9]', '', 'g')) >= 2
      then upper(left(regexp_replace(c.name, '[^A-Za-z0-9]', '', 'g'), 3))
    else 'CMP'
  end,
  "color" = (array['violet', 'gold', 'teal', 'coral', 'orchid', 'lime', 'slate'])[((ordered.position - 1) % 7) + 1]
from (
  select "id", row_number() over (order by "created_at") as position
  from "command_center"."campaigns"
) ordered
where ordered.id = c.id;

alter table "command_center"."campaigns"
  alter column "code" set not null,
  alter column "color" set not null,
  add constraint "campaigns_code_check" check ("code" ~ '^[A-Z0-9]{2,4}$'),
  add constraint "campaigns_color_check" check ("color" in ('violet', 'gold', 'teal', 'coral', 'orchid', 'lime', 'slate'));
