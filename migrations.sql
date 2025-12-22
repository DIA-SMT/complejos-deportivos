-- Create Inventory table
create table inventory (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  quantity integer not null default 0,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Update Professors table
alter table professors 
add column if not exists email text;

-- Create Professor Schedules table
create table professor_schedules (
  id uuid default gen_random_uuid() primary key,
  professor_id uuid references professors(id) not null,
  day_of_week text not null, -- 'Monday', 'Tuesday', etc.
  start_time time not null,
  end_time time not null,
  sport text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
