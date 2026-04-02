-- Supabase SQL Editor에서 실행하세요
-- 1. 제품 테이블
create table products (
  id bigint generated always as identity primary key,
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. 누구나 읽기/쓰기 허용 (anon key 사용)
alter table products enable row level security;
create policy "Allow all read" on products for select using (true);
create policy "Allow all insert" on products for insert with check (true);
create policy "Allow all update" on products for update using (true);
create policy "Allow all delete" on products for delete using (true);

-- 3. 파일 저장소 버킷
insert into storage.buckets (id, name, public) values ('files', 'files', true);
create policy "Allow public read" on storage.objects for select using (bucket_id = 'files');
create policy "Allow anon upload" on storage.objects for insert with check (bucket_id = 'files');
create policy "Allow anon delete" on storage.objects for delete using (bucket_id = 'files');
