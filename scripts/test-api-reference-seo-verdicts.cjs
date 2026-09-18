#!/usr/bin/env node
"use strict";
/**
 * End-to-end tests for the gate's VERDICTS, against a stub origin on localhost.
 *
 * scripts/test-api-reference-seo.cjs covers the parsers. It cannot cover the pick
 * loop, and the pick loop is where the verdict is actually decided: which branch
 * a response lands in, what it is counted as, and whether a run that learned
 * nothing says so. Those are ordering bugs, and ordering bugs do not show up in a
 * unit test of a pure function.
 *
 * Every case here was a real bug, and every one of them was silent:
 *
 *   - A line remediated exactly as the gate asks - 301 to the unversioned
 *     counterpart - for symbols that have since been retired, so the redirect
 *     lands on a 404. `get` follows redirects and reports the FINAL status, so
 *     the 404 branch claimed the pages did not exist and printed them as "link
 *     rot in the docs ... a line taken offline". It judged nothing and said the
 *     opposite of what happened, to the one team that had just done the work.
 *
 *   - The unversioned counterpart 30x-ing onward, which made a line that had
 *     been remediated correctly follow that second hop and get reported as
 *     redirecting somewhere it should not. The canonical path already guards
 *     against this; the redirect path did not.
 *
 *   - The request budget. Picks it stops must read as "not asked", never as
 *     absence, and the run must fail its coverage floor rather than print OK.
 *
 *   - Discovery's "could not determine" list, printed without checking whether
 *     the operator then passed those lines in - so a run judged a line and said
 *     in the same output that it had not been checked.
 *
 * HOW it runs the real code: the two scripts are copied to a temp directory with
 * ORIGIN rewritten to the stub, and executed as child processes. Copied, not
 * required, because the gate reaches the network from main() and there is no
 * injection point - and re-copied from the shipped source on every run, so this
 * cannot keep passing after the real file changes. An env-var override in the
 * scripts themselves was the alternative and was rejected: this whole check
 * exists because a silent default is the failure mode, and a mistyped
 * ORIGIN-override variable in CI would point the gate at the wrong host and pass.
 */

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const REPO = path.join(__dirname, "..");
const SAMPLE = 8;

let passed = 0;

/**
 * A stub docs origin.
 *
 * `versioned` decides what a /<line>/data-capture-sdk/ url does; `counterpart`
 * decides what the unversioned url does.
 */
function startOrigin({ versioned, counterpart }) {
  const server = http.createServer((req, res) => {
    const m = /^\/(\d+\.\d+)\/data-capture-sdk\/(.+)$/.exec(req.url);
    if (m) return versioned(m[1], m[2], res);
    const c = /^\/data-capture-sdk\/(.+)$/.exec(req.url);
    if (c) return counterpart(c[1], res);
    res.writeHead(404);
    res.end();
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () =>
      resolve({ server, origin: `http://127.0.0.1:${server.address().port}` }),
    );
  });
}

