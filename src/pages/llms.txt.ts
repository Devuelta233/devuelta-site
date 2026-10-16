// Résumé du site pour les assistants IA (format llms.txt, en Markdown).
import type { APIRoute } from 'astro';
import { SITE_URL } from '../config';
import { guides } from '../data';
import { SITUATIONS_ORDRE, SITUATIONS_TEXTE } from '../i18n/situations';
import { guidePath, page, situationPath } from '../i18n/routes';
import { LANGS } from '../../shared/vocab';

export const GET: APIRoute = () => {
  const l: string[] = [];
  l.push('# Devuelta');
  l.push('');
  l.push(
    '> Devuelta helps people get unwanted personal content removed from the internet (intimate images shared without consent, deepfakes, fake profiles, hacked accounts, fake reviews, defamation, exposed personal data, reused photos) through legal means only. Free self-help guides and diagnostic in French, Spanish and English; a human-reviewed paid service when self-help is not enough (from €40 for one link: half to start, the rest only if the content is removed; half price in Africa and Latin America; business use at double price). No trackers, no cookies.',
  );
  l.push('');
  l.push('Every remedy page cites the law, the official source link and the date it was last checked. Devuelta does not give legal advice and never promises guaranteed removal. Minors are directed to official free services (e.g. Take It Down by NCMEC).');
  l.push('');
  l.push(`Open dataset of remedies (CC BY 4.0): ${SITE_URL}/referentiel.json`);
  for (const lang of LANGS) {
    const nom = { fr: 'Français', es: 'Español', en: 'English' }[lang];
    l.push('');
    l.push(`## ${nom}`);
    l.push('');
    l.push(`- [Diagnostic](${SITE_URL}${page('diagnostic', lang)})`);
    l.push(`- [Urgent help / helplines](${SITE_URL}${page('urgence', lang)})`);
    for (const s of SITUATIONS_ORDRE) l.push(`- [${SITUATIONS_TEXTE[s][lang].h1}](${SITE_URL}${situationPath(s, lang)})`);
    for (const g of guides()) l.push(`- [${g.titre[lang]}](${SITE_URL}${guidePath(g.slug[lang], lang)})`);
    l.push(`- [${{ fr: 'Méthode', es: 'Método', en: 'How we work' }[lang]}](${SITE_URL}${page('methode', lang)})`);
    l.push(`- [${{ fr: 'Tarifs', es: 'Precios', en: 'Pricing' }[lang]}](${SITE_URL}${page('tarifs', lang)})`);
    l.push(`- [Contact](${SITE_URL}${page('contact', lang)})`);
  }
  l.push('');
  return new Response(l.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
