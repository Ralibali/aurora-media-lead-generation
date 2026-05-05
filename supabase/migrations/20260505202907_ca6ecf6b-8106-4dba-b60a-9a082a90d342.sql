insert into storage.buckets (id, name, public)
values ('lead-magnets', 'lead-magnets', false)
on conflict (id) do nothing;