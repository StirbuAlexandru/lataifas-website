import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ProductUpdate = {
  name: string;
  price: number;
  description: string;
  aliases?: string[];
};

const normalizeName = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/ă/g, 'a')
  .replace(/â/g, 'a')
  .replace(/î/g, 'i')
  .replace(/ș|ş/g, 's')
  .replace(/ț|ţ/g, 't')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const updates: ProductUpdate[] = [
  { name: 'Bruschette cu roșii și busuioc', price: 22, description: '300 gr. Pâine baghetă, roșii, busuioc, usturoi, sare, piper, lămâie, ulei.', aliases: ['Bruschete cu Roșii și Busuioc'] },
  { name: 'Salată cu piept de pui și dressing de iaurt', price: 35, description: '350 gr. Piept de pui, salată verde, roșii, castraveți, ardei gras, ceapă, crutoane, dressing, piper.' },
  { name: 'Cuib de cartofi cu bacon, brânză și ou', price: 32, description: '350 gr/50 gr. Cartofi prăjiți, bacon, telemea de vaci, ouă, sare, piper, pâine pe vatră.' },
  { name: 'Salată asortată', price: 19, description: '250 gr. Salată verde, roșii, castraveți, ardei gras, ceapă roșie.' },

  { name: 'Supă de pui', price: 29, description: '450 gr. Piept de pui, morcov, tăiței, pătrunjel, supă, sare, piper.', aliases: ['Supa de găină', 'Supă de găină'] },
  { name: 'Ciorbă de purcel', price: 29, description: '450 gr. Carne de purcel, morcov, țelină, ceapă, păstârnac, ardei gras, orez, pastă de tomate, pătrunjel, leuștean, sare, piper, borș de putină, supă.' },
  { name: 'Ciorbă rădăuțeană', price: 30, description: '450 gr. Piept de pui, smântână, gălbenuș de ou, usturoi, oțet, sare, piper, amidon, supă de pui.' },
  { name: 'Ciorbă de fasole cu afumătură', price: 30, description: '480 gr. Scăriță afumată, fasole, morcov, bulion, ceapă, țelină, leuștean, borș, supă, sare, piper.' },
  { name: 'Ciorbă de burtă', price: 30, description: '450 gr. Burtă fiartă, smântână, gălbenuș de ou, usturoi, oțet, sare, piper, amidon, supă. Include opțiuni: ceapă roșie, ardei, smântână.' },

  { name: 'Platou tradițional cu scrijele', price: 54, description: '850 gr. Cartofi scrijele, slăninuță, telemea, ceapă, iaurt, sare.' },
  { name: 'Tigaie picantă cu pui și legume', price: 45, description: '450 gr. Piept de pui, ceapă, vinete, dovlecei, ardei gras, ciuperci, suc de roșii, fulgi de chilly, sare, piper.' },
  { name: 'Coaste de porc', price: 73, description: '850 gr. Coaste porc, cartofi wedges, usturoi, pătrunjel verde, dulceață de ardei iute, sos Calypso, ulei, castraveți murați, sare, piper.' },
  { name: 'Platou de bere/2 pers', price: 99, description: '800 gr/80 gr. Aripioare picante, pui crispy, coaste de pui, cartofi prăjiți, sos Calypso. Comandă cu cel puțin 1 h înainte.', aliases: ['Platou de bere 2 pers', 'Platou de bere / 2 persoane'] },
  { name: 'Platou de bere/1 pers', price: 54, description: '400 gr/40 gr. Aripioare picante, pui crispy, coaste de pui, cartofi prăjiți, sos Calypso. Comandă cu cel puțin 1 h înainte.', aliases: ['Platou de bere 1 pers', 'Platou de bere / 1 persoană'] },
  { name: 'Ciolan copt-afumat cu cartofi', price: 99, description: '800 gr/300 gr/100 gr. Ciolan afumat, cartofi wedges, usturoi, pătrunjel, parmezan, sare, ulei, dulceață de ardei iute, castraveți murați.' },

  { name: 'Crispy strips cu cartofi prăjiți', price: 38.5, description: '300 gr/150 gr/50 gr. Piept de pui, făină, ou, fulgi de porumb, cartofi, sos de iaurt cu usturoi.' },
  { name: 'Aripioare crocante cu sos de usturoi', price: 39.5, description: '300 gr/150 gr/60 gr. Aripioare de pui, cartofi, sos de usturoi, amidon, făină, boia dulce, usturoi, piper, sare.' },
  { name: 'Quesadilla cu pui și sos de roșii cu busuioc', price: 29.5, description: '350/70 gr. Lipie, piept de pui, mozzarella, porumb boabe, ardei gras, sos de roșii.' },
  { name: 'Kebab la lipie', price: 47, description: '700 gr. Lipie, carne kebab pui, cartofi prăjiți, salată verde, varză, roșii, ceapă, sos kebab.' },
  { name: 'Shaorma La Taifas', price: 44, description: '700 gr. Carne kebab pui, cartofi prăjiți, salată verde, varză, roșii, ceapă, sos kebab.', aliases: ['Shaorma LA TAIFAS'] },
  { name: 'Cartofi prăjiți', price: 12, description: '200 gr. Cartofi prăjiți, sare.' },
  { name: 'Cartofi wedges', price: 14, description: '200 gr. Cartofi wedges prăjiți, sare.' },
  { name: 'Cartofi cu mozzarella', price: 16.5, description: '250 gr. Cartofi copți, mozzarella, sare.', aliases: ['Cartofi cu mozzarela'] },
  { name: 'Cartofi cu usturoi și parmezan', price: 17.5, description: '250 gr. Cartofi prăjiți, usturoi, parmezan, sare, pătrunjel.' },

  { name: 'Pizza La Taifas', price: 46, description: '650 gr. Blat de pizza, sos de pizza, mozzarella, șuncă, salam, bacon, cabanos, telemea de vaci, sare, piper.', aliases: ['Pizza LA TAIFAS'] },
  { name: 'Pizza Capriciosa', price: 41, description: '650 gr. Blat de pizza, sos de pizza, mozzarella, șuncă, salam, ardei gras, ciuperci, sare, piper.' },
  { name: 'Pizza Quattro Stagioni', price: 41, description: '650 gr. Blat de pizza, sos de pizza, mozzarella, salam, ciuperci, măsline, ardei gras, sare, piper.', aliases: ['Pizza QUATRO STAGIONI'] },
  { name: 'Pizza Diavola', price: 41, description: '600 gr. Blat de pizza, sos pizza, mozzarella, salam picant, chilly, piper, sare.' },
  { name: 'Pizza Quattro Formaggio', price: 47, description: '600 gr. Blat de pizza, sos de pizza, mozzarella, gorgonzola, brânză ementaller, parmezan, sare, piper.', aliases: ['Pizza QUATRO FORMAGIO'] },
  { name: 'Pizza Prosciutto e Funghi', price: 47, description: '600 gr. Blat de pizza, sos de pizza, mozzarella, șuncă prosciutto, ciuperci, sare, piper.', aliases: ['Pizza PROSCIUTO E FUNGHI'] },
  { name: 'Pizza Bambino', price: 39, description: '600 gr. Blat de pizza, sos de pizza, mozzarella, șuncă, porumb, sare, piper.' },
  { name: 'Pizza Al Tono', price: 40, description: '650 gr. Blat de pizza, sos de pizza, mozzarella, ton, ceapă, măsline, porumb, sare, piper.', aliases: ['Pizza AL TONO'] },
  { name: 'Pizza Vegetariană', price: 37, description: '700 gr. Blat de pizza, sos de pizza, mozzarella vegană, ciuperci, roșii, ardei gras, măsline, porumb, sare, piper.', aliases: ['Pizza VEGETARIANA'] },
  { name: 'Pizza Salami', price: 42, description: '600 gr. Blat de pizza, mozzarella, pepperoni, sos pizza, sare, piper.' },
  { name: 'Pizza Pollo', price: 42, description: '650 gr. Blat de pizza, sos de pizza, mozzarella, gorgonzola, piept de pui, ardei roșu, porumb boabe, sare, piper.' },
  { name: 'Pizza cu creveți', price: 45, description: '650 gr. Blat de pizza, sos de pizza, mozzarella vegană, tofu, creveți, roșii, usturoi, busuioc, sare, piper.' },
  { name: 'Pizza Kebab', price: 46, description: '750 gr. Blat de pizza, sos, mozzarella, carne kebab pui, roșii, ceapă, salată iceberg, sos kebab, sare, piper.' },
  { name: 'Focaccia cu parmezan', price: 15, description: '320 gr. Blat pizza, parmezan, sare, piper.', aliases: ['Foccacia cu parmezan'] },
  { name: 'Focaccia cu ulei de măsline și oregano', price: 11, description: '290 gr. Blat pizza, oregano, ulei de măsline, sare, piper.', aliases: ['Foccacia cu ulei de măsline și oregano'] },
  { name: 'Pâine pe vatră', price: 5, description: '140 gr. Blat pizza, oregano, sare, piper.' },

  { name: 'Cheeseburger Meniu', price: 49, description: '450 gr/80 gr. Chiflă, carne de vită, castraveți murați, bacon, brânză cheddar, salată verde, roșii, ceapă roșie murată, sos Calipso, sos de usturoi, cartofi prăjiți.' },
  { name: 'Crispy Chicken Burger Meniu', price: 43, description: '400 gr/80 gr. Chiflă, pui crispy, ketchup, maioneză, salată, roșii, mozzarella, sare, piper, cartofi prăjiți.' },
  { name: 'La Taifas King Burger Meniu', price: 44, description: '450 gr/80 gr. Chiflă, plescoviță, bacon, ou, brânză cheddar, salată verde, roșii, sos Calipso, sare, piper, cartofi prăjiți.' },
  { name: 'Dublu Smash Burger Meniu', price: 49, description: '400 gr/80 gr. Chiflă, carne de vită, brânză cheddar, bacon, castraveți murați, sos roze, cartofi prăjiți, sare, piper.' },
  { name: 'Hamburger Meniu', price: 43, description: '450 gr/80 gr. Chiflă, carne de vită, mozzarella, salată verde, roșii, ceapă, castraveți murați, sos maioneză, cartofi prăjiți, sare, piper.' },

  { name: 'Wrap de pui', price: 32.5, description: '300 gr. Lipie, pui crispy, salată verde, roșii, castraveți, ceapă, sos de iaurt.' },
  { name: 'Wrap pollo', price: 28, description: '350 gr. Lipie, pui grill, mozzarella, salată verde, roșii, sos de maioneză.' },
  { name: 'Wrap prosciutto cotto', price: 25, description: '350 gr. Lipie, șuncă, mozzarella, roșii, salată verde, sos de maioneză.', aliases: ['Wrap prosciuto cotto'] },
  { name: 'Wrap cu ton', price: 28, description: '350 gr. Lipie, ton, mozzarella, salată verde, roșii, ceapă, măsline, porumb.' },
  { name: 'Wrap picant', price: 28, description: '350 gr. Lipie, salam picant, mozzarella, ardei gras, sos roșu, chilly, brânză cheddar.' },
  { name: 'Wrap vegan', price: 25, description: '350 gr. Lipie, tofu, roșii, castraveți, ardei gras, salată.' },

  { name: 'Panini kebab', price: 29.5, description: '600 gr. Panină, carne de pui rotisată, salată verde, cartofi prăjiți, castraveți murați, sos kebab, mozzarella.' },
  { name: 'Panini crispy', price: 35, description: '600 gr. Panină, pui crispy, mozzarella, roșii, salată verde, sos Taifas.' },
  { name: 'Panini cu carne de porc', price: 32, description: '600 gr. Panină, ceafă porc, brânză cheddar, salată verde, castraveți murați, sos roze.' },
  { name: 'Panini ready to go', price: 30, description: '600 gr. Panină, șuncă, mozzarella, salată verde, roșii, castraveți, sos de maioneză cu usturoi.', aliases: ['Panini ” ready to go”', 'Panini ready to go'] },

  { name: 'Penne Al forno', price: 42, description: '400 gr. Penne, ceapă, ardei, piept de pui, bacon, suc de roșii, Grand Cucina, mozzarella, parmezan.' },
  { name: 'Penne Arrabiata', price: 33, description: '400 gr. Penne, sos de roșii, ulei de măsline, parmezan.', aliases: ['Penne Arabiata'] },
  { name: 'Penne Quattro Formaggio', price: 54, description: '400 gr. Penne/spaghete, parmezan, gorgonzola, brânză Gouda, brânză Emental, Grand Cucina.' },
  { name: 'Spaghete Carbonara', price: 46, description: '400 gr. Spaghete, pancetta, parmezan, Grand Cucina, gălbenuș.' },
  { name: 'Spaghete Oglio e Olio', price: 34, description: '350 gr. Spaghete, ulei de măsline, usturoi, fulgi de ardei, parmezan, sare, piper alb.' },
  { name: 'Tagliatelle cu creveți', price: 48, description: '400 gr. Tagliatelle, creveți, parmezan, roșii, vin alb, usturoi, ulei de măsline, busuioc.' },
  { name: 'Tagliatelle cu pui și sos Alfredo', price: 42, description: '400 gr. Tagliatelle, piept de pui, parmezan, ulei de măsline, smântână dulce, usturoi.' },

  { name: 'Piept de pui la grătar', price: 32, description: '200 gr. Piept de pui, sare, piper, boia, ulei.' },
  { name: 'Ceafă la grătar', price: 33, description: '200 gr. Ceafă de porc, sare, piper, boia, ulei.' },
  { name: 'Mititei', price: 6, description: '50 gr. Mititei amestec. Doar în locație.' },
  { name: 'Mixt grill', price: 55, description: '550 gr. Piept de pui, mici, ceafă, cartofi prăjiți, muștar.' },
  { name: 'Meniu mititei', price: 31, description: '450 gr. Mititei 3 buc x 50 gr, cartofi prăjiți, pâine, muștar. Doar delivery.' },

  { name: 'Paste cu legume', price: 36, description: '350 gr. Penne, ciuperci, ardei gras, ceapă, dovlecei, sos de roșii, sare, piper.' },
  { name: 'Pizza vegetală', price: 37, description: '700 gr. Blat de pizza, sos de pizza, mozzarella vegană, ciuperci, roșii, ardei gras, măsline, porumb, sare, piper.' },
  { name: 'Tofu la grătar cu cartofi prăjiți și salată asortată', price: 41, description: '460 gr. Soia, cartofi prăjiți, salată, roșie, castraveți, ulei, sare.' },
  { name: 'Șnițel de soia cu cartofi wedges și salată asortată', price: 41, description: '540 gr. Soia, cartofi wedges, roșii, ulei, sare, piper.', aliases: ['Șnițel de soia cu cartofi wedgws și salată asortată'] },
  { name: 'Big sandwich de post', price: 30, description: '300 gr. Chiflă, roșie, salată verde, șnițel de soia, castravete, tofu, sare, piper.' },
  { name: 'Legume la grătar', price: 22, description: '250 gr. Vinete, dovlecei, ciuperci, ardei gras, roșii, ceapă roșie, sare.' },

  { name: 'Înghețată', price: 25, description: '150 gr. Înghețată 3 cupe, topping de ciocolată, roll steak.' },
  { name: 'Clătite cu brânză dulce și sos de vanilie', price: 29.5, description: '350 gr. Lapte, făină, ou, zahăr, brânză de vaci, stafide, Grand Cucina, zahăr vanilat.', aliases: ['Clatite cu brânză dulce și sos de vanilie'] },
  { name: 'Papanași', price: 32, description: '350 gr (2 buc). Lapte, ou, făină, smântână, brânză de vaci, dulceață, bicarbonat, sare.' },
  { name: 'Tartă cu lămâie', price: 28.5, description: '150 gr. Tartă cu lămâie, înghețată, frunze de mentă.', aliases: ['Tarta cu lămâie'] },
  { name: 'Cheesecake', price: 32, description: '200 gr. Cheesecake, sos de fructe de pădure, mentă.' },

  { name: 'Sos dulce', price: 4.5, description: '50 gr. Roșii pasate, oregano, cimbru, ulei de măsline, zahăr, sare.', aliases: ['Sos DULCE'] },
  { name: 'Sos picant', price: 4.5, description: '50 gr. Roșii pasate, oregano, cimbru, ulei de măsline, zahăr, fulgi de chilly, sare.', aliases: ['Sos PICANT'] },
  { name: 'Sos tzatziki', price: 6.5, description: '50 gr. Iaurt grecesc, castravete, mărar, sare, zeamă de lămâie, usturoi.', aliases: ['Sos TZATZIKI'] },
  { name: 'Sos La Taifas', price: 6.5, description: '50 gr. Iaurt grecesc, maioneză, Grand Cucina, ulei de măsline, mentă, usturoi, sare.', aliases: ['Sos LA TAIFAS'] },
  { name: 'Sos pizza', price: 6.5, description: '50 gr. Bulion roșii, ulei de măsline, cimbru, busuioc, oregano, usturoi granulat, sare, piper.', aliases: ['Sos PIZZA'] },
  { name: 'Sos Calypso roze', price: 7, description: '50 gr. Maioneză, ketchup, boia de ardei, cognac, sare.', aliases: ['Sos CALYPSO roze'] },
  { name: 'Sos de maioneză cu usturoi', price: 5.5, description: '50 gr. Maioneză, usturoi, oregano, zeamă lămâie, sare.', aliases: ['Sos de MAIONEZA cu usturoi'] },
  { name: 'Mujdei de usturoi', price: 5, description: '50 gr. Usturoi, ulei, zeamă lămâie, sare.' },
  { name: 'Muștar', price: 4, description: '50 gr.' },
  { name: 'Smântână', price: 5.5, description: '50 gr.' },
  { name: 'Ardei iuți', price: 2, description: '1 porție.', aliases: ['Ardei iute'] },

  { name: 'Tuborg 500 ml DZ', price: 13, description: 'Tuborg 500 ml doză.' },
  { name: 'Tuborg FA 500 ml DZ', price: 13, description: 'Tuborg fără alcool 500 ml doză.' },
  { name: 'Sprite 330 ml DZ', price: 11, description: 'Sprite 330 ml doză.' },
  { name: 'Coca-Cola 330 ml DZ', price: 11, description: 'Coca-Cola 330 ml doză.', aliases: ['Coca-cola 330 ml DZ'] },
  { name: 'Fanta 330 ml DZ', price: 11, description: 'Fanta 330 ml doză.' },
  { name: 'Apă minerală/plată 500 ml', price: 9, description: 'Apă minerală sau plată 500 ml.' },
  { name: 'Red Bull 0,250', price: 13, description: 'Red Bull 250 ml.' },
  { name: 'Vin Cabernet Sauvignon Castel Huniade 187 ml', price: 13, description: 'Vin Cabernet Sauvignon Castel Huniade 187 ml.' },
  { name: 'Vin roze demisec Castel Huniade 187 ml', price: 13, description: 'Vin roze demisec Castel Huniade 187 ml.', aliases: ['Vin roze demisec - Castel Huniade 187 ml'] },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST to update only existing Comanda Online products.',
    availableUpdates: updates.length,
  });
}

