/* A teaching model of Git: working tree → staging area → commits, branches, merges and a remote.
   Commands: touch/edit <file>, git status|add|commit|log|branch|switch|checkout|merge|push|pull|restore|diff, help, clear. */

let seq = 0;
const hash = () => (0x1000000 + ((++seq * 2654435761) % 0xffffff)).toString(16).slice(1, 8);

export function makeRepo(opts = {}) {
  seq = 0;
  const repo = {
    commits: {}, order: [], branches: {}, head: "main",
    tracked: { "index.html": 1, "README.md": 1 }, // file -> version committed on current branch
    work: {}, staged: {}, remote: opts.remote ? { main: null } : null, laneOf: { main: 0 }, lanes: 1, log: [],
  };
  const c = commit(repo, "Initial commit", ["index.html", "README.md"]);
  if (repo.remote) repo.remote.main = c;
  return repo;
}

function commit(repo, msg, files) {
  const id = hash();
  const parent = repo.branches[repo.head];
  repo.commits[id] = { id, msg, parents: parent ? [parent] : [], branch: repo.head, files, lane: repo.laneOf[repo.head] ?? 0, n: repo.order.length };
  repo.order.push(id);
  repo.branches[repo.head] = id;
  return id;
}
export function isAncestor(repo, a, b) {
  // is commit a reachable from b?
  const seen = new Set(), stack = [b];
  while (stack.length) { const x = stack.pop(); if (!x || seen.has(x)) continue; if (x === a) return true; seen.add(x); stack.push(...repo.commits[x].parents); }
  return false;
}
const words = (s) => s.match(/"[^"]*"|'[^']*'|\S+/g)?.map((w) => w.replace(/^["']|["']$/g, "")) || [];

const HELP = `Simulated commands:
  touch <file> | edit <file>    create or change a file in the working tree
  git status                    see changed and staged files
  git add <file> | git add .    stage changes
  git commit -m "message"       record staged changes
  git log --oneline             list commits on this branch
  git branch [name] | -d name   list, create or delete branches
  git switch [-c] <name>        move to a branch (-c creates it)
  git checkout [-b] <name>      older way to switch branches
  git merge <name>              merge a branch into the current one
  git restore <file>            discard working-tree changes
  git push / git pull           sync with the remote (when there is one)`;