/** The two scripts, copied with ORIGIN pointed at the stub. */
function stage(origin, edits = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "api-seo-verdicts-"));
  fs.mkdirSync(path.join(tmp, "scripts", "lib"), { recursive: true });
  fs.mkdirSync(path.join(tmp, "build"), { recursive: true });

  const put = (rel, edit) => {
    const src = fs.readFileSync(path.join(REPO, rel), "utf8");
    const out = edit ? edit(src) : src;
    // Named, so a rename in the shipped source fails here rather than silently
    // running the unedited file against the real origin.
    assert.notStrictEqual(out, src, `${rel}: nothing was rewritten - test is stale`);
    fs.writeFileSync(path.join(tmp, rel), out);
  };

  put("scripts/lib/linked-api-lines.cjs", (s) =>
    s.replace(
      'const ORIGIN = "https://docs.scandit.com";',
      `const ORIGIN = ${JSON.stringify(origin)};`,
    ),
  );
  fs.copyFileSync(
    path.join(REPO, "scripts", "discover-api-reference-lines.cjs"),
    path.join(tmp, "scripts", "discover-api-reference-lines.cjs"),
  );
  if (edits.gate) put("scripts/verify-api-reference-seo.cjs", edits.gate);
  else
    fs.copyFileSync(
      path.join(REPO, "scripts", "verify-api-reference-seo.cjs"),
      path.join(tmp, "scripts", "verify-api-reference-seo.cjs"),
    );

  // A build linking one frozen line, with enough urls to clear MIN_LINE_URLS.
  // The hrefs carry the real host: that is what the link walker matches on, and
  // rewriting them would test a different regex than the one that ships.
  const links = Array.from(
    { length: 12 },
    (_, i) => `<a href="https://docs.scandit.com/7.6/data-capture-sdk/ios/api/s${i}.html">s</a>`,
  ).join("");
  fs.writeFileSync(path.join(tmp, "build", "index.html"), links);
  fs.writeFileSync(
    path.join(tmp, "build", "search-tags.json"),
    JSON.stringify({ lastVersionTag: "8.6.0", versionNumberByTag: { "8.6.0": "8.6.0" } }),
  );
  if (edits.artefact) {
    fs.writeFileSync(
      path.join(tmp, "build", "api-reference-lines.json"),
      JSON.stringify({ version: "8.6.0", probes: [], published: [], ...edits.artefact }),
    );
  }
  return tmp;
}

/**
 * Runs the staged gate and returns its combined output and exit code.
 *
 * spawn, NOT spawnSync: the stub origin is served by THIS process, so blocking
 * the event loop makes every request from the child time out and the whole run
 * reports "page -> HTTP 0" - which looks exactly like the bug under test passing.
 */
function runGate(tmp, args) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [path.join(tmp, "scripts", "verify-api-reference-seo.cjs"), ...args],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (status) => resolve({ out, status }));
  });
}

/** Same as runGate, for the discovery script. */
function runDiscovery(tmp, args = []) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [path.join(tmp, "scripts", "discover-api-reference-lines.cjs"), ...args],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (status) => resolve({ out, status }));
  });
}

