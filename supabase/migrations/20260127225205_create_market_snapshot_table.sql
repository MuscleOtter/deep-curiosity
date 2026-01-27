create table "public"."market_snapshot" (
    "ticker" text not null,
    "sector" text,
    "market_cap" bigint,
    "price" numeric,
    "change_percent" numeric,
    "pe_ratio" numeric,
    "last_updated" timestamp with time zone default now(),
    constraint "market_snapshot_pkey" primary key ("ticker")
);

alter table "public"."market_snapshot" enable row level security;

create policy "Enable read access for all users"
on "public"."market_snapshot"
as permissive
for select
to public
using (true);

create policy "Enable insert/update for service role only"
on "public"."market_snapshot"
as permissive
for all
to service_role
using (true)
with check (true);
