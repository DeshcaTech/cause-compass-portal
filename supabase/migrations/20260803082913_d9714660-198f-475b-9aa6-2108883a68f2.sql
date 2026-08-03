-- ===== roles & profiles =====
CREATE TYPE public.app_role AS ENUM ('admin','member');
CREATE TYPE public.membership_type AS ENUM ('individual','student','family');
CREATE TYPE public.family_relation AS ENUM ('partner','dependent');
CREATE TYPE public.event_type AS ENUM ('ccgms','other');
CREATE TYPE public.campaign_status AS ENUM ('active','past');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== memberships =====
CREATE SEQUENCE public.membership_number_seq START 1000;

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  membership_number text NOT NULL UNIQUE DEFAULT ('CCGM-' || nextval('public.membership_number_seq')::text),
  membership_type public.membership_type NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  birth_month int NOT NULL,
  birth_year int NOT NULL,
  amount_paid numeric(10,2),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.memberships TO authenticated;
GRANT INSERT ON public.memberships TO anon;
GRANT ALL ON public.memberships TO service_role;
GRANT USAGE ON SEQUENCE public.membership_number_seq TO anon, authenticated, service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can apply" ON public.memberships FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "see own membership" ON public.memberships FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update membership" ON public.memberships FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER memberships_updated BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.membership_family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  relation public.family_relation NOT NULL,
  full_name text NOT NULL,
  birth_month int NOT NULL,
  birth_year int NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.membership_family_members TO authenticated;
GRANT INSERT ON public.membership_family_members TO anon;
GRANT ALL ON public.membership_family_members TO service_role;
ALTER TABLE public.membership_family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can add family on apply" ON public.membership_family_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "see own family members" ON public.membership_family_members FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.memberships m WHERE m.id = membership_id AND (m.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- ===== about =====
CREATE TABLE public.president_message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  president_name text NOT NULL,
  title text NOT NULL DEFAULT 'President',
  photo_url text,
  message text NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.president_message TO anon, authenticated;
GRANT ALL ON public.president_message TO service_role;
ALTER TABLE public.president_message ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read president" ON public.president_message FOR SELECT TO anon, authenticated USING (is_published);

CREATE TABLE public.board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role_title text NOT NULL,
  bio text,
  photo_url text,
  term_label text NOT NULL,
  is_current boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.board_members TO anon, authenticated;
GRANT ALL ON public.board_members TO service_role;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read board" ON public.board_members FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'General',
  file_url text NOT NULL,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.documents TO anon, authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read documents" ON public.documents FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.community_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  quantity int NOT NULL DEFAULT 1,
  member_price numeric(10,2),
  non_member_price numeric(10,2),
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_assets TO anon, authenticated;
GRANT ALL ON public.community_assets TO service_role;
ALTER TABLE public.community_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read assets" ON public.community_assets FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.asset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.community_assets(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  membership_number text,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  start_date date NOT NULL,
  end_date date NOT NULL,
  purpose text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.asset_requests TO authenticated;
GRANT INSERT ON public.asset_requests TO anon;
GRANT ALL ON public.asset_requests TO service_role;
ALTER TABLE public.asset_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can request asset" ON public.asset_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "see own asset requests" ON public.asset_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ===== events =====
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  location text,
  image_url text,
  event_type public.event_type NOT NULL DEFAULT 'ccgms',
  organiser text,
  ticket_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read events" ON public.events FOR SELECT TO anon, authenticated USING (true);

-- ===== gallery =====
CREATE TABLE public.galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  event_date date,
  cover_url text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.galleries TO anon, authenticated;
GRANT ALL ON public.galleries TO service_role;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read galleries" ON public.galleries FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.gallery_photos TO anon, authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read photos" ON public.gallery_photos FOR SELECT TO anon, authenticated USING (true);

-- ===== partners =====
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  owner_name text,
  category text NOT NULL DEFAULT 'General',
  short_description text,
  description text,
  logo_url text,
  phone text,
  email text,
  website text,
  address text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partners TO anon, authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read partners" ON public.partners FOR SELECT TO anon, authenticated USING (is_published);

-- ===== fundraising =====
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  description text,
  image_url text,
  goal_amount numeric(10,2) NOT NULL DEFAULT 0,
  raised_amount numeric(10,2) NOT NULL DEFAULT 0,
  status public.campaign_status NOT NULL DEFAULT 'active',
  ends_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaigns TO anon, authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read campaigns" ON public.campaigns FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  membership_number text,
  donor_name text,
  email text,
  amount numeric(10,2) NOT NULL,
  message text,
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.donations TO authenticated;
GRANT INSERT ON public.donations TO anon;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can donate" ON public.donations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "see own donations" ON public.donations FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ===== surveys =====
CREATE TABLE public.surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  closes_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.surveys TO anon, authenticated;
GRANT ALL ON public.surveys TO service_role;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read surveys" ON public.surveys FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  membership_number text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.survey_responses TO anon, authenticated;
GRANT SELECT ON public.survey_responses TO authenticated;
GRANT ALL ON public.survey_responses TO service_role;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can respond" ON public.survey_responses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read responses" ON public.survey_responses FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ===== volunteers / referrals / contact =====
CREATE TABLE public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  membership_number text,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  areas text[] NOT NULL DEFAULT '{}',
  availability text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.volunteer_applications TO anon, authenticated;
