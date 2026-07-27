-- Seed Spanish slang_words (run in Supabase SQL Editor or via supabase db query --linked)
-- Idempotent: skips words that already exist for language = 'spanish'

insert into public.slang_words (
  word, romanization, meaning,
  example_message, example_translation,
  vibe_friends, vibe_strangers, vibe_formal,
  category, dialect, language,
  similar_words, cultural_note
)
select * from (values
  (
    'qué onda',
    'keh OHN-dah',
    'what''s up / what''s going on',
    'qué onda, nos vemos hoy o qué?',
    'what''s up, are we meeting today or what?',
    'good', 'good', 'avoid',
    'expression', 'general', 'spanish',
    array['qué tal', 'qué pex', 'qué hay']::text[],
    'super common greeting especially in mexico and central america, less used in spain where ''qué tal'' is more typical'
  ),
  (
    'chido',
    'CHEE-doh',
    'cool / awesome',
    'me encantó tu depa, está bien chido',
    'i loved your apartment, it''s really cool',
    'good', 'good', 'avoid',
    'slang', 'general', 'spanish',
    array['padre', 'genial', 'chévere']::text[],
    'very mexican, equivalent to ''chévere'' in colombia/venezuela or ''guay'' in spain, learn the local version for wherever you''re texting'
  ),
  (
    'guay',
    'gwhy',
    'cool / nice',
    'qué guay que vengas este finde',
    'so cool that you''re coming this weekend',
    'good', 'good', 'avoid',
    'slang', 'general', 'spanish',
    array['chido', 'chévere', 'mola']::text[],
    'spain''s version of ''cool'', barely used outside spain, swap for ''chido'' or ''chévere'' in latin america'
  ),
  (
    'mola',
    'MOH-lah',
    'it''s cool / I like it',
    'mola mucho tu nuevo corte de pelo',
    'i really like your new haircut',
    'good', 'good', 'avoid',
    'slang', 'general', 'spanish',
    array['guay', 'chulo', 'genial']::text[],
    'from the verb ''molar'', spanish-specific, ''me mola'' = ''i''m into it/i like it'''
  ),
  (
    'chévere',
    'CHEH-veh-reh',
    'cool / great',
    'el plan de mañana está chévere',
    'tomorrow''s plan sounds great',
    'good', 'good', 'caution',
    'slang', 'general', 'spanish',
    array['chido', 'guay', 'bacano']::text[],
    'used across venezuela, colombia, ecuador and beyond, safe casual word that even sounds okay with new acquaintances'
  ),
  (
    'wey',
    'weh',
    'dude / bro',
    'wey ya llegué, dónde estás',
    'dude i''m already here, where are you',
    'good', 'avoid', 'avoid',
    'slang', 'general', 'spanish',
    array['güey', 'cabrón', 'mano']::text[],
    'mexican filler word for addressing friends, said constantly between close friends but never with strangers or elders'
  ),
  (
    'tío',
    'TEE-oh',
    'dude / guy',
    'tío no te vas a creer lo que pasó',
    'dude you''re not gonna believe what happened',
    'good', 'caution', 'avoid',
    'slang', 'general', 'spanish',
    array['tía', 'wey', 'colega']::text[],
    'spain''s version of ''dude'', literally means ''uncle'', tía for a girl, used constantly among friends there'
  ),
  (
    'vale',
    'VAH-leh',
    'okay / alright',
    'vale, nos vemos a las 8 entonces',
    'okay, see you at 8 then',
    'good', 'good', 'good',
    'filler', 'general', 'spanish',
    array['ok', 'vale vale', 'de acuerdo']::text[],
    'spain''s default ''ok'', used everywhere in every context, less common in latin america where ''ok'' or ''dale'' rules'
  ),
  (
    'dale',
    'DAH-leh',
    'okay / go for it',
    'dale, te espero afuera',
    'okay, i''ll wait for you outside',
    'good', 'good', 'caution',
    'filler', 'general', 'spanish',
    array['vale', 'ándale', 'va']::text[],
    'huge across argentina, colombia, venezuela and the caribbean, doubles as agreement and encouragement'
  ),
  (
    'jajaja',
    'hah-hah-hah',
    'haha / lol',
    'jajaja no puede ser lo que me contó',
    'haha i can''t believe what he told me',
    'good', 'good', 'caution',
    'reaction', 'general', 'spanish',
    array['jaja', 'xd', 'qepd de risa']::text[],
    'spanish laughs with j not h, more j''s = harder laugh, a lone ''ja'' can read as sarcastic or unimpressed'
  ),
  (
    'qepd de risa',
    'keh-eh-peh-deh deh REE-sah',
    'dying laughing',
    'qepd de risa con este meme',
    'dying laughing at this meme',
    'good', 'avoid', 'avoid',
    'expression', 'general', 'spanish',
    array['jajaja', 'muerto de risa', 'xd']::text[],
    'playful mashup of ''qepd'' (rest in peace) and ''de risa'', gen-z internet slang, mostly written not spoken'
  ),
  (
    'neta',
    'NEH-tah',
    'really? / seriously / the truth',
    'neta que ya no aguanto este calor',
    'seriously i can''t take this heat anymore',
    'good', 'caution', 'avoid',
    'slang', 'general', 'spanish',
    array['en serio', 'de verdad', 'qué onda']::text[],
    'very mexican, works as a question (''neta?'' = really?) or an intensifier (''la neta'' = the honest truth)'
  ),
  (
    'en serio',
    'en SEH-ree-oh',
    'seriously / for real',
    'en serio te vas mañana? no me dijiste nada',
    'you''re really leaving tomorrow? you didn''t tell me anything',
    'good', 'good', 'good',
    'expression', 'general', 'spanish',
    array['neta', 'de verdad', 'posta']::text[],
    'universal across all spanish-speaking countries, safe in any setting from texting friends to work chats'
  ),
  (
    'posta',
    'POH-stah',
    'for real / seriously (argentina)',
    'posta que ganamos el partido, no lo puedo creer',
    'we actually won the game for real, i can''t believe it',
    'good', 'caution', 'avoid',
    'slang', 'general', 'spanish',
    array['en serio', 'neta', 'posta posta']::text[],
    'argentine and uruguayan slang, doubling it (''posta posta'') adds even more emphasis'
  ),
  (
    'no manches',
    'noh MAHN-chess',
    'no way / you''re kidding',
    'no manches, te ganaste la lotería?',
    'no way, you won the lottery?',
    'good', 'caution', 'avoid',
    'reaction', 'general', 'spanish',
    array['no puede ser', 'no jodas', 'qué locura']::text[],
    'mexican expression of disbelief, polite version of a much ruder phrase, safe to use in most casual settings'
  ),
  (
    'está cañón',
    'es-TAH kah-NYOHN',
    'that''s intense / that''s tough',
    'el examen de mañana está bien cañón',
    'tomorrow''s exam is really tough',
    'good', 'caution', 'avoid',
    'expression', 'general', 'spanish',
    array['está cabrón', 'es fuerte', 'qué locura']::text[],
    'mexican, used for anything difficult, wild, or intense, from bad news to a hard workout'
  ),
  (
    'me da flojera',
    'meh dah floh-HEH-rah',
    'I can''t be bothered / too lazy',
    'me da flojera salir hoy, mejor otro día',
    'i can''t be bothered to go out today, better another day',
    'good', 'caution', 'avoid',
    'expression', 'general', 'spanish',
    array['flojera', 'pereza', 'hueva']::text[],
    'mexican and central american, ''me da hueva'' is the even more casual/blunt version among close friends'
  ),
  (
    'qué fuerte',
    'keh FWEHR-teh',
    'that''s crazy / that''s shocking',
    'qué fuerte lo que le pasó a tu vecino',
    'that''s so shocking what happened to your neighbor',
    'good', 'good', 'good',
    'reaction', 'general', 'spanish',
    array['qué locura', 'no puede ser', 'está cañón']::text[],
    'common in spain for reacting to shocking or intense news, works fine even in semi-formal chats'
  ),
  (
    'estoy muerto',
    'es-TOY MWEHR-toh',
    'I''m exhausted / I''m dead (tired or laughing)',
    'estoy muerto, trabajé 10 horas hoy',
    'i''m dead tired, i worked 10 hours today',
    'good', 'good', 'caution',
    'expression', 'general', 'spanish',
    array['reventado', 'muerto de risa', 'agotado']::text[],
    'used for extreme exhaustion or extreme laughter depending on context, universally understood'
  ),
  (
    'tremendo',
    'treh-MEN-doh',
    'huge / intense (good or bad)',
    'hicimos tremenda fiesta anoche',
    'we threw a huge party last night',
    'good', 'good', 'good',
    'slang', 'general', 'spanish',
    array['increíble', 'una locura', 'qué fuerte']::text[],
    'flexible intensifier used before nouns to hype something up, works across nearly all spanish-speaking regions'
  )
) as v(
  word, romanization, meaning,
  example_message, example_translation,
  vibe_friends, vibe_strangers, vibe_formal,
  category, dialect, language,
  similar_words, cultural_note
)
where not exists (
  select 1
  from public.slang_words s
  where s.language = 'spanish'
    and s.word = v.word
);
