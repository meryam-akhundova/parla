-- Let learners opt into swear / strong-profanity content (default: off).
alter table public.profiles
  add column if not exists include_swear_words boolean not null default false;

-- Tag slang entries that are swear words or strong profanity.
alter table public.slang_words
  add column if not exists is_swear boolean not null default false;

-- Mark known swear / strong-profanity rows (idempotent).
update public.slang_words
set is_swear = true
where is_swear = false
  and (
    lower(word) in (
      -- french
      'chiant',
      'putain',
      'merde',
      'bordel',
      'connard',
      'salope',
      'enculé',
      'encule',
      'foutre',
      'nique',
      -- spanish
      'cabrón',
      'cabron',
      'joder',
      'mierda',
      'puta',
      'coño',
      'cono',
      'carajo',
      'pendejo',
      'chingar',
      'verga',
      'pinche',
      'hijo de puta',
      -- turkish
      'orospu çocuğu',
      'orospu cocugu',
      'amk',
      'aq',
      'siktir',
      'siktir git',
      'hassiktir',
      'yarrak',
      'göt',
      'got',
      'piç',
      'pic',
      'sikeyim',
      'amına koyayım',
      'amina koyayim',
      -- azerbaijani
      'siktir',
      'göt'
    )
    or cultural_note ilike '%vulgar%'
    or cultural_note ilike '%swear%'
    or cultural_note ilike '%profan%'
    or cultural_note ilike '%küfür%'
  );