export function runGit(repo, line) {
  const w = words(line.trim());
  if (!w.length) return { out: "" };
  repo.log.push(line.trim());
  const [cmd, sub, ...rest] = w;
  try {
    if (cmd === "clear") return { clear: true };
    if (cmd === "help") return { out: HELP };
    if (cmd === "touch" || cmd === "edit") {
      if (!sub) throw new Error(`${cmd}: missing file name`);
      [sub, ...rest].forEach((f) => (repo.work[f] = repo.tracked[f] ? "modified" : "new file"));
      return { out: "" };
    }
    if (cmd !== "git") throw new Error(`${cmd}: command not found. This is a Git sandbox, type 'help'.`);
    switch (sub) {
      case undefined: return { out: HELP };
      case "init": return { out: "Reinitialized existing Git repository" };
      case "status": {
        const st = Object.entries(repo.staged), wk = Object.entries(repo.work);
        const out = [`On branch ${repo.head}`];
        if (repo.remote && repo.remote[repo.head] !== undefined) {
          const r = repo.remote[repo.head], l = repo.branches[repo.head];
          out.push(r === l ? `Your branch is up to date with 'origin/${repo.head}'.` : isAncestor(repo, r, l) ? `Your branch is ahead of 'origin/${repo.head}'. (use "git push")` : `Your branch and 'origin/${repo.head}' have diverged.`);
        }
        if (st.length) out.push("", "Changes to be committed:", ...st.map(([f, s]) => `\t${s}:   ${f}`));
        if (wk.length) out.push("", "Changes not staged for commit:", '  (use "git add <file>..." to stage)', ...wk.map(([f, s]) => `\t${s}:   ${f}`));
        if (!st.length && !wk.length) out.push("nothing to commit, working tree clean");
        return { out: out.join("\n"), status: true };
      }
      case "add": {
        if (!rest.length) throw new Error("Nothing specified, nothing added. Maybe you wanted to say 'git add .'?");
        const files = rest.includes(".") || rest.includes("-A") ? Object.keys(repo.work) : rest;
        for (const f of files) {
          if (!repo.work[f]) { if (!rest.includes(".")) throw new Error(`pathspec '${f}' did not match any changed files`); continue; }
          repo.staged[f] = repo.work[f]; delete repo.work[f];
        }
        return { out: "" };
      }
      case "restore": {
        const staged = rest[0] === "--staged"; const files = staged ? rest.slice(1) : rest;
        for (const f of files) { if (staged) { if (repo.staged[f]) { repo.work[f] = repo.staged[f]; delete repo.staged[f]; } } else delete repo.work[f]; }
        return { out: "" };
      }
      case "diff": return { out: Object.keys(repo.work).length ? Object.keys(repo.work).map((f) => `diff --git a/${f} b/${f}\n+ (your changes to ${f})`).join("\n") : "" };
      case "commit": {
        const all = rest.includes("-a") || rest.includes("-am");
        const mi = rest.findIndex((x) => x === "-m" || x === "-am");
        if (mi < 0 || !rest[mi + 1]) throw new Error('Aborting commit: add a message with -m "message".');
        if (all) Object.assign(repo.staged, Object.fromEntries(Object.entries(repo.work).filter(([f]) => repo.tracked[f])));
        const files = Object.keys(repo.staged);
        if (!files.length) throw new Error("nothing added to commit. Use 'git add <file>' to stage changes first.");
        files.forEach((f) => { repo.tracked[f] = 1; if (all) delete repo.work[f]; });
        repo.staged = {};
        const id = commit(repo, rest[mi + 1], files);
        return { out: `[${repo.head} ${id}] ${rest[mi + 1]}\n ${files.length} file${files.length > 1 ? "s" : ""} changed` };
      }
      case "log": {
        const out = []; let x = repo.branches[repo.head];
        const seen = new Set(), stack = [x];
        const ids = [];
        while (stack.length) { const c = stack.pop(); if (!c || seen.has(c)) continue; seen.add(c); ids.push(c); stack.push(...repo.commits[c].parents); }
        ids.sort((a, b) => repo.commits[b].n - repo.commits[a].n).forEach((id) => {
          const labels = Object.entries(repo.branches).filter(([, v]) => v === id).map(([k]) => (k === repo.head ? `HEAD -> ${k}` : k));
          out.push(`${id}${labels.length ? ` (${labels.join(", ")})` : ""} ${repo.commits[id].msg}`);
        });
        return { out: out.join("\n") };
      }
      case "branch": {
        if (!rest.length) return { out: Object.keys(repo.branches).map((b) => (b === repo.head ? `* ${b}` : `  ${b}`)).join("\n") };
        if (rest[0] === "-d" || rest[0] === "-D") {
          const b = rest[1];
          if (!repo.branches[b]) throw new Error(`branch '${b}' not found.`);
          if (b === repo.head) throw new Error(`Cannot delete branch '${b}' while you are on it.`);
          if (rest[0] === "-d" && !isAncestor(repo, repo.branches[b], repo.branches[repo.head])) throw new Error(`The branch '${b}' is not fully merged. Use -D to force.`);
          delete repo.branches[b]; return { out: `Deleted branch ${b}.` };
        }
        return createBranch(repo, rest[0]);
      }
      case "switch": case "checkout": {
        const create = rest[0] === "-c" || rest[0] === "-b";
        const name = create ? rest[1] : rest[0];
        if (!name) throw new Error(`${sub}: missing branch name`);
        if (create) createBranch(repo, name);
        if (!repo.branches[name]) throw new Error(`invalid reference: ${name}${sub === "switch" ? " (use git switch -c to create it)" : ""}`);
        repo.head = name;
        return { out: `Switched to ${create ? "a new " : ""}branch '${name}'` };
      }
      case "merge": {
        const other = rest[0];
        if (!other || !repo.branches[other]) throw new Error(`merge: ${other || ""} - not something we can merge`);
        const a = repo.branches[repo.head], b = repo.branches[other];
        if (isAncestor(repo, b, a)) return { out: "Already up to date." };
        if (isAncestor(repo, a, b)) { repo.branches[repo.head] = b; return { out: `Updating ${a}..${b}\nFast-forward` }; }
        const id = hash();
        repo.commits[id] = { id, msg: `Merge branch '${other}' into ${repo.head}`, parents: [a, b], branch: repo.head, files: [], lane: repo.laneOf[repo.head] ?? 0, n: repo.order.length, merge: true };
        repo.order.push(id); repo.branches[repo.head] = id;
        return { out: `Merge made by the 'ort' strategy.\n[${repo.head} ${id}] Merge branch '${other}'` };
      }
      case "push": {
        if (!repo.remote) throw new Error("fatal: no remote configured in this exercise");
        const l = repo.branches[repo.head], r = repo.remote[repo.head];
        if (r === l) return { out: "Everything up-to-date" };
        if (r && !isAncestor(repo, r, l)) throw new Error("! [rejected] (fetch first). Run git pull, then push again.");
        repo.remote[repo.head] = l;
        return { out: `To github.com:you/learnx.git\n   ${r ? r + ".." : "* [new branch] "}${l}  ${repo.head} -> ${repo.head}` };
      }
      case "pull": {
        if (!repo.remote) throw new Error("fatal: no remote configured in this exercise");
        const r = repo.remote[repo.head], l = repo.branches[repo.head];
        if (!r || r === l || isAncestor(repo, r, l)) return { out: "Already up to date." };
        if (isAncestor(repo, l, r)) { repo.branches[repo.head] = r; return { out: `Updating ${l}..${r}\nFast-forward` }; }
        const id = hash();
        repo.commits[id] = { id, msg: `Merge branch 'main' of origin`, parents: [l, r], branch: repo.head, files: [], lane: repo.laneOf[repo.head] ?? 0, n: repo.order.length, merge: true };
        repo.order.push(id); repo.branches[repo.head] = id;
        return { out: `Merge made by the 'ort' strategy.` };
      }
      default: throw new Error(`git: '${sub}' is not supported in this simulator. Type 'help'.`);
    }
  } catch (e) { return { err: e.message }; }
}

function createBranch(repo, name) {
  if (!/^[\w./-]+$/.test(name)) throw new Error(`'${name}' is not a valid branch name.`);
  if (repo.branches[name]) throw new Error(`a branch named '${name}' already exists`);
  repo.branches[name] = repo.branches[repo.head];
  if (repo.laneOf[name] === undefined) repo.laneOf[name] = repo.lanes++;
  return { out: "" };
}

/* Simulate a teammate pushing a commit to the remote (used by the pull exercise). */
export function teammatePush(repo, msg) {
  const saveHead = repo.head, saveTip = repo.branches.main;
  repo.head = "main";
  repo.branches.main = repo.remote.main;
  const id = commit(repo, msg, ["README.md"]);
  repo.commits[id].teammate = true;
  repo.remote.main = id;
  repo.branches.main = saveTip; repo.head = saveHead;
  return id;
}