GRANT SELECT ON public.volunteer_applications TO authenticated;
GRANT ALL ON public.volunteer_applications TO service_role;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can volunteer" ON public.volunteer_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read volunteers" ON public.volunteer_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_number text,
  referrer_name text NOT NULL,
  referrer_email text NOT NULL,
  referrer_phone text,
  person_name text NOT NULL,
  person_contact text,
  support_type text NOT NULL,
  details text,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.referrals TO anon, authenticated;
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can refer" ON public.referrals FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read referrals" ON public.referrals FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read contact" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ===== seed content =====
INSERT INTO public.president_message (president_name, title, message) VALUES
('Dr. Emmanuel Ngwa','President','Dear members and friends of CCGMs,

It is my honour to welcome you to our community. For over a decade, CCGMs has been a home away from home — a place where families support one another, where our culture is celebrated, and where every member has a voice.

This year we are focused on three priorities: strengthening our youth programmes, expanding the support fund for families in difficulty, and making our events accessible to everyone across the region.

None of this happens without you. Whether you join as a member, volunteer a few hours, or support one of our campaigns, you are building something that will outlast all of us.

Thank you for being part of this journey.');

INSERT INTO public.board_members (full_name, role_title, term_label, is_current, sort_order, bio) VALUES
('Dr. Emmanuel Ngwa','President','2024 - 2026',true,1,'Leads the executive board and represents CCGMs with partner organisations.'),
('Marie-Claire Fontem','Vice President','2024 - 2026',true,2,'Oversees community programmes and member welfare.'),
('Samuel Tabi','General Secretary','2024 - 2026',true,3,'Keeps records, minutes and official communications.'),
('Grace Achu','Treasurer','2024 - 2026',true,4,'Manages the finances, membership dues and campaign funds.'),
('Peter Mbah','Events Coordinator','2024 - 2026',true,5,'Plans and delivers the annual events calendar.'),
('Linda Ewang','Youth Officer','2024 - 2026',true,6,'Runs youth mentoring and student support.'),
('Joseph Ndifor','President','2022 - 2024',false,1,'Served two terms and launched the community support fund.'),
('Alice Bih','General Secretary','2022 - 2024',false,2,'Digitised the membership register.'),
('Francis Tanyi','Treasurer','2022 - 2024',false,3,'Introduced transparent quarterly reporting.'),
('Rose Menyoli','President','2020 - 2022',false,1,'Guided the community through the pandemic years.');

INSERT INTO public.documents (title, description, category, file_url, file_type) VALUES
('CCGMs Constitution','The full constitution and governing rules of the community.','Governance','#','PDF'),
('Membership Form (printable)','Printable membership application for offline registration.','Membership','#','PDF'),
('Annual Report 2025','Activities, finances and impact for the past year.','Reports','#','PDF'),
('Asset Rental Terms','Terms and conditions for renting community assets.','Governance','#','PDF'),
('Safeguarding Policy','How we protect children and vulnerable adults.','Policies','#','PDF');

INSERT INTO public.community_assets (name, description, quantity, member_price, non_member_price) VALUES
('Folding Chairs (set of 20)','Sturdy padded folding chairs for events and gatherings.',6,15.00,30.00),
('Round Banquet Tables','Seats 8 people per table. Includes covers.',10,8.00,16.00),
('PA System & Speakers','Mixer, two speakers, two wireless microphones.',2,45.00,90.00),
('Cooking Pots (large)','Large catering pots for community cooking.',8,10.00,20.00),
('Marquee 6m x 3m','Weatherproof marquee with side panels.',2,60.00,120.00);

INSERT INTO public.events (title, description, start_at, end_at, location, event_type, organiser) VALUES
('CCGMs Annual Gala Night','Our flagship celebration with dinner, live music, awards and dancing. Dress code: traditional or black tie.', now() + interval '25 days', now() + interval '25 days 5 hours','Grand Community Hall','ccgms','CCGMs Events Committee'),
('Monthly General Meeting','Members meet to review activities, finances and upcoming plans. All members welcome.', now() + interval '9 days', now() + interval '9 days 2 hours','CCGMs Centre, Room 2','ccgms','General Secretary'),
('Youth Career Workshop','CV clinics, mock interviews and mentoring for students and young professionals.', now() + interval '16 days', now() + interval '16 days 4 hours','Central Library Meeting Room','ccgms','Youth Office'),
('Community Health Screening','Free blood pressure, diabetes and wellbeing checks run by partner clinicians.', now() + interval '40 days', now() + interval '40 days 6 hours','St. Mary Community Centre','other','Partner Health Trust'),
('Cultural Food Festival','Taste dishes from across the community. Stalls, music and children''s activities.', now() + interval '3 days', now() + interval '3 days 7 hours','Riverside Park Pavilion','other','Regional Culture Network'),
('New Year Thanksgiving Service','A service of thanksgiving to open the year together.', now() - interval '30 days', now() - interval '30 days' + interval '3 hours','St. Peter''s Church Hall','ccgms','CCGMs Executive'),
('Back to School Drive','Distribution of school supplies to families across the community.', now() - interval '70 days', now() - interval '70 days' + interval '5 hours','CCGMs Centre','ccgms','Welfare Committee'),
('Regional Diaspora Forum','Panel discussions on business, investment and diaspora engagement.', now() - interval '120 days', now() - interval '120 days' + interval '6 hours','City Conference Centre','other','Diaspora Council');

INSERT INTO public.galleries (title, description, event_date, is_default) VALUES
('Annual Gala Night 2025','Highlights from an unforgettable evening.', current_date - 200, true),
('Back to School Drive','Families collecting supplies for the new school year.', current_date - 70, false),
('Cultural Food Festival','Flavours, colours and music from the community.', current_date - 150, false),
('Youth Sports Day','Football, athletics and games for all ages.', current_date - 300, false);

INSERT INTO public.partners (business_name, owner_name, category, short_description, description, phone, email, website, address) VALUES
('Mama Nkeng Kitchen','Bertha Nkeng','Food & Catering','Authentic home cooking and event catering.','Family-run kitchen serving traditional dishes for weddings, funerals and celebrations. Catering from 20 to 400 guests, with vegetarian options available.','07700 900111','hello@mamankeng.example','https://example.com','12 Market Street'),
('Tabi Legal Services','Samuel Tabi','Professional Services','Immigration, family and property law.','Regulated legal practice offering immigration advice, family law, wills and conveyancing. Free 20-minute first consultation for community members.','07700 900222','info@tabilegal.example','https://example.com','44 High Road, Suite 3'),
('Achu Accounting','Grace Achu','Finance','Bookkeeping, tax returns and payroll.','Supporting small businesses and sole traders with self-assessment, VAT, payroll and company accounts. Discounted rates for CCGMs members.','07700 900333','grace@achuaccounting.example','https://example.com','2 Enterprise Way'),
('Ewang Hair & Beauty','Linda Ewang','Beauty','Braiding, weaves, natural hair care.','Specialists in protective styling, natural hair treatments and bridal beauty. Home appointments available at weekends.','07700 900444','book@ewangbeauty.example','https://example.com','88 Church Lane'),
('Mbah Building Works','Peter Mbah','Construction','Extensions, kitchens, bathrooms.','Fully insured builders handling extensions, loft conversions, kitchens and bathrooms. Free written quotations.','07700 900555','peter@mbahbuild.example','https://example.com','Unit 7, Industrial Estate'),
('Fontem Travel','Marie-Claire Fontem','Travel','Flights, visas and group travel.','Competitive fares, visa assistance and group travel packages for family visits and community trips.','07700 900666','travel@fontem.example','https://example.com','16 Station Approach');

INSERT INTO public.campaigns (title, summary, description, goal_amount, raised_amount, status, ends_at) VALUES
('Community Support Fund','Emergency help for families facing hardship.','The Support Fund provides rapid, confidential grants to community members facing bereavement, illness, job loss or housing emergencies. Every donation goes directly to families in need, reviewed by the welfare committee within 72 hours.',20000,12450,'active', current_date + 60),
('Youth Scholarship Programme','Scholarships for students entering university.','Each year we award scholarships covering fees, books and travel for students from families who could not otherwise afford them. Ten awards are planned for the coming academic year.',15000,6800,'active', current_date + 120),
('Community Centre Refurbishment','A better home for our gatherings.','Funds go towards flooring, heating, accessible toilets and new chairs so the centre can host more community activities all year round.',35000,9100,'active', current_date + 200),
('Back to School Drive 2025','School supplies for 200 children.','Completed campaign that provided uniforms, bags and stationery to 214 children before the school year.',8000,8650,'past', current_date - 60),
('Bereavement Support Appeal','Repatriation and funeral support.','Completed appeal supporting three families with repatriation and funeral costs.',10000,10400,'past', current_date - 150);

INSERT INTO public.surveys (title, description, is_active, closes_at, questions) VALUES
('2026 Events Preferences','Tell us what kind of events you want to see next year.', true, current_date + 30,
 '[{"id":"q1","type":"choice","label":"Which event matters most to you?","options":["Gala Night","Cultural Festival","Youth Programmes","Sports Day","Health & Wellbeing"]},{"id":"q2","type":"choice","label":"Preferred day for community events","options":["Friday evening","Saturday","Sunday afternoon"]},{"id":"q3","type":"text","label":"Any event idea you would like us to consider?"}]'::jsonb),
('Member Welfare Check-in','Help us understand how the community can better support you.', true, current_date + 45,
 '[{"id":"q1","type":"choice","label":"Which support would help you most?","options":["Employment & CV help","Housing advice","Mental health support","Childcare & family","Legal advice"]},{"id":"q2","type":"text","label":"Tell us more (optional)"}]'::jsonb),
('Community Centre Feedback','Closed survey about the centre refurbishment plans.', false, current_date - 20,
 '[{"id":"q1","type":"text","label":"What should we prioritise in the refurbishment?"}]'::jsonb);