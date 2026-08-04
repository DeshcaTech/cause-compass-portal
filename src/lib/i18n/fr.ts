import { common } from "./fr.common";
import { home } from "./fr.home";
import { about } from "./fr.about";
import { board } from "./fr.board";
import { news } from "./fr.news";
import { events } from "./fr.events";
import { membership } from "./fr.membership";
import { partners } from "./fr.partners";
import { gallery } from "./fr.gallery";
import { getinvolved } from "./fr.getinvolved";
import { contact } from "./fr.contact";
import { misc } from "./fr.misc";

/** English source string -> French translation. */
export const fr: Record<string, string> = {
  ...common,
  ...home,
  ...about,
  ...board,
  ...news,
  ...events,
  ...membership,
  ...partners,
  ...gallery,
  ...getinvolved,
  ...contact,
  ...misc,
};
