begin;
alter table public.dioka_app_state add column if not exists updated_at timestamptz not null default now();
create index if not exists dioka_state_prefix_idx on public.dioka_app_state(key text_pattern_ops);
create index if not exists dioka_state_recent_idx on public.dioka_app_state(updated_at desc,key desc);
create index if not exists dioka_order_owner_idx on public.dioka_app_state((value->>'userId'),updated_at desc) where key like 'order:%';
create index if not exists dioka_pending_reservation_idx on public.dioka_app_state(((value->>'expiresAt')::numeric)) where key like 'reservation:%' and value->>'status'='pending';
-- Preserve legacy snapshots, but route all new writes to independent entities.
insert into public.dioka_app_state(key,value,version) select 'user:'||(u.value->>'id'),u.value,1 from public.dioka_app_state s, lateral jsonb_each(s.value->'users') u where s.key='accounts' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) select 'email:'||encode(sha256(convert_to(lower(u.key),'UTF8')),'hex'),jsonb_build_object('id',u.value->>'id'),1 from public.dioka_app_state s, lateral jsonb_each(s.value->'users') u where s.key='accounts' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) select 'google:'||encode(sha256(convert_to(u.value->>'googleSubject','UTF8')),'hex'),jsonb_build_object('id',u.value->>'id'),1 from public.dioka_app_state s, lateral jsonb_each(s.value->'users') u where s.key='accounts' and u.value ? 'googleSubject' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) select 'session:'||u.key,u.value,1 from public.dioka_app_state s, lateral jsonb_each(s.value->'sessions') u where s.key='accounts' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) select 'paidcart:'||u.key,jsonb_build_object('done',u.value),1 from public.dioka_app_state s, lateral jsonb_each(s.value->'processedPayments') u where s.key='accounts' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) select 'product:'||(p->>'id'),p,1 from public.dioka_app_state s, lateral jsonb_array_elements(s.value->'products') p where s.key='catalogue-v1' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) select 'reservation:'||r.key,r.value,1 from public.dioka_app_state s, lateral jsonb_each(s.value->'reservations') r where s.key='catalogue-v1' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) select 'order:'||r.key,r.value,1 from public.dioka_app_state s, lateral jsonb_each(s.value) r where s.key='orders' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) select 'thread:'||r.key,r.value,1 from public.dioka_app_state s, lateral jsonb_each(s.value) r where s.key='inbox' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) select 'subscriber:'||encode(sha256(convert_to(lower(r.key),'UTF8')),'hex'),jsonb_build_object('email',r.key,'createdAt',r.value),1 from public.dioka_app_state s, lateral jsonb_each(s.value) r where s.key='subscribers' on conflict(key) do nothing;
insert into public.dioka_app_state(key,value,version) values('schema:partitioned','{"ready":true}',1) on conflict(key) do nothing;
create or replace function public.dioka_compare_set(p_changes jsonb) returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare item jsonb; current_version bigint; key_name text;
begin
 if jsonb_typeof(p_changes)<>'array' or jsonb_array_length(p_changes)<1 or jsonb_array_length(p_changes)>50 then raise exception 'Invalid transaction size';end if;
 if (select count(distinct x->>'key') from jsonb_array_elements(p_changes)x)<>jsonb_array_length(p_changes) then raise exception 'Duplicate transaction key';end if;
 for key_name in select x->>'key' from jsonb_array_elements(p_changes)x order by x->>'key' loop perform pg_advisory_xact_lock(hashtextextended(key_name,0));end loop;
 for item in select x from jsonb_array_elements(p_changes)x loop
  current_version:=null;select version into current_version from public.dioka_app_state where key=item->>'key' for update;
  if coalesce(current_version,-1)<>(item->>'expected')::bigint then return false;end if;
 end loop;
 for item in select x from jsonb_array_elements(p_changes)x loop
  insert into public.dioka_app_state(key,value,version,updated_at)values(item->>'key',item->'value',1,now())on conflict(key)do update set value=excluded.value,version=dioka_app_state.version+1,updated_at=now();
 end loop;return true;
end $$;
create or replace function public.dioka_take_limit(p_key text,p_maximum integer) returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare count_now integer;
begin
 if p_key not like 'limit:%' or length(p_key)>200 or p_maximum<1 or p_maximum>100000 then raise exception 'Invalid limit';end if;
 insert into public.dioka_app_state(key,value,version,updated_at)values(p_key,jsonb_build_object('count',1,'expiresAt',(extract(epoch from now())*1000)::bigint+120000),1,now())on conflict(key)do update set value=jsonb_set(dioka_app_state.value,'{count}',to_jsonb((dioka_app_state.value->>'count')::integer+1)),version=dioka_app_state.version+1,updated_at=now()returning (value->>'count')::integer into count_now;
 return count_now<=p_maximum;
