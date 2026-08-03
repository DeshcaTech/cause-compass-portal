create or replace function public.submit_membership(
  _full_name text,
  _email text,
  _phone text,
  _address text,
  _birth_month int,
  _birth_year int,
  _membership_type public.membership_type,
  _amount numeric default null,
  _family jsonb default '[]'::jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  _id uuid;
  _number text;
  _member jsonb;
begin
  if length(trim(_full_name)) < 2 or length(_full_name) > 120 then
    raise exception 'Invalid full name';
  end if;
  if _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(_email) > 255 then
    raise exception 'Invalid email';
  end if;
  if _birth_month < 1 or _birth_month > 12 then
    raise exception 'Invalid birth month';
  end if;
  if _birth_year < 1900 or _birth_year > extract(year from now())::int then
    raise exception 'Invalid birth year';
  end if;

  insert into public.memberships (full_name, email, phone, address, birth_month, birth_year, membership_type, amount_paid, user_id)
  values (trim(_full_name), lower(trim(_email)), trim(_phone), trim(_address), _birth_month, _birth_year, _membership_type, _amount, auth.uid())
  returning id, membership_number into _id, _number;

  if _membership_type = 'family' then
    for _member in select * from jsonb_array_elements(coalesce(_family, '[]'::jsonb))
    loop
      insert into public.membership_family_members (membership_id, full_name, relation, birth_month, birth_year, phone)
      values (
        _id,
        left(trim(_member->>'full_name'), 120),
        (_member->>'relation')::public.family_relation,
        (_member->>'birth_month')::int,
        (_member->>'birth_year')::int,
        nullif(left(trim(coalesce(_member->>'phone','')), 30), '')
      );
    end loop;
  end if;

  return _number;
end;
$$;

revoke all on function public.submit_membership(text, text, text, text, int, int, public.membership_type, numeric, jsonb) from public;
grant execute on function public.submit_membership(text, text, text, text, int, int, public.membership_type, numeric, jsonb) to anon, authenticated;