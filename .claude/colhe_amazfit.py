# -*- coding: utf-8 -*-
"""Extrai a ficha tecnica das paginas de produto da Amazfit Brasil.

A ficha esta no HTML da pagina, na secao "Especificacoes Tecnicas" — nao no
/products/<handle>.js, que devolve so texto de marketing.

A secao vem em portugues em alguns produtos e em ingles em outros, mas o
formato e sempre o mesmo: uma linha que termina em ":" e o rotulo, e as
linhas seguintes, ate o proximo rotulo, sao o valor.
"""
import re, sys, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9"}

# Secoes conhecidas: servem de cabecalho, nao de rotulo.
SECOES = {"design", "display", "bateria", "battery", "sensors", "sensores",
          "pulseira", "strap", "conectividade", "recursos esportivos",
          "especificações técnicas", "especificacoes tecnicas",
          "conteúdo da embalagem, dispositivos compatíveis e aplicativo"}


def txt(h):
    h = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", h, flags=re.S | re.I)
    h = re.sub(r"&nbsp;", " ", h)
    return re.sub(r"[ \t]+", " ", re.sub(r"<[^>]+>", "\n", h))


def ficha(handle):
    u = "https://br.amazfit.com/products/" + handle
    h = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=45).read().decode("utf-8", "ignore")
    t = txt(h)
    i = t.find("Especificações Técnicas")
    if i < 0:
        i = t.find("Especificações")
    if i < 0:
        return u, []
    linhas = [l.strip() for l in t[i:i + 8000].split("\n") if l.strip()]
    pares, rotulo, valor = [], None, []
    for l in linhas:
        limpo = re.sub(r"[¹²³⁴⁵⁶⁷⁸⁹⁰]+", "", l).strip()
        if limpo.lower().rstrip(":") in SECOES:
            if rotulo and valor:
                pares.append((rotulo, " / ".join(valor)))
            rotulo, valor = None, []
            continue
        if limpo.endswith(":"):
            if rotulo and valor:
                pares.append((rotulo, " / ".join(valor)))
            rotulo, valor = limpo.rstrip(":"), []
        elif rotulo:
            if len(valor) < 4:
                valor.append(limpo)
    if rotulo and valor:
        pares.append((rotulo, " / ".join(valor)))
    return u, pares


for handle in sys.argv[1:]:
    try:
        u, f = ficha(handle)
    except Exception as e:
        print("== %s  ERRO %s" % (handle, str(e)[:60]))
        continue
    print("== %s" % handle)
    print("   %s" % u)
    for r, v in f[:26]:
        print("     %-34s %s" % (r[:34], v[:76]))
    print()
