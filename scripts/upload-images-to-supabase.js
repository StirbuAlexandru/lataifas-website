/**
 * Script pentru upload imaginilor în Supabase Storage
 * Rulează: node scripts/upload-images-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurare din .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Lipsesc variabilele de mediu!');
  console.error('Adaugă în .env.local:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Directorul cu imagini
const imagesDir = path.join(__dirname, '..', 'public', 'products', 'FOTO');

async function uploadImages() {
  console.log('🚀 Începem upload-ul imaginilor...');
  console.log('📁 Director sursă:', imagesDir);
  
  if (!fs.existsSync(imagesDir)) {
    console.error('❌ Directorul nu există:', imagesDir);
    process.exit(1);
  }

  // Citește toate subdirectoarele (categoriile)
  const categories = fs.readdirSync(imagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📂 Categorii găsite: ${categories.length}`);

  let totalUploaded = 0;
  let totalFailed = 0;

  // Parcurge fiecare categorie
  for (const category of categories) {
    const categoryPath = path.join(imagesDir, category);
    const files = fs.readdirSync(categoryPath).filter(f => 
      f.toLowerCase().endsWith('.jpg') || 
      f.toLowerCase().endsWith('.jpeg') || 
      f.toLowerCase().endsWith('.png') ||
      f.toLowerCase().endsWith('.webp')
    );

    console.log(`\n📁 ${category}: ${files.length} imagini`);

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const fileName = file.replace(/\s+/g, '-'); // Înlocuiește spațiile cu -
      const storagePath = `products/${category}/${fileName}`;

      try {
        // Citește fișierul
        const fileBuffer = fs.readFileSync(filePath);

        // Upload în Supabase Storage
        const { data, error } = await supabase.storage
          .from('imagini')
          .upload(storagePath, fileBuffer, {
            contentType: file.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg',
            upsert: true, // Suprascrie dacă există deja
          });

        if (error) {
          console.error(`  ❌ ${file}: ${error.message}`);
          totalFailed++;
        } else {
          console.log(`  ✅ ${file} → ${storagePath}`);
          totalUploaded++;
        }
      } catch (err) {
        console.error(`  ❌ ${file}: ${err.message}`);
        totalFailed++;
      }
    }
  }

  console.log('\n===========================================');
  console.log(`✅ Upload complet!`);
  console.log(`   Succes: ${totalUploaded} imagini`);
  console.log(`   Eșuate: ${totalFailed} imagini`);
  console.log('===========================================\n');

  if (totalUploaded > 0) {
    console.log('📝 Pașii următori:');
    console.log('1. Rulează scriptul SQL pentru a actualiza URL-urile în DB');
    console.log('2. Verifică imaginile pe site');
  }
}

uploadImages().catch(err => {
  console.error('❌ Eroare:', err);
  process.exit(1);
});
