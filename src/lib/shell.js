/* A small, safe, in-memory Unix-like shell for lessons.
   Supports: pwd ls cd mkdir touch rm rmdir cat echo mv cp head tail wc grep find sort uniq
   tree history clear help man whoami date ps kill, quotes, *-globs, pipes (|) and > / >> redirects. */

const HOME = "/home/dev";

export function makeFS(seed) {
  const root = { type: "dir", children: {} };
  const sh = { root, cwd: HOME, history: [], procs: [{ pid: 4821, cmd: "node server.js" }, { pid: 4877, cmd: "npm run dev" }] };
  mkdirp(sh, "/home/dev");
  for (const [path, content] of Object.entries(seed || {})) {
    if (path.endsWith("/")) mkdirp(sh, abs(sh, path.slice(0, -1)));
    else { mkdirp(sh, parentOf(abs(sh, path))); writeFile(sh, abs(sh, path), content); }
  }
  return sh;
}

/* ── paths ── */
function abs(sh, p) {
  if (!p || p === "~") return HOME;
  if (p.startsWith("~/")) p = HOME + p.slice(1);
  const base = p.startsWith("/") ? [] : sh.cwd.split("/").filter(Boolean);
  for (const part of p.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") base.pop(); else base.push(part);
  }
  return "/" + base.join("/");
}
const parentOf = (p) => p.slice(0, p.lastIndexOf("/")) || "/";
const baseName = (p) => p.slice(p.lastIndexOf("/") + 1);
function node(sh, p) {
  let n = sh.root;
  for (const part of p.split("/").filter(Boolean)) {
    if (!n || n.type !== "dir") return null;
    n = n.children[part];
  }
  return n || null;
}
function mkdirp(sh, p) {
  let n = sh.root;
  for (const part of p.split("/").filter(Boolean)) {
    n.children[part] = n.children[part] || { type: "dir", children: {} };
    n = n.children[part];
  }
  return n;
}
function writeFile(sh, p, content, append) {
  const dir = node(sh, parentOf(p));
  if (!dir || dir.type !== "dir") throw new Error(`No such file or directory: ${p}`);
  const name = baseName(p);
  const ex = dir.children[name];
  if (ex && ex.type === "dir") throw new Error(`${name}: Is a directory`);
  dir.children[name] = { type: "file", content: append && ex ? ex.content + content : content };
}
export const display = (p) => (p === HOME ? "~" : p.startsWith(HOME + "/") ? "~" + p.slice(HOME.length) : p);

