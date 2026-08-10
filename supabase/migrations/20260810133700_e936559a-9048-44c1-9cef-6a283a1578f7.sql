UPDATE public.content_translations 
SET translated_text = CASE 
  WHEN id = '83e3a551-4682-4026-8e70-21368f06a9a4' THEN 'C''est un honneur de vous accueillir dans notre communauté. Depuis plus d''une décennie, les CCGMs sont un deuxième foyer — un endroit où les familles se soutiennent mutuellement, où notre culture est célébrée et où chaque membre a une voix.'
  WHEN id = 'a036d5cb-6dad-4c8c-8ef9-1ccb98a97882' THEN 'Chers membres et amis des CCGMs,'
  WHEN id = '3b6e3d08-b5df-40ca-9ba6-79f9d72b947d' THEN 'Dirige le comité exécutif et représente les CCGMs auprès des organisations partenaires.'
END
WHERE id IN ('83e3a551-4682-4026-8e70-21368f06a9a4', 'a036d5cb-6dad-4c8c-8ef9-1ccb98a97882', '3b6e3d08-b5df-40ca-9ba6-79f9d72b947d');