end $$;
create or replace function public.dioka_reserve_inventory(p_id text,p_items jsonb) returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare item record; product jsonb; items jsonb:='[]'::jsonb; available integer; product_key text;
begin
 if length(p_id)>100 or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>20 then raise exception 'Invalid reservation';end if;
 perform pg_advisory_xact_lock(hashtextextended('reservation:'||p_id,0));
 if exists(select 1 from public.dioka_app_state where key='reservation:'||p_id)then return true;end if;
 for item in select x->>'id' as id,sum((x->>'quantity')::integer)::integer as quantity,min(round((x->>'price')::numeric*100)) as price,count(distinct round((x->>'price')::numeric*100)) as prices from jsonb_array_elements(p_items)x group by x->>'id' order by x->>'id' loop
  product_key:='product:'||item.id;select value into product from public.dioka_app_state where key=product_key for update;
  available:=coalesce((product->>'stockQuantity')::integer,0);
  if product is null or coalesce((product->>'archived')::boolean,false) or item.quantity<1 or item.quantity>200 or item.prices<>1 or round((product->>'price')::numeric*100)<>item.price or available<item.quantity then raise exception 'Selection changed or sold out';end if;
  product:=product||jsonb_build_object('stockQuantity',available-item.quantity,'inStock',available-item.quantity>0,'version',coalesce((product->>'version')::bigint,0)+1);
  update public.dioka_app_state set value=product,version=version+1,updated_at=now()where key=product_key;
  items:=items||jsonb_build_array(jsonb_build_object('id',item.id,'quantity',item.quantity));
 end loop;
 insert into public.dioka_app_state(key,value,version,updated_at)values('reservation:'||p_id,jsonb_build_object('items',items,'status','pending','expiresAt',(extract(epoch from now())*1000)::bigint+2400000),1,now());return true;
end $$;
create or replace function public.dioka_settle_inventory(p_id text,p_paid boolean)returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
declare reservation jsonb; item record; product jsonb; product_key text; next_status text;
begin
 perform pg_advisory_xact_lock(hashtextextended('reservation:'||p_id,0));
 select value into reservation from public.dioka_app_state where key='reservation:'||p_id for update;
 if reservation is null then raise exception 'Reservation not found';end if;
 if reservation->>'status'='paid' or (not p_paid and reservation->>'status'='released')then return true;end if;
 if p_paid and reservation->>'status'='released' then raise exception 'Released reservation requires payment reconciliation';end if;
 if not p_paid then
  for item in select x->>'id' as id,(x->>'quantity')::integer as quantity from jsonb_array_elements(reservation->'items')x order by x->>'id' loop
   product_key:='product:'||item.id;select value into product from public.dioka_app_state where key=product_key for update;
   if product is null then raise exception 'Reserved product missing';end if;
   product:=product||jsonb_build_object('stockQuantity',(product->>'stockQuantity')::integer+item.quantity,'inStock',true,'version',coalesce((product->>'version')::bigint,0)+1);
   update public.dioka_app_state set value=product,version=version+1,updated_at=now()where key=product_key;
  end loop;
 end if;
 next_status:=case when p_paid then 'paid' else 'released' end;
 update public.dioka_app_state set value=jsonb_set(value,'{status}',to_jsonb(next_status)),version=version+1,updated_at=now()where key='reservation:'||p_id;return true;
end $$;
revoke all on function public.dioka_compare_set(jsonb),public.dioka_take_limit(text,integer),public.dioka_reserve_inventory(text,jsonb),public.dioka_settle_inventory(text,boolean) from public,anon,authenticated;
grant execute on function public.dioka_compare_set(jsonb),public.dioka_take_limit(text,integer),public.dioka_reserve_inventory(text,jsonb),public.dioka_settle_inventory(text,boolean) to service_role;
create or replace function public.dioka_admin_totals()returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object('orders',(select count(*) from public.dioka_app_state where key like 'order:%'),'revenue',(select coalesce(sum((value->>'total')::numeric),0) from public.dioka_app_state where key like 'order:%'),'products',(select count(*) from public.dioka_app_state where key like 'product:%' and coalesce((value->>'archived')::boolean,false)=false),'openConversations',(select count(*) from public.dioka_app_state where key like 'thread:%' and value->>'status'='open'),'subscribers',(select count(*) from public.dioka_app_state where key like 'subscriber:%'));
$$;
revoke all on function public.dioka_admin_totals() from public,anon,authenticated;
grant execute on function public.dioka_admin_totals() to service_role;
create index if not exists dioka_temporary_expiry_idx on public.dioka_app_state(((value->>'expiresAt')::numeric)) where key like 'limit:%' or key like 'session:%' or key like 'oauth:%';
create or replace function public.dioka_cleanup_temporary(p_limit integer default 1000) returns integer language plpgsql security invoker set search_path=public,pg_temp as $$
declare removed integer;
begin
 if p_limit<1 or p_limit>10000 then raise exception 'Invalid cleanup batch';end if;
 with expired as (select key from public.dioka_app_state where (key like 'limit:%' or key like 'session:%' or key like 'oauth:%') and (value->>'expiresAt')::numeric < extract(epoch from now())*1000 order by (value->>'expiresAt')::numeric limit p_limit for update skip locked)
 delete from public.dioka_app_state s using expired e where s.key=e.key;
 get diagnostics removed=row_count;return removed;
end $$;
revoke all on function public.dioka_cleanup_temporary(integer) from public,anon,authenticated;
grant execute on function public.dioka_cleanup_temporary(integer) to service_role;
commit;
