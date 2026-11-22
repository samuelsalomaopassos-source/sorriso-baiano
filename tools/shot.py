import sys, asyncio
from playwright.async_api import async_playwright
# uso: shot.py url out.png [w h] [js]
async def main():
    url,out=sys.argv[1],sys.argv[2]
    w=int(sys.argv[3]) if len(sys.argv)>3 else 1400; h=int(sys.argv[4]) if len(sys.argv)>4 else 1000
    js=sys.argv[5] if len(sys.argv)>5 else None
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        pg=await b.new_page(viewport={"width":w,"height":h},device_scale_factor=1)
        msgs=[]
        pg.on("console",lambda m: msgs.append(f"{m.type}: {m.text}"))
        pg.on("pageerror",lambda e: msgs.append(f"PAGEERROR: {e}"))
        await pg.goto(url); await pg.wait_for_timeout(1200)
        if js: await pg.evaluate(js); await pg.wait_for_timeout(1500)
        full = "--full" in sys.argv
        await pg.screenshot(path=out, full_page=full)
        for m in msgs: print(m)
        await b.close()
asyncio.run(main())
