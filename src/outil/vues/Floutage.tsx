// Masquage d'une pièce d'identité, entièrement sur l'appareil : l'image n'est
// jamais envoyée au serveur. Rectangles opaques (un flou peut être inversé),
// mention facultative « copie pour … » en filigrane, export JPEG sans métadonnées.

import { useEffect, useRef, useState } from 'preact/hooks';
import { t, tr } from '../i18n';
import { Champ, valeur } from '../ui';

interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}

const COTE_MAX = 2400; // pixels : assez pour rester lisible, assez léger pour un e-mail

function normaliser(z: Zone): Zone {
  return { x: Math.min(z.x, z.x + z.w), y: Math.min(z.y, z.y + z.h), w: Math.abs(z.w), h: Math.abs(z.h) };
}

export function Floutage() {
  const toile = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [trace, setTrace] = useState<Zone | null>(null);
  const [mention, setMention] = useState('');
  const [erreur, setErreur] = useState('');
  const depart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = toile.current;
    if (!c || !image) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(image, 0, 0, c.width, c.height);
    if (mention.trim()) {
      const taille = Math.max(18, Math.round(c.width / 28));
      ctx.save();
      ctx.font = `600 ${taille}px sans-serif`;
      ctx.fillStyle = 'rgba(181, 80, 47, 0.38)';
      ctx.translate(c.width / 2, c.height / 2);
      ctx.rotate(-Math.atan2(c.height, c.width));
      const texte = mention.trim();
      const largeur = ctx.measureText(texte).width + taille * 2;
      const diag = Math.hypot(c.width, c.height);
      for (let y = -diag / 2; y < diag / 2; y += taille * 3) {
        for (let x = -diag / 2; x < diag / 2; x += largeur) ctx.fillText(texte, x, y);
      }
      ctx.restore();
    }
    ctx.fillStyle = '#000';
    for (const z of zones) ctx.fillRect(z.x, z.y, z.w, z.h);
    if (trace) {
      const z = normaliser(trace);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeStyle = '#C98A3E';
      ctx.lineWidth = Math.max(2, c.width / 400);
      ctx.strokeRect(z.x, z.y, z.w, z.h);
    }
  }, [image, zones, trace, mention]);

  function charger(e: Event) {
    setErreur('');
    const fichier = (e.target as HTMLInputElement).files?.[0];
    if (!fichier) return;
    if (!fichier.type.startsWith('image/')) {
      setErreur(tr('Choisissez une image (photo ou capture).', 'Elige una imagen (foto o captura).', 'Choose an image (photo or screenshot).'));
      return;
    }
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => {
      const r = Math.min(1, COTE_MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const c = toile.current;
      if (c) {
        c.width = Math.round(img.naturalWidth * r);
        c.height = Math.round(img.naturalHeight * r);
      }
      setZones([]);
      setImage(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setErreur(tr('Image illisible.', 'Imagen ilegible.', 'Unreadable image.'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function point(e: PointerEvent): { x: number; y: number } {
    const c = toile.current!;
    const r = c.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(c.width, ((e.clientX - r.left) * c.width) / r.width)),
      y: Math.max(0, Math.min(c.height, ((e.clientY - r.top) * c.height) / r.height)),
    };
  }

  function telecharger() {
    const c = toile.current;
    if (!c || !image) return;
    c.toBlob(
      (b) => {
        if (!b) return;
        const url = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'piece-masquee.jpg';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      },
      'image/jpeg',
      0.9,
    );
  }

  return (
    <div>
      <h1>{t('floutageTitre')}</h1>
      <p class="o-encadre o-info">{t('floutageAide')}</p>
      <div class="o-grille">
        <Champ label={t('choisirImage')}>
          <input type="file" accept="image/*" onChange={charger} />
        </Champ>
        <Champ
          label={tr('Mention en filigrane (facultatif)', 'Marca de agua (opcional)', 'Watermark text (optional)')}
          aide={tr('Ex. : « Copie pour Meta — 15/10/2026 ». Limite les réutilisations.', 'Ej.: «Copia para Meta — 15/10/2026». Limita reutilizaciones.', 'E.g. "Copy for Meta — 15/10/2026". Limits reuse.')}
        >
          <input type="text" maxLength={60} value={mention} onInput={(e) => setMention(valeur(e))} />
        </Champ>
      </div>
      {erreur && <p class="o-erreur">{erreur}</p>}
      <div class={`o-toile ${image ? '' : 'o-cache'}`}>
        <canvas
          ref={toile}
          onPointerDown={(e) => {
            if (!image) return;
            (e.target as Element).setPointerCapture(e.pointerId);
            depart.current = point(e);
            setTrace({ ...depart.current, w: 0, h: 0 });
          }}
          onPointerMove={(e) => {
            if (!depart.current) return;
            const p = point(e);
            setTrace({ x: depart.current.x, y: depart.current.y, w: p.x - depart.current.x, h: p.y - depart.current.y });
          }}
          onPointerUp={() => {
            if (trace) {
              const z = normaliser(trace);
              if (z.w > 3 && z.h > 3) setZones([...zones, z]);
            }
            depart.current = null;
            setTrace(null);
          }}
          onPointerCancel={() => {
            depart.current = null;
            setTrace(null);
          }}
        />
      </div>
      {image && (
        <>
          <p class="o-muet">{t('dessinerZones')}</p>
          <div class="o-actions">
            <button class="o-bouton" disabled={zones.length === 0} onClick={() => setZones(zones.slice(0, -1))}>
              {t('annulerZone')}
            </button>
            <button class="o-bouton o-principal" disabled={zones.length === 0} onClick={telecharger}>
              {t('telecharger')}
            </button>
          </div>
          <p class="o-muet">{t('verifierVisuellement')}</p>
        </>
      )}
    </div>
  );
}
