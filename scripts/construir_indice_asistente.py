#!/usr/bin/env python3
"""Genera assets/asistente/indice.js (índice de búsqueda del asistente) a partir de las páginas HTML.
Uso (desde la raíz del proyecto):  python3 scripts/construir_indice_asistente.py
Requiere: pip install beautifulsoup4 lxml. Vuelve a ejecutarlo cada vez que cambies contenidos."""
import glob, json, os, re, sys, datetime, collections
from bs4 import BeautifulSoup

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)
EXCLUIR_CLASES = ['bi', 'author-box', 'rel', 'cf-slot', 'lector', 'cc', 'a11y-root', 'skip', 'chip-list']
MAX_CHUNK = 480

def tipo(p):
    if p == 'index.html': return 'Portada'
    if p.startswith('Sanitario-Administrativo/'): return 'CV sanitario'
    if p.startswith('docencia/'): return 'Docencia'
    if p.startswith('rutas-del-alma/'): return 'Rutas del Alma'
    if p.startswith('blog/') and p.count('/') == 2: return 'Blog'
    return None  # índice del blog, temas, etc.: listados duplicados

def limpiar(t): return re.sub(r'\s+', ' ', t).strip()

def paginas():
    for p in sorted(glob.glob('**/*.html', recursive=True)):
        b = os.path.basename(p)
        if p.startswith(('_desarrollo', 'accesibilidad', 'docs', 'node_modules')) or b.startswith('google') or re.fullmatch(r'\d{3}\.html', b) or b == '404.html': continue
        if tipo(p): yield p

def construir():
    pags, chunks, vistos = [], [], collections.Counter()
    crudos = []
    for p in paginas():
        so = BeautifulSoup(open(p, encoding='utf8', errors='replace').read(), 'lxml')
        titulo = limpiar((so.title.string if so.title and so.title.string else p)).split('|')[0].strip()
        d = so.find('meta', attrs={'name': 'description'}); desc = limpiar(d['content']) if d and d.get('content') else ''
        for t in so(['script', 'style', 'noscript', 'nav', 'footer', 'svg', 'form', 'header', 'button', 'aside', 'select']): t.decompose()
        for c in EXCLUIR_CLASES:
            for t in so.select('.' + c): t.decompose()
        main = so.find('main') or so.body
        if not main: continue
        url = p[:-len('index.html')] if p.endswith('index.html') else p
        titulo = {'Portada': 'Portada · perfil profesional', 'CV sanitario': 'CV sanitario-administrativo', 'Docencia': 'CV de docencia'}.get(tipo(p), titulo)
        idx = len(pags); pags.append({'t': titulo, 'u': url, 'k': tipo(p), 'd': desc})
        enc, anc, buf = titulo, '', ''
        def vaciar():
            nonlocal buf
            if len(buf) > 40: crudos.append([idx, buf.strip(), enc, anc])
            buf = ''
        for el in main.find_all(['h1', 'h2', 'h3', 'h4', 'p', 'li', 'blockquote', 'td']):
            if el.name in ('li', 'p', 'blockquote') and el.find(['p', 'li']) and el.name != 'p': continue
            tx = limpiar(el.get_text(' ', strip=True))
            if not tx: continue
            if el.name in ('h1', 'h2', 'h3', 'h4'):
                vaciar(); enc = tx[:120]
                a = el.get('id') or next((x.get('id') for x in el.parents if getattr(x, 'get', None) and x.get('id')), '')
                anc = a or ''
                continue
            if len(buf) + len(tx) > MAX_CHUNK: vaciar()
            buf += tx + ' '
        vaciar()
    for c in crudos: vistos[c[1]] += 1
    chunks = [c for c in crudos if vistos[c[1]] < 3]  # fuera el texto repetido (cajas de autora, pies…)
    # cursos del catálogo
    cursos = []
    src = 'assets/catalogo/catalogo-datos.js'
    if os.path.exists(src):
        h = open(src, encoding='utf8').read()
        m = re.search(r'CATALOGO_FORMACION_HTML=(".*");', h, re.S)
        so = BeautifulSoup(json.loads(m.group(1)), 'lxml')
        for g in so.select('details.cf__grp'):
            nom = limpiar(g.find('summary').get_text(' ', strip=True)).split('·')[0].strip()
            for li in g.select('li'):
                cursos.append([limpiar(li.select_one('.cf__cn').get_text(' ', strip=True)), limpiar(li.select_one('.cf__ce').get_text(' ', strip=True)), limpiar(li.select_one('.cf__ch').get_text(' ', strip=True)), limpiar(li.select_one('.cf__cy').get_text(' ', strip=True)), nom])
    return {'v': 1, 'fecha': datetime.date.today().isoformat(), 'paginas': pags, 'chunks': chunks, 'cursos': cursos}

if __name__ == '__main__':
    i = construir()
    out = 'assets/asistente/indice.js'
    open(out, 'w', encoding='utf8').write('/* Índice de búsqueda del asistente (generado por scripts/construir_indice_asistente.py) */\nwindow.ASISTENTE_INDICE=' + json.dumps(i, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f'{len(i["paginas"])} páginas · {len(i["chunks"])} fragmentos · {len(i["cursos"])} cursos · {os.path.getsize(out)//1024} KB')