/* ── parsing ── */
function tokenize(line) {
  const out = []; let cur = "", q = null, quoted = false, has = false;
  for (const ch of line) {
    if (q) { if (ch === q) q = null; else cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; quoted = true; has = true; continue; }
    if (ch === " " || ch === "\t") { if (has) out.push({ v: cur, quoted }); cur = ""; quoted = false; has = false; continue; }
    cur += ch; has = true;
  }
  if (q) throw new Error("unexpected end of input: missing closing quote");
  if (has) out.push({ v: cur, quoted });
  return out;
}
function splitPipes(line) {
  const parts = []; let cur = "", q = null;
  for (const ch of line) {
    if (q) { if (ch === q) q = null; cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === "|") { parts.push(cur); cur = ""; continue; }
    cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim());
}
const globRe = (g) => new RegExp("^" + g.replace(/[.+^${}()[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
function expand(sh, tokens) {
  const out = [];
  for (const t of tokens) {
    if (t.quoted || !/[*?]/.test(t.v)) { out.push(t.v); continue; }
    const dirPath = t.v.includes("/") ? t.v.slice(0, t.v.lastIndexOf("/")) || "/" : ".";
    const pat = baseName(t.v);
    const dir = node(sh, abs(sh, dirPath));
    const hits = dir && dir.type === "dir" ? Object.keys(dir.children).filter((n) => !n.startsWith(".") && globRe(pat).test(n)).sort() : [];
    if (hits.length) hits.forEach((h) => out.push(dirPath === "." ? h : dirPath + "/" + h)); else out.push(t.v);
  }
  return out;
}
function flags(args) {
  const f = new Set(), rest = [];
  for (const a of args) {
    if (/^-[a-zA-Z]+$/.test(a)) [...a.slice(1)].forEach((c) => f.add(c)); else rest.push(a);
  }
  return [f, rest];
}

/* ── commands ── */
const HELP = `Commands: pwd, ls, cd, mkdir, touch, rm, rmdir, cat, echo, mv, cp,
head, tail, wc, grep, find, sort, uniq, tree, history, clear, whoami, date, ps, kill
Pipes:  cmd1 | cmd2        Redirect:  cmd > file  (overwrite)   cmd >> file  (append)
Tip: press ↑ for previous commands and Tab to complete names.`;
const MAN = {
  ls: "ls [-a] [-l] [path]  list directory contents. -a shows hidden files, -l long format",
  cd: "cd [path]  change directory. cd .. goes up, cd ~ goes home, cd - is not supported here",
  mkdir: "mkdir [-p] dir...  make directories. -p creates parents as needed",
  rm: "rm [-r] [-f] path...  remove files. -r removes directories recursively (careful!)",
  grep: "grep [-i] [-n] [-c] [-r] [-v] pattern [file...]  print lines matching a pattern",
  find: "find [path] [-name pattern] [-type f|d]  search for files in a directory tree",
  wc: "wc [-l] [-w] [-c] [file]  count lines, words and characters",
  head: "head [-n N] [file]  first N lines (default 10)", tail: "tail [-n N] [file]  last N lines (default 10)",
  cp: "cp [-r] source dest  copy files (-r for directories)", mv: "mv source dest  move or rename",
  echo: "echo text  print text. Combine with > or >> to write files", cat: "cat file...  print file contents",
  touch: "touch file...  create empty files (or update timestamps)", sort: "sort [-r] [-n]  sort lines", uniq: "uniq [-c]  collapse adjacent duplicate lines",
  kill: "kill PID  stop a running process (see ps)", ps: "ps  list running processes",
};
function readArg(sh, p, cmd) {
  const n = node(sh, abs(sh, p));
  if (!n) throw new Error(`${cmd}: ${p}: No such file or directory`);
  if (n.type === "dir") throw new Error(`${cmd}: ${p}: Is a directory`);
  return n.content;
}
const lines = (s) => (s === "" ? [] : s.replace(/\n$/, "").split("\n"));
function walk(n, path, fn) { fn(n, path); if (n.type === "dir") Object.keys(n.children).sort().forEach((k) => walk(n.children[k], path === "/" ? "/" + k : path + "/" + k, fn)); }
function clone(n) { return n.type === "file" ? { type: "file", content: n.content } : { type: "dir", children: Object.fromEntries(Object.entries(n.children).map(([k, v]) => [k, clone(v)])) }; }
function numFlag(args, def) {
  const i = args.indexOf("-n");
  if (i >= 0) { const n = parseInt(args[i + 1], 10); args.splice(i, 2); return isNaN(n) ? def : n; }
  const m = args.findIndex((a) => /^-\d+$/.test(a));
  if (m >= 0) { const n = -parseInt(args[m], 10); args.splice(m, 1); return n; }
  return def;
}

const CMDS = {
  pwd: (sh) => sh.cwd,
  whoami: () => "dev",
  date: () => new Date().toString(),
  help: () => HELP,
  man: (sh, a) => MAN[a[0]] || (a[0] ? `No manual entry for ${a[0]}` : "What manual page do you want? Try: man ls"),
  history: (sh) => sh.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join("\n"),
  ps: (sh) => ["  PID CMD", ...sh.procs.map((p) => `${String(p.pid).padStart(5)} ${p.cmd}`)].join("\n"),
  kill: (sh, a) => {
    const pid = parseInt(a.filter((x) => !x.startsWith("-"))[0], 10);
    const i = sh.procs.findIndex((p) => p.pid === pid);
    if (i < 0) throw new Error(`kill: (${a[0] || ""}) - No such process`);
    sh.procs.splice(i, 1); return "";
  },
  cd: (sh, a) => {
    const t = abs(sh, a[0] || "~"), n = node(sh, t);
    if (!n) throw new Error(`cd: ${a[0]}: No such file or directory`);
    if (n.type !== "dir") throw new Error(`cd: ${a[0]}: Not a directory`);
    sh.cwd = t; return "";
  },
  ls: (sh, args) => {
    const [f, rest] = flags(args);
    const targets = rest.length ? rest : ["."];
    return targets.map((p) => {
      const n = node(sh, abs(sh, p));
      if (!n) throw new Error(`ls: cannot access '${p}': No such file or directory`);
      if (n.type === "file") return p;
      const names = Object.keys(n.children).filter((k) => f.has("a") || !k.startsWith(".")).sort();
      const fmt = (k) => {
        const c = n.children[k], isDir = c.type === "dir";
        return f.has("l") ? `${isDir ? "drwxr-xr-x" : "-rw-r--r--"}  dev  ${String(isDir ? 4096 : c.content.length).padStart(5)}  ${k}${isDir ? "/" : ""}` : k + (isDir ? "/" : "");
      };
      const body = (f.has("a") ? (f.has("l") ? ["drwxr-xr-x  dev   4096  ./", "drwxr-xr-x  dev   4096  ../"] : ["./", "../"]) : []).concat(names.map(fmt));
      const txt = f.has("l") ? body.join("\n") : body.join("  ");
      return targets.length > 1 ? `${p}:\n${txt}` : txt;
    }).join("\n\n");
  },
  mkdir: (sh, args) => {
    const [f, rest] = flags(args);
    if (!rest.length) throw new Error("mkdir: missing operand");
    for (const p of rest) {
      const t = abs(sh, p);
      if (node(sh, t)) { if (!f.has("p")) throw new Error(`mkdir: cannot create directory '${p}': File exists`); continue; }
      if (!f.has("p") && !node(sh, parentOf(t))) throw new Error(`mkdir: cannot create directory '${p}': No such file or directory (try -p)`);
      mkdirp(sh, t);
    }
    return "";
  },
  touch: (sh, a) => { if (!a.length) throw new Error("touch: missing file operand"); a.forEach((p) => { const t = abs(sh, p); if (!node(sh, t)) writeFile(sh, t, ""); }); return ""; },
  rm: (sh, args) => {
    const [f, rest] = flags(args);
    if (!rest.length) throw new Error("rm: missing operand");
    for (const p of rest) {
      const t = abs(sh, p), n = node(sh, t);
      if (!n) { if (f.has("f")) continue; throw new Error(`rm: cannot remove '${p}': No such file or directory`); }
      if (n.type === "dir" && !f.has("r") && !f.has("R")) throw new Error(`rm: cannot remove '${p}': Is a directory (use rm -r)`);
      if (t === "/" || t === HOME) throw new Error("rm: refusing to remove your home directory 😅");
      delete node(sh, parentOf(t)).children[baseName(t)];
      if (sh.cwd === t || sh.cwd.startsWith(t + "/")) sh.cwd = parentOf(t);
    }
    return "";
  },
  rmdir: (sh, a) => {
    for (const p of a) {
      const t = abs(sh, p), n = node(sh, t);
      if (!n) throw new Error(`rmdir: failed to remove '${p}': No such file or directory`);
      if (n.type !== "dir") throw new Error(`rmdir: failed to remove '${p}': Not a directory`);
      if (Object.keys(n.children).length) throw new Error(`rmdir: failed to remove '${p}': Directory not empty`);
      delete node(sh, parentOf(t)).children[baseName(t)];
    }
    return "";
  },
  cat: (sh, a, stdin) => (a.length ? a.map((p) => readArg(sh, p, "cat")).join("") : stdin).replace(/\n$/, ""),
  echo: (sh, a) => a.join(" "),
  mv: (sh, a) => {
    if (a.length < 2) throw new Error("mv: missing destination file operand");
    const src = abs(sh, a[0]), n = node(sh, src);
    if (!n) throw new Error(`mv: cannot stat '${a[0]}': No such file or directory`);
    let dst = abs(sh, a[1]); const d = node(sh, dst);
    if (d && d.type === "dir") dst = dst + "/" + baseName(src);
    const dp = node(sh, parentOf(dst));
    if (!dp) throw new Error(`mv: cannot move to '${a[1]}': No such file or directory`);
    delete node(sh, parentOf(src)).children[baseName(src)];
    dp.children[baseName(dst)] = n; return "";
  },
  cp: (sh, args) => {
    const [f, a] = flags(args);
    if (a.length < 2) throw new Error("cp: missing destination file operand");
    const src = abs(sh, a[0]), n = node(sh, src);
    if (!n) throw new Error(`cp: cannot stat '${a[0]}': No such file or directory`);
    if (n.type === "dir" && !f.has("r") && !f.has("R")) throw new Error(`cp: -r not specified; omitting directory '${a[0]}'`);
    let dst = abs(sh, a[1]); const d = node(sh, dst);
    if (d && d.type === "dir") dst = dst + "/" + baseName(src);
    const dp = node(sh, parentOf(dst));
    if (!dp) throw new Error(`cp: cannot create '${a[1]}': No such file or directory`);
    dp.children[baseName(dst)] = clone(n); return "";
  },
  head: (sh, args, stdin) => { const n = numFlag(args, 10); return lines(args.length ? readArg(sh, args[0], "head") : stdin).slice(0, n).join("\n"); },
  tail: (sh, args, stdin) => { const n = numFlag(args, 10); const l = lines(args.length ? readArg(sh, args[0], "tail") : stdin); return l.slice(Math.max(0, l.length - n)).join("\n"); },
  wc: (sh, args, stdin) => {
    const [f, rest] = flags(args);
    const txt = rest.length ? readArg(sh, rest[0], "wc") : stdin;
    const l = lines(txt).length, w = (txt.match(/\S+/g) || []).length, c = txt.length;
    const parts = f.size ? [f.has("l") && l, f.has("w") && w, f.has("c") && c].filter((x) => x !== false) : [l, w, c];
    return parts.join(" ") + (rest[0] ? " " + rest[0] : "");
  },
  sort: (sh, args, stdin) => {
    const [f, rest] = flags(args);
    let l = lines(rest.length ? readArg(sh, rest[0], "sort") : stdin);
    l = f.has("n") ? l.sort((x, y) => parseFloat(x) - parseFloat(y)) : l.sort();
    if (f.has("r")) l.reverse();
    return l.join("\n");
  },
  uniq: (sh, args, stdin) => {
    const [f, rest] = flags(args);
    const l = lines(rest.length ? readArg(sh, rest[0], "uniq") : stdin), out = [];
    for (const x of l) { if (out.length && out[out.length - 1][0] === x) out[out.length - 1][1]++; else out.push([x, 1]); }
    return out.map(([x, n]) => (f.has("c") ? `${String(n).padStart(4)} ${x}` : x)).join("\n");
  },
  grep: (sh, args, stdin) => {
    const [f, rest] = flags(args);
    const pat = rest.shift();
    if (pat === undefined) throw new Error("usage: grep [-i] [-n] [-c] [-r] [-v] pattern [file...]");
    const re = new RegExp(pat.replace(/[.+^${}()[\]\\]/g, "\\$&").replace(/\*/g, ".*"), f.has("i") ? "i" : "");
    let sources = [];
    if (!rest.length && !f.has("r")) sources = [[null, stdin]];
    else for (const p of rest.length ? rest : ["."]) {
      const t = abs(sh, p), n = node(sh, t);
      if (!n) throw new Error(`grep: ${p}: No such file or directory`);
      if (n.type === "dir") {
        if (!f.has("r")) throw new Error(`grep: ${p}: Is a directory (use -r)`);
        walk(n, t, (c, path) => c.type === "file" && sources.push([display(path).replace(display(sh.cwd) + "/", ""), c.content]));
      } else sources.push([p, n.content]);
    }
    const multi = sources.length > 1 || f.has("r");
    const out = [];
    for (const [name, txt] of sources) {
      const hits = lines(txt).map((l, i) => [l, i + 1]).filter(([l]) => re.test(l) !== f.has("v"));
      if (f.has("c")) out.push((multi ? name + ":" : "") + hits.length);
      else hits.forEach(([l, n]) => out.push((multi ? name + ":" : "") + (f.has("n") ? n + ":" : "") + l));
    }
    return out.join("\n");
  },
  find: (sh, args) => {
    let start = ".", name = null, type = null;
    const a = [...args];
    if (a[0] && !a[0].startsWith("-")) start = a.shift();
    for (let i = 0; i < a.length; i++) {
      if (a[i] === "-name" || a[i] === "-iname") name = a[++i];
      else if (a[i] === "-type") type = a[++i];
    }
    const t = abs(sh, start), n = node(sh, t);
    if (!n) throw new Error(`find: '${start}': No such file or directory`);
    const re = name ? new RegExp(globRe(name).source, args.includes("-iname") ? "i" : "") : null;
    const out = [];
    walk(n, t, (c, path) => {
      if (type === "f" && c.type !== "file") return;
      if (type === "d" && c.type !== "dir") return;
      if (re && !re.test(baseName(path))) return;
      const rel = path === t ? start : (start === "." ? "." : start.replace(/\/$/, "")) + path.slice(t.length);
      out.push(rel);
    });
    return out.join("\n");
  },
  tree: (sh, a) => {
    const t = abs(sh, a[0] || "."), n = node(sh, t);
    if (!n || n.type !== "dir") throw new Error(`tree: ${a[0] || "."}: not a directory`);
    const out = [a[0] || "."];
    const rec = (d, pre) => {
      const keys = Object.keys(d.children).filter((k) => !k.startsWith(".")).sort();
      keys.forEach((k, i) => {
        const last = i === keys.length - 1, c = d.children[k];
        out.push(pre + (last ? "└── " : "├── ") + k + (c.type === "dir" ? "/" : ""));
        if (c.type === "dir") rec(c, pre + (last ? "    " : "│   "));
      });
    };
    rec(n, "");
    return out.join("\n");
  },
};

/* Run one full command line. Returns { out, err, clear }. */
export function run(sh, line) {
  const raw = line.trim();
  if (!raw) return { out: "" };
  sh.history.push(raw);
  if (raw === "clear") return { clear: true, out: "" };
  try {
    const segs = splitPipes(raw);
    let stdin = "";
    for (let i = 0; i < segs.length; i++) {
      let seg = segs[i], redirect = null;
      if (i === segs.length - 1) {
        // find the first '>' outside quotes; everything after it is the target file
        let q = null, at = -1;
        for (let j = 0; j < seg.length; j++) {
          const ch = seg[j];
          if (q) { if (ch === q) q = null; continue; }
          if (ch === '"' || ch === "'") q = ch;
          else if (ch === ">") { at = j; break; }
        }
        if (at >= 0) {
          const append = seg[at + 1] === ">";
          const target = seg.slice(at + (append ? 2 : 1)).trim().replace(/^["']|["']$/g, "");
          if (!target) throw new Error("syntax error: missing file after >");
          redirect = { append, path: target };
          seg = seg.slice(0, at);
        }
      }
      const toks = tokenize(seg);
      if (!toks.length) throw new Error("syntax error near unexpected token");
      const [cmd, ...rest] = [toks[0].v, ...expand(sh, toks.slice(1))];
      const fn = CMDS[cmd];
      if (!fn) {
        if (cmd === "git") throw new Error("git isn't available in this terminal. Use the Git simulator further down the lesson.");
        throw new Error(`${cmd}: command not found. Type 'help' to see what's available.`);
      }
      if (rest.includes("--help")) { stdin = MAN[cmd] || `${cmd}: no help available`; continue; }
      stdin = String(fn(sh, rest, stdin) ?? "");
      if (redirect) { writeFile(sh, abs(sh, redirect.path), stdin === "" ? "" : stdin + "\n", redirect.append); stdin = ""; }
    }
    sh.lastOut = stdin;
    return { out: stdin };
  } catch (e) {
    sh.lastOut = "";
    return { err: e.message };
  }
}

/* Tab completion for the last word. */
export function complete(sh, line) {
  const m = line.match(/^(.*?)(\S*)$/);
  const word = m[2];
  const isFirst = !m[1].trim();
  if (isFirst) {
    const hits = Object.keys(CMDS).concat("clear").filter((c) => c.startsWith(word));
    return hits.length === 1 ? m[1] + hits[0] + " " : line;
  }
  const dirPart = word.includes("/") ? word.slice(0, word.lastIndexOf("/") + 1) : "";
  const dir = node(sh, abs(sh, dirPart || "."));
  if (!dir || dir.type !== "dir") return line;
  const pre = word.slice(dirPart.length);
  const hits = Object.keys(dir.children).filter((k) => k.startsWith(pre) && (pre.startsWith(".") || !k.startsWith(".")));
  if (hits.length !== 1) return line;
  const c = dir.children[hits[0]];
  return m[1] + dirPart + hits[0] + (c.type === "dir" ? "/" : " ");
}

/* Read-only helpers given to lesson goals. */
export function api(sh) {
  return {
    cwd: () => display(sh.cwd),
    exists: (p) => !!node(sh, abs(sh, p)),
    isDir: (p) => node(sh, abs(sh, p))?.type === "dir",
    isFile: (p) => node(sh, abs(sh, p))?.type === "file",
    read: (p) => { const n = node(sh, abs(sh, p)); return n && n.type === "file" ? n.content : null; },
    ran: (re) => sh.history.some((h) => re.test(h)),
    lastOut: () => sh.lastOut || "",
    procs: () => sh.procs.map((p) => p.pid),
  };
}
