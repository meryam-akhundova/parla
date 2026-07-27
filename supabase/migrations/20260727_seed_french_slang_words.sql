-- Seed French slang_words (run in Supabase SQL Editor or via supabase db query --linked)
-- Idempotent: skips words that already exist for language = 'french'

insert into public.slang_words (
  word, romanization, meaning,
  example_message, example_translation,
  vibe_friends, vibe_strangers, vibe_formal,
  category, dialect, language,
  similar_words, cultural_note
)
select * from (values
  (
    'mdr',
    'em-deh-air',
    'lol / dying laughing',
    'mdr t''as vu sa tête franchement',
    'lol did you see his face honestly',
    'good', 'good', 'avoid',
    'contraction', 'general', 'french',
    array['ptdr', 'lol', 'jpp']::text[],
    'stands for ''mort de rire'', it''s the default lol in texts, way more common than ''lol'' itself among french speakers'
  ),
  (
    'ptdr',
    'peh-teh-deh-air',
    'dying of laughter (stronger than mdr)',
    'ptdrrr il est tombé devant tout le monde',
    'lmaooo he fell in front of everyone',
    'good', 'good', 'avoid',
    'contraction', 'general', 'french',
    array['mdr', 'jpp', 'xptdr']::text[],
    'short for ''pété de rire'', used when something''s actually funny, not just mildly amusing like a polite mdr'
  ),
  (
    'jpp',
    'zhee-peh-peh',
    'I can''t anymore / I''m done',
    'jpp avec ce mec il est trop lourd',
    'i can''t with this guy he''s so annoying',
    'good', 'caution', 'avoid',
    'contraction', 'general', 'french',
    array['mdr', 'grave', 'chelou']::text[],
    'short for ''j''peux plus'', works for both exasperation and dying laughing, context tells you which'
  ),
  (
    'grave',
    'grahv',
    'totally / for real',
    't''as trop bien géré grave',
    'you handled that so well for real',
    'good', 'good', 'avoid',
    'slang', 'general', 'french',
    array['trop', 'carrément', 'grave stylé']::text[],
    'used as an intensifier or standalone agreement like ''so true'', doesn''t mean ''serious'' here at all'
  ),
  (
    'chelou',
    'shuh-loo',
    'weird / sketchy',
    'il m''a envoyé un message chelou hier soir',
    'he sent me a weird message last night',
    'good', 'caution', 'avoid',
    'slang', 'general', 'french',
    array['louche', 'space', 'bizarre']::text[],
    'verlan (backslang) of ''louche'', extremely common, used for people, situations, or vibes that feel off'
  ),
  (
    'wesh',
    'wesh',
    'yo / hey (also expresses shock)',
    'wesh tu fais quoi ce soir',
    'yo what are you doing tonight',
    'good', 'caution', 'avoid',
    'reaction', 'general', 'french',
    array['yo', 'vas-y', 'sérieux']::text[],
    'banlieue-rooted greeting/exclamation now used nationwide by young people, can sound try-hard from non-native speakers with older strangers'
  ),
  (
    'vas-y',
    'vah-zee',
    'go ahead / come on',
    'vas-y raconte, j''écoute',
    'go on tell me, i''m listening',
    'good', 'good', 'caution',
    'filler', 'general', 'french',
    array['allez', 'vas-y quoi', 'grave']::text[],
    'used constantly as encouragement or to hurry someone along, also works to mean ''seriously?!'' with the right tone'
  ),
  (
    'bref',
    'brehf',
    'anyway / long story short',
    'bref j''ai raté mon bus ce matin',
    'anyway i missed my bus this morning',
    'good', 'good', 'good',
    'filler', 'general', 'french',
    array['enfin', 'voilà', 'du coup']::text[],
    'great transition word to wrap up a rant or skip details, works in nearly every setting'
  ),
  (
    'du coup',
    'doo koo',
    'so / as a result',
    'il pleut du coup je reste chez moi',
    'it''s raining so i''m staying home',
    'good', 'good', 'caution',
    'filler', 'general', 'french',
    array['donc', 'bref', 'voilà']::text[],
    'insanely overused filler that native speakers drop into almost every sentence, learners who use it well sound very natural'
  ),
  (
    'je capte pas',
    'zhuh kapt pah',
    'I don''t get it',
    'je capte pas pourquoi il a fait ça',
    'i don''t get why he did that',
    'good', 'good', 'avoid',
    'expression', 'general', 'french',
    array['je pige pas', 'chelou', 'sérieux']::text[],
    'casual version of ''je ne comprends pas'', ''capter'' literally means to pick up a signal like a phone antenna'
  ),
  (
    'ouf',
    'oof',
    'crazy / insane',
    'le concert était ouf hier',
    'the concert was insane yesterday',
    'good', 'good', 'avoid',
    'slang', 'general', 'french',
    array['dingue', 'de fou', 'chelou']::text[],
    'verlan for ''fou'' (crazy), can be good-crazy or bad-crazy depending on tone, universally understood'
  ),
  (
    'de fou',
    'duh foo',
    'insanely / so much',
    'ce resto est bon de fou',
    'this restaurant is insanely good',
    'good', 'good', 'avoid',
    'slang', 'general', 'french',
    array['ouf', 'grave', 'trop']::text[],
    'tacked onto the end of an adjective to crank up intensity, very trendy with younger speakers right now'
  ),
  (
    'nickel',
    'nee-kel',
    'perfect / great',
    'on se voit à 18h ? nickel',
    'we meet at 6pm? perfect',
    'good', 'good', 'good',
    'reaction', 'general', 'french',
    array['parfait', 'ça marche', 'top']::text[],
    'safe casual word for confirming plans, sounds friendly without being too slangy, works with almost anyone'
  ),
  (
    'ça marche',
    'sah marsh',
    'sounds good / deal',
    'je passe te chercher à 9h, ça marche ?',
    'i''ll pick you up at 9, sound good?',
    'good', 'good', 'good',
    'expression', 'general', 'french',
    array['nickel', 'ok', 'd''acc']::text[],
    'literally ''it works'', the go-to way to confirm plans in texts across every age group'
  ),
  (
    'd''acc',
    'dahk',
    'ok / alright',
    'd''acc je t''envoie l''adresse',
    'ok i''ll send you the address',
    'good', 'good', 'caution',
    'contraction', 'general', 'french',
    array['ok', 'ça marche', 'nickel']::text[],
    'shortened ''d''accord'', the standard quick-reply agreement in any chat'
  ),
  (
    'flemme',
    'flem',
    'can''t be bothered / too lazy',
    'j''ai la flemme de cuisiner ce soir',
    'i can''t be bothered to cook tonight',
    'good', 'caution', 'avoid',
    'slang', 'general', 'french',
    array['jpp', 'flemmard', 'chiant']::text[],
    '''avoir la flemme'' is one of the most-used phrases in daily french, basically a national personality trait'
  ),
  (
    'chiant',
    'shee-ahn',
    'annoying / boring as hell',
    'c''est chiant, le train est encore en retard',
    'so annoying, the train''s late again',
    'good', 'avoid', 'avoid',
    'slang', 'general', 'french',
    array['relou', 'flemme', 'jpp']::text[],
    'mildly vulgar (from ''chier''), totally normal between friends but skip it with strangers or elders'
  ),
  (
    'relou',
    'ruh-loo',
    'annoying / a pain',
    'arrête d''être relou stp',
    'stop being annoying please',
    'good', 'caution', 'avoid',
    'slang', 'general', 'french',
    array['chiant', 'lourd', 'chelou']::text[],
    'verlan for ''lourd'', softer and more playful than ''chiant'', very common with gen-z'
  ),
  (
    'stylé',
    'stee-leh',
    'cool / stylish',
    'ta nouvelle veste elle est stylée',
    'your new jacket is so cool',
    'good', 'good', 'caution',
    'slang', 'general', 'french',
    array['classe', 'ouf', 'de fou']::text[],
    'compliment word for anything impressive looking, from outfits to moves to plans, not just literal style'
  ),
  (
    'tkt',
    'teh-kah-teh',
    'don''t worry',
    'tkt je gère tout',
    'don''t worry i''ve got it all handled',
    'good', 'good', 'avoid',
    'contraction', 'general', 'french',
    array['t''inquiète', 'no stress', 'c''est bon']::text[],
    'texting abbreviation of ''t''inquiète'', typed constantly, sounds robotic if said out loud'
  ),
  (
    'c''est chaud',
    'seh show',
    'that''s tough / that''s risky',
    'il a un exam demain et il a rien révisé, c''est chaud',
    'he has an exam tomorrow and hasn''t studied, that''s rough',
    'good', 'caution', 'avoid',
    'expression', 'general', 'french',
    array['c''est relou', 'grave', 'ouf']::text[],
    'literally ''it''s hot'', but means a situation is intense, difficult, or dicey, used all the time in casual talk'
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
  where s.language = 'french'
    and s.word = v.word
);
