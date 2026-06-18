import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bookmark, Check, Copy, Info, MousePointerClick } from "lucide-react";

const TOOL_DETECTION: { match: string; tool: string }[] = [
  { match: "chatgpt.com / chat.openai.com", tool: "ChatGPT" },
  { match: "claude.ai", tool: "Claude" },
  { match: "gemini.google.com", tool: "Gemini" },
  { match: "perplexity.ai", tool: "Perplexity" },
  { match: "copilot.microsoft.com / bing.com", tool: "Copilot" },
  { match: "grok.com / x.ai", tool: "Grok" },
];

function buildBookmarklet(base: string): string {
  return (
    `javascript:(function(){` +
    `var T=${JSON.stringify(base)};` +
    `var h=location.hostname,m=[[/chatgpt|openai/,"ChatGPT"],[/claude\\.ai/,"Claude"],[/gemini\\.google/,"Gemini"],[/perplexity/,"Perplexity"],[/copilot\\.microsoft|bing\\.com/,"Copilot"],[/grok|x\\.ai/,"Grok"]],t="";` +
    `for(var i=0;i<m.length;i++){if(m[i][0].test(h)){t=m[i][1];break;}}` +
    `var D=document,ID="aiit-ql",o=D.getElementById(ID);if(o){o.remove();}` +
    `var b=D.createElement("div");b.id=ID;b.style.cssText="all:initial;position:fixed;top:16px;right:16px;z-index:2147483647;font-family:system-ui,-apple-system,sans-serif;background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 10px 30px rgba(15,23,42,.18);padding:16px;width:264px";` +
    `function mk(g,c,x){var e=D.createElement(g);if(c){e.style.cssText=c;}if(x!=null){e.textContent=x;}return e;}` +
    `b.appendChild(mk("div","font-weight:600;font-size:14px;margin-bottom:2px",t?("Log "+t+" session"):"Log AI session"));` +
    `b.appendChild(mk("div","font-size:11px;color:#64748b;margin-bottom:6px","AI Impact Tracker"));` +
    `var lab="display:block;font-size:11px;color:#64748b;margin:8px 0 2px";var inp="width:100%;box-sizing:border-box;font-size:13px;padding:6px 8px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#0f172a";` +
    `b.appendChild(mk("label",lab,"Duration (minutes)"));var dur=mk("input",inp);dur.type="number";dur.min="1";dur.value="15";b.appendChild(dur);` +
    `b.appendChild(mk("label",lab,"Complexity"));var cx=mk("select",inp);[["low","Low"],["medium","Medium"],["high","High"]].forEach(function(p){var op=D.createElement("option");op.value=p[0];op.textContent=p[1];if(p[0]==="medium"){op.selected=true;}cx.appendChild(op);});b.appendChild(cx);` +
    `var row=mk("div","display:flex;gap:8px;margin-top:12px");var go=mk("button","flex:1;font-size:13px;font-weight:600;padding:7px;border:0;border-radius:8px;background:#10b981;color:#fff;cursor:pointer","Open in Tracker");var cn=mk("button","font-size:13px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#0f172a;cursor:pointer","Cancel");row.appendChild(go);row.appendChild(cn);b.appendChild(row);` +
    `go.addEventListener("click",function(){var u=T+"/log?from=bookmarklet&duration="+encodeURIComponent(dur.value||"15")+"&complexity="+encodeURIComponent(cx.value);if(t){u+="&tool="+encodeURIComponent(t);}window.open(u,"_blank");b.remove();});` +
    `cn.addEventListener("click",function(){b.remove();});` +
    `D.body.appendChild(b);` +
    `})();`
  );
}

export default function BookmarkletPage() {
  const base = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}`;
  const bookmarklet = buildBookmarklet(base);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    linkRef.current?.setAttribute("href", bookmarklet);
  }, [bookmarklet]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bookmarklet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-10 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quick-Log Bookmarklet</h1>
        <p className="text-lg text-muted-foreground">
          Log an AI session from whatever page you're on — no need to open a new tab and start
          from scratch.
        </p>
      </header>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bookmark className="h-4 w-4 text-primary" />
            Drag this button to your bookmarks bar
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              ref={linkRef}
              draggable
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm cursor-grab active:cursor-grabbing select-none"
              title="Drag me to your bookmarks bar"
            >
              <Bookmark className="h-4 w-4" />
              Quick-Log AI
            </a>
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy code"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Clicking it here won't install it — bookmarklets have to be <em>dragged</em> onto your
            bookmarks bar (or added as a new bookmark whose URL is the copied code).
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MousePointerClick className="h-5 w-5 text-muted-foreground" />
          How to install
        </h2>
        <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-5">
          <li>
            Make sure your browser's bookmarks bar is visible
            (<span className="font-mono text-xs">Ctrl/Cmd + Shift + B</span> in most browsers).
          </li>
          <li>
            Drag the green <span className="font-medium text-foreground">Quick-Log AI</span> button
            above onto the bookmarks bar. If dragging isn't possible, copy the code and create a new
            bookmark whose URL is the pasted code.
          </li>
          <li>
            When you finish an AI session, click the bookmark. A small panel opens in the corner of
            the page you're on.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-5">
          <li>
            It detects which AI tool you're on from the page address and pre-fills the tool name.
          </li>
          <li>You set the duration and complexity in the panel and click "Open in Tracker."</li>
          <li>
            The Tracker opens with the log form already filled in — you review it and save. Nothing
            is logged until you confirm.
          </li>
        </ol>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-2 px-4 font-medium">When you're on…</th>
                <th className="text-left py-2 px-4 font-medium">It pre-fills</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {TOOL_DETECTION.map((row, i) => (
                <tr key={row.tool} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                  <td className="py-2 px-4 font-mono text-xs">{row.match}</td>
                  <td className="py-2 px-4">{row.tool}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          On any other site, the panel still opens — you'll just pick the tool yourself in the
          Tracker.
        </p>
      </section>

      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">It's a logging shortcut, not auto-tracking.</p>
          <p>
            The bookmarklet only runs when you click it, only reads the site's address to guess the
            tool, and never watches your activity or reads your conversation. You always confirm the
            log yourself. (See{" "}
            <Link href="/methodology#why-no-autopilot" className="underline hover:text-foreground">
              Why we don't auto-track
            </Link>
            .)
          </p>
          <p>
            Some sites with strict security settings may block bookmarklets. If it doesn't open,
            use the{" "}
            <Link href="/import" className="underline hover:text-foreground">
              Import from an AI session
            </Link>{" "}
            page instead.
          </p>
        </AlertDescription>
      </Alert>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">The code</h2>
        <p className="text-sm text-muted-foreground">
          The bookmarklet is just this short, readable snippet — no tracking, no external calls.
        </p>
        <pre className="p-4 bg-slate-950 text-emerald-400 rounded-md font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
          {bookmarklet}
        </pre>
      </section>
    </div>
  );
}
