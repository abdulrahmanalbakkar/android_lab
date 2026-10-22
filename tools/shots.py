import sys, asyncio
from playwright.async_api import async_playwright
import os
site=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")); out=sys.argv[1]; ids=sys.argv[2:]
# Usage: STEPS=4 python3 tools/shots.py <outdir> <track.lesson> [...]: screenshots each demo at 1280 light and 400 dark.
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,sch in [(1280,'light'),(400,'dark')]:
      ctx=await b.new_context(viewport={"width":w,"height":900},color_scheme=sch)
      await ctx.route("**/fonts.*/**", lambda r: r.abort())
      for i in ids:
        pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)))
        await pg.goto(f"file://{site}/index.html#{i}"); await pg.wait_for_selector('article.lesson',timeout=8000); await pg.wait_for_timeout(300)
        pk=await pg.query_selector('.bench .ui-pick')
        if pk: await pk.click()
        n=int(sys.argv[0] and 3)
        for k in range(int(__import__('os').environ.get('STEPS','3'))):
          nx=await pg.query_selector('.bench .ui-ctl-btn[aria-label="Next step"]')
          if nx and await nx.is_enabled(): await nx.click(); await pg.wait_for_timeout(250)
        await pg.wait_for_timeout(600)
        bench=await pg.query_selector('.bench')
        await bench.screenshot(path=f"{out}/{w}-{i}.png")
        sw=await pg.evaluate("document.documentElement.scrollWidth")
        print(w,i,'width',sw,'errs',errs)
        await pg.close()
      await ctx.close()
    await b.close()
asyncio.run(main())
