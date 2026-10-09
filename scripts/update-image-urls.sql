-- ============================================================
-- Script SQL pentru actualizarea URL-urilor imaginilor
-- Dupã upload-ul în Supabase Storage
-- ============================================================

-- Verificare înainte de update
SELECT 
  id,
  name,
  image as old_image,
  in_stock
FROM products
WHERE image IS NOT NULL
LIMIT 10;

-- Actualizare URL-uri imagini
-- Convertim din: /products/FOTO/8 - Wrap/WRAP PICANT-DIAVOLA.jpg
-- În: https://xnlszfsfvsqmjmzkwllu.supabase.co/storage/v1/object/public/imagini/products/8-Wrap/WRAP-PICANT-DIAVOLA.jpg

UPDATE products
SET image = 'https://xnlszfsfvsqmjmzkwllu.supabase.co/storage/v1/object/public/imagini/products/' || 
  REPLACE(
    REPLACE(
      REPLACE(
        SUBSTRING(image FROM 16), -- Elimină '/products/FOTO/'
        ' ', '-'
      ),
      '(',
      ''
    ),
    ')',
    ''
  )
WHERE image LIKE '/products/FOTO/%';

-- Verificare dupã update
SELECT 
  id,
  name,
  image as new_image,
  in_stock
FROM products
WHERE image IS NOT NULL AND image LIKE 'https://%'
LIMIT 10;

-- Numãrãrì finale
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE image IS NOT NULL) as with_image,
  COUNT(*) FILTER (WHERE image LIKE 'https://%') as with_supabase_url,
  COUNT(*) FILTER (WHERE image LIKE '/products/FOTO/%') as still_local_path
FROM products;
