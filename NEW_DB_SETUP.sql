-- ============================================================
-- LA TAIFAS - Schema completă pentru baza de date nouă
-- Rulați TOTUL o singură dată în SQL Editor al noului Supabase
-- ============================================================

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id),
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_type VARCHAR(10) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) DEFAULT 0,
    discount_active BOOLEAN DEFAULT false,
    image TEXT,
    images TEXT[],
    thumbnail TEXT,
    category_id UUID REFERENCES public.categories(id),
    stock INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    rating DECIMAL(2, 1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2),
    review_count INTEGER,
    tags TEXT[],
    preparation_time INTEGER,
    spicy_level VARCHAR(10),
    is_vegetarian BOOLEAN,
    is_vegan BOOLEAN,
    is_gluten_free BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 3. DELIVERY ZONES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name TEXT NOT NULL,
    min_order_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Delivery zones public read" ON public.delivery_zones FOR SELECT USING (true);
CREATE POLICY "Authenticated manage delivery zones" ON public.delivery_zones FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 4. ORDERS + ORDER_ITEMS
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
BEGIN
    order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    delivery_zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
    delivery_notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cash',
    client_ip VARCHAR(45),
    ing_order_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_client_ip ON public.orders(client_ip);
CREATE INDEX IF NOT EXISTS idx_orders_ing_order_id ON public.orders(ing_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone ON public.orders(delivery_zone_id);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage order items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 5. ADMIN USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'owner',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage admin users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert review" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can manage reviews" ON public.reviews FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 7. CUSTOM WINE CATEGORIES + WINES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.custom_wine_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.custom_wine_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read wine categories" ON public.custom_wine_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated manage wine categories" ON public.custom_wine_categories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.wines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_type VARCHAR(10) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) DEFAULT 0,
    discount_active BOOLEAN DEFAULT false,
    image TEXT,
    wine_type VARCHAR(50),
    sweetness VARCHAR(50),
    effervescence VARCHAR(50) DEFAULT 'still',
    region VARCHAR(255),
    alcohol_content DECIMAL(4, 2),
    volume INTEGER DEFAULT 750,
    year INTEGER,
    producer VARCHAR(255),
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    custom_wine_category_id UUID REFERENCES public.custom_wine_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wines_wine_type ON public.wines(wine_type);
CREATE INDEX IF NOT EXISTS idx_wines_in_stock ON public.wines(in_stock);
CREATE INDEX IF NOT EXISTS idx_wines_effervescence ON public.wines(effervescence);
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read wines" ON public.wines FOR SELECT USING (true);
CREATE POLICY "Authenticated manage wines" ON public.wines FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 8. MENU CATEGORIES + MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.menu_categories DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    details TEXT,
    ingredients TEXT,
    price DECIMAL(10,2),
    image TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. LOCATION GALLERY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.location_gallery (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 10. EVENT GALLERY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    alt_text TEXT DEFAULT 'Event Image',
    display_order INTEGER NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read event gallery" ON public.event_gallery FOR SELECT USING (true);
CREATE POLICY "Authenticated manage event gallery" ON public.event_gallery FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 11. EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT NOT NULL,
    phone_number TEXT NOT NULL DEFAULT '+40 753 077 063',
    text_color TEXT DEFAULT '#111827',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated manage events" ON public.events FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 12. BANNERS + BLOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    link VARCHAR(500),
    button_text VARCHAR(100) DEFAULT 'Learn More',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image TEXT,
    author VARCHAR(255) DEFAULT 'Admin',
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 13. STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, 52428800, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('imagini', 'imagini', true, 52428800, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('events', 'events', true, 52428800, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies - products bucket
DROP POLICY IF EXISTS "Public read products" ON storage.objects;
CREATE POLICY "Public read products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
DROP POLICY IF EXISTS "Public upload products" ON storage.objects;
CREATE POLICY "Public upload products" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'products');
DROP POLICY IF EXISTS "Public update products" ON storage.objects;
CREATE POLICY "Public update products" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'products');
DROP POLICY IF EXISTS "Public delete products" ON storage.objects;
CREATE POLICY "Public delete products" ON storage.objects FOR DELETE TO public USING (bucket_id = 'products');

-- Storage policies - imagini bucket
DROP POLICY IF EXISTS "Public read imagini" ON storage.objects;
CREATE POLICY "Public read imagini" ON storage.objects FOR SELECT USING (bucket_id = 'imagini');
DROP POLICY IF EXISTS "Public upload imagini" ON storage.objects;
CREATE POLICY "Public upload imagini" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'imagini');
DROP POLICY IF EXISTS "Public update imagini" ON storage.objects;
CREATE POLICY "Public update imagini" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'imagini');
DROP POLICY IF EXISTS "Public delete imagini" ON storage.objects;
CREATE POLICY "Public delete imagini" ON storage.objects FOR DELETE TO public USING (bucket_id = 'imagini');

-- Storage policies - events bucket
DROP POLICY IF EXISTS "Public read events storage" ON storage.objects;
CREATE POLICY "Public read events storage" ON storage.objects FOR SELECT USING (bucket_id = 'events');
DROP POLICY IF EXISTS "Public upload events" ON storage.objects;
CREATE POLICY "Public upload events" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'events');
DROP POLICY IF EXISTS "Public update events" ON storage.objects;
CREATE POLICY "Public update events" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'events');
DROP POLICY IF EXISTS "Public delete events" ON storage.objects;
CREATE POLICY "Public delete events" ON storage.objects FOR DELETE TO public USING (bucket_id = 'events');

-- ============================================================
-- DONE! Schema creat complet.
-- ============================================================