async function check(label, fn) {
  await fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

async function main() {
  console.log("\napi-reference SEO gate verdicts\n");

  await check(
    "a line that redirects to a retired counterpart is sound, not link rot",
    async () => {
      const { server, origin } = await startOrigin({
        // Remediated exactly as the gate's own advice says to.
        versioned: (line, rest, res) => {
          res.writeHead(301, { location: `/data-capture-sdk/${rest}` });
          res.end();
        },
        // ...and the symbols have since been retired, so the target 404s.
        counterpart: (rest, res) => {
          res.writeHead(404);
          res.end("gone");
        },
      });
      const tmp = stage(origin);
      try {
        const { out, status } = await runGate(tmp, ["--sample", String(SAMPLE), "--strict"]);
        assert.ok(
          !/link rot/.test(out),
          `a redirecting page must not be reported as link rot:\n${out}`,
        );
        assert.ok(!/taken offline/.test(out), `the line must not read as taken offline:\n${out}`);
        assert.ok(
          !/not present on the line/.test(out),
          `no pick may be charged as absent:\n${out}`,
        );
        assert.match(out, new RegExp(`${SAMPLE} of ${SAMPLE} sampled pages judged`));
        assert.match(out, /^OK:/m);
        // --strict on purpose: the point is that a team which did the work is not
        // handed a red build for it.
        assert.strictEqual(status, 0, `--strict must pass on a remediated line:\n${out}`);
      } finally {
        server.close();
        fs.rmSync(tmp, { recursive: true, force: true });
      }
    },
  );

  await check("a redirect to ANOTHER frozen line is still a violation", async () => {
    // The duplicate is moved, not removed. This is the case the redirect branch
    // exists for, and it must survive the reordering that fixed the one above.
    const { server, origin } = await startOrigin({
      versioned: (line, rest, res) => {
        if (line === "6.28") {
          res.writeHead(200, { "content-type": "text/html" });
          res.end("<html><head></head><body>old</body></html>");
          return;
        }
        res.writeHead(301, { location: `/6.28/data-capture-sdk/${rest}` });
        res.end();
      },
      counterpart: (rest, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end("<html><head></head><body>current</body></html>");
      },
    });
    const tmp = stage(origin);
    try {
      const { out } = await runGate(tmp, ["--sample", String(SAMPLE)]);
      assert.match(out, /duplicate content across API-reference lines/);
      assert.match(out, /neither this line nor the current page/);
    } finally {
      server.close();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  await check("picks the request budget stops read as not asked, not as absence", async () => {
    const { server, origin } = await startOrigin({
      versioned: (line, rest, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end("<html><head></head><body>versioned</body></html>");
      },
      counterpart: (rest, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end("<html><head></head><body>current</body></html>");
      },
    });
    // A budget far below what the sample needs, so it binds mid-run.
    const tmp = stage(origin, {
      gate: (s) => s.replace("const REQUEST_BUDGET = 260;", "const REQUEST_BUDGET = 5;"),
    });
    try {
      const { out } = await runGate(tmp, ["--sample", String(SAMPLE)]);
      assert.match(out, /not asked - the 5-request budget ran out/);
      assert.match(out, /5 of 5 requests spent/);
      // Never absence, and never a quiet pass: a run stopped by its own ceiling
      // has to fail its coverage floor the same as one stopped by the network.
      assert.ok(!/link rot/.test(out), `an unasked pick is not link rot:\n${out}`);
      assert.ok(!/taken offline/.test(out), `an unasked pick is not absence:\n${out}`);
      assert.match(out, /judged only \d+ of \d+ sampled pages/);
    } finally {
      server.close();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  await check("a sound line passes, so the cases above are not passing by accident", async () => {
    // Without this, every assertion above could be satisfied by a gate that
    // judges nothing at all.
    const { server, origin } = await startOrigin({
      versioned: (line, rest, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end('<html><head><meta name="robots" content="noindex"></head><body>x</body></html>');
      },
      counterpart: (rest, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end("<html><head></head><body>current</body></html>");
      },
    });
    const tmp = stage(origin);
    try {
      const { out, status } = await runGate(tmp, ["--sample", String(SAMPLE), "--strict"]);
      assert.match(out, new RegExp(`${SAMPLE} of ${SAMPLE} sampled pages judged`));
      assert.match(out, /^OK:/m);
      assert.strictEqual(status, 0, `a noindexed line must pass --strict:\n${out}`);
    } finally {
      server.close();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  await check(
    "a redirect that follows the counterpart's OWN onward hop is sound",
    async () => {
      // The unversioned url itself 30x-ing is not hypothetical here: the file
      // already reasons about it on the canonical path, at `const counterpart =
      // current`. On the redirect path it was unhandled, so a frozen line doing
      // exactly what the gate asks - 301 to the unversioned counterpart - FOLLOWED
      // that second hop, ended on /8.6/, and every pick was reported as
      // "redirects to ... neither this line nor the current page". A team that had
      // done the work got a red --strict run for it.
      const { server, origin } = await startOrigin({
        versioned: (line, rest, res) => {
          if (line === "8.6") {
            res.writeHead(200, { "content-type": "text/html" });
            res.end("<html><head></head><body>served</body></html>");
            return;
          }
          res.writeHead(301, { location: `/data-capture-sdk/${rest}` });
          res.end();
        },
        // ...and the unversioned url redirects onward to the served line.
        counterpart: (rest, res) => {
          res.writeHead(301, { location: `/8.6/data-capture-sdk/${rest}` });
          res.end();
        },
      });
      const tmp = stage(origin);
      try {
        const { out, status } = await runGate(tmp, ["--sample", String(SAMPLE), "--strict"]);
        assert.ok(
          !/neither this line nor the current page/.test(out),
          `a redirect converging with the counterpart must not be a violation:\n${out}`,
        );
        assert.match(out, new RegExp(`${SAMPLE} of ${SAMPLE} sampled pages judged`));
        assert.match(out, /^OK:/m);
        assert.strictEqual(status, 0, `--strict must pass:\n${out}`);
      } finally {
        server.close();
        fs.rmSync(tmp, { recursive: true, force: true });
      }
    },
  );

  await check("a line named with --lines is not also reported as unchecked", async () => {
    // Discovery prints the lines it could not determine so an operator can pass
    // them explicitly. Following that advice produced a report that judged /7.6/
    // and then stated, in the same output, that it was "not among the lines
    // checked here".
    const { server, origin } = await startOrigin({
      versioned: (line, rest, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end('<html><head><meta name="robots" content="noindex"></head><body>x</body></html>');
      },
      counterpart: (rest, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end("<html><head></head><body>current</body></html>");
      },
    });
    const tmp = stage(origin, { artefact: { uncertain: ["7.6", "8.4"] } });
    try {
      const { out } = await runGate(tmp, ["--sample", String(SAMPLE)]);
      assert.ok(
        !/could not determine[^\n]*\/7\.6\//.test(out),
        `/7.6/ was checked, so it must not be listed as undetermined:\n${out}`,
      );
      // The line that really was not checked is still reported - the filter must
      // narrow the list, not delete it.
      assert.match(out, /could not determine[^\n]*\/8\.4\//);
    } finally {
      server.close();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  await check("discovery removes a stale artefact when it cannot replace it", async () => {
    // Four paths return before the write, and the file survived all of them. The
    // gate's freshness check cannot catch that: it compares the artefact's
    // version against the served RELEASE number, which does not change between
    // builds of the same release. So a developer who ran discovery once and then
    // rebuilt with the network down got a gate seeding its picks from the old
    // file and printing "could not determine /X/" from a run that never happened.
    const { server, origin } = await startOrigin({
      // Nothing resolves, so no probe path can be confirmed and discovery bails.
      versioned: (line, rest, res) => {
        res.writeHead(404);
        res.end();
      },
      counterpart: (rest, res) => {
        res.writeHead(404);
        res.end();
      },
    });
    const tmp = stage(origin, {
      artefact: { probes: ["stale/probe.html"], published: ["9.9"], uncertain: ["9.8"] },
    });
    const artefact = path.join(tmp, "build", "api-reference-lines.json");
    try {
      assert.ok(fs.existsSync(artefact), "fixture did not write the artefact");
      const { out } = await runDiscovery(tmp);
      assert.match(out, /no probe path could be confirmed/);
      assert.ok(
        !fs.existsSync(artefact),
        `a run that could not produce an artefact must not leave the old one:\n${out}`,
      );
    } finally {
      server.close();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  await check("a catch-all redirect is not reported as a published line", async () => {
    // Ordinary static-hosting behaviour. Counting any 3xx as "published" made
    // every minor in the sweep come back as a discovered line, and CI feeds that
    // list straight into --lines.
    const { server, origin } = await startOrigin({
      versioned: (line, rest, res) => {
        // The unversioned tree is what probes are confirmed against, so the
        // versioned urls are the ones that get the catch-all.
        res.writeHead(302, { location: "/" });
        res.end();
      },
      counterpart: (rest, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end("<html><head></head><body>current</body></html>");
      },
    });
    const tmp = stage(origin);
    try {
      const { out } = await runDiscovery(tmp, ["--quiet"]);
      assert.match(out, /answered by a redirect that drops the symbol path/);
      const artefact = JSON.parse(
        fs.readFileSync(path.join(tmp, "build", "api-reference-lines.json"), "utf8"),
      );
      assert.deepStrictEqual(
        artefact.published,
        [],
        `a catch-all must not publish lines: ${JSON.stringify(artefact)}`,
      );
    } finally {
      server.close();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  console.log(`\n${passed} passed\n`);
}

main().catch((err) => {
  console.error(`\n${err && err.stack ? err.stack : err}\n`);
  process.exitCode = 1;
});