export async function POST() {
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, price, description');

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const updateMap = new Map<string, ProductUpdate>();
    for (const item of updates) {
      updateMap.set(normalizeName(item.name), item);
      for (const alias of item.aliases || []) {
        updateMap.set(normalizeName(alias), item);
      }
    }

    const updated: any[] = [];
    const skippedExisting: string[] = [];
    const errors: string[] = [];
    const matchedUpdateKeys = new Set<string>();

    for (const product of products || []) {
      const match = updateMap.get(normalizeName(product.name));
      if (!match) {
        skippedExisting.push(product.name);
        continue;
      }

      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ price: match.price, description: match.description })
        .eq('id', product.id);

      if (updateError) {
        errors.push(`${product.name}: ${updateError.message}`);
      } else {
        updated.push({ name: product.name, price: match.price });
        matchedUpdateKeys.add(normalizeName(match.name));
      }
    }

    const notFoundInProducts = updates
      .filter((item) => !matchedUpdateKeys.has(normalizeName(item.name)))
      .map((item) => item.name);

    return NextResponse.json({
      success: true,
      updatedCount: updated.length,
      skippedExistingCount: skippedExisting.length,
      notFoundInProductsCount: notFoundInProducts.length,
      errorsCount: errors.length,
      updated,
      skippedExisting,
      notFoundInProducts,
      errors,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
