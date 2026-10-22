# Usage: python3 tools/check_track.py <site_dir> <track_id> [<track_id>...]
# Loads each lesson of the given tracks at 1280 light and 400 dark, clicks demo buttons,
# opens Under the hood, and reports script errors, horizontal overflow and missing challenges.
import sys, asyncio
from playwright.async_api import async_playwright
site, ids = sys.argv[1], sys.argv[2:]
base = f"file://{site}/index.html"
async def run(b, w, scheme):
    ctx = await b.new_context(viewport={"width": w, "height": 900}, color_scheme=scheme)
    await ctx.route("**/fonts.*/**", lambda r: r.abort())
    probs = []
    for tid in ids:
        pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(base + "#" + tid); await pg.wait_for_timeout(300)
        hrefs = await pg.evaluate("[...document.querySelectorAll('a')].map(a=>a.getAttribute('href')).filter(h=>h&&h.startsWith('#%s.'))" % tid)
        if not hrefs: probs.append(f"{tid}: track not found or no lessons")
        await pg.close()
        for h in sorted(set(hrefs)):
            pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(base + h); await pg.wait_for_timeout(250)
            if '.' in h:
                try: await pg.wait_for_selector('article.lesson', timeout=8000)
                except Exception: errs.append(h+': lesson did not load') if isinstance(errs, list) else None
            for btn in (await pg.query_selector_all(".bench .cmd, .step .cmd, .bench button, .step button"))[:20]:
                try: await btn.click(timeout=400)
                except Exception: pass
                await pg.wait_for_timeout(60)
            await pg.wait_for_timeout(800)
            await pg.evaluate("document.querySelectorAll('details.hood').forEach(d=>d.open=true)"); await pg.wait_for_timeout(200)
            sw = await pg.evaluate("document.documentElement.scrollWidth")
            nch = await pg.evaluate("document.querySelectorAll('.chal').length")
            if sw != w: probs.append(f"{w} {h}: page {sw}px wide")
            if nch != 2: probs.append(f"{w} {h}: {nch} challenges")
            for e in errs: probs.append(f"{w} {h}: {e}")
            await pg.close()
    await ctx.close()
    return probs
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        probs = await run(b, 1280, "light") + await run(b, 400, "dark")
        await b.close()
    print("\n".join(probs) if probs else "OK: no problems")
asyncio.run(main())
