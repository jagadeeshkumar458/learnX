/* Module — Databases. Lesson titles match the syllabus so the topic lists attach.
   `sqlplay` = SQL editor over a fresh copy of `seed`; `sqlch` = SQL challenge (tests get a helper `t`:
   t.expect(refSql, {ordered}), t.cols(), t.rows(sql) for the state afterwards, t.has(regex), t.db, t.last);
   `sqlinj` = the SQL injection demo. All data is fictional. */

export const GAMES_SEED = `CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT,
  platform TEXT,
  price NUMERIC(6,2),
  release_year INTEGER,
  rating NUMERIC(3,1),
  in_stock BOOLEAN DEFAULT true
);
INSERT INTO games (title, genre, platform, price, release_year, rating, in_stock) VALUES
  ('Starfall Odyssey', 'RPG', 'PC', 59.99, 2024, 9.1, true),
  ('Turbo Kart Legends', 'Racing', 'Switch', 49.99, 2023, 8.4, true),
  ('Shadow Protocol', 'Action', 'PlayStation', 69.99, 2025, 8.8, true),
  ('Pixel Farm Days', 'Simulation', 'Switch', 24.99, 2021, 8.9, true),
  ('Frostbite Arena', 'Shooter', 'PC', 0, 2022, 7.2, true),
  ('Mystic Isles', 'Adventure', 'PC', 29.99, 2019, 8.1, false),
  ('Galactic Tactics', 'Strategy', 'PC', 39.99, 2020, 8.6, true),
  ('Neon Drift', 'Racing', 'Xbox', 39.99, 2024, 7.9, true),
  ('Kingdom of Ash', 'RPG', 'PlayStation', 69.99, 2025, 9.3, false),
  ('Puzzle Garden', 'Puzzle', 'Mobile', 4.99, 2018, 7.5, true),
  ('Ocean Depths', 'Adventure', 'Xbox', 34.99, 2022, NULL, true),
  ('Retro Racer 64', 'Racing', 'PC', 9.99, 2017, 6.8, true),
  ('Dungeon Bakers', 'Simulation', 'PC', 19.99, 2023, 8.7, true),
  ('Sky Knights', 'Action', 'Switch', 59.99, 2024, 8.2, false),
  ('Word Quest', 'Puzzle', 'Mobile', NULL, 2025, NULL, true),
  ('Iron Legion', 'Strategy', 'Xbox', 49.99, 2021, 7.7, true);`;

export const STORE_SEED = GAMES_SEED + `
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  country TEXT,
  joined DATE
);
INSERT INTO customers (name, email, country, joined) VALUES
  ('Priya Nair', 'priya@example.com', 'India', '2024-02-11'),
  ('Lucas Silva', 'lucas@example.com', 'Brazil', '2024-05-03'),
  ('Emma Dubois', 'emma@example.com', 'France', '2024-07-19'),
  ('Kenji Sato', 'kenji@example.com', 'Japan', '2024-09-30'),
  ('Amara Okafor', 'amara@example.com', 'Nigeria', '2025-01-14'),
  ('Noah Fischer', 'noah@example.com', 'Germany', '2025-03-08'),
  ('Sofia Rossi', 'sofia@example.com', 'Italy', '2025-06-21'),
  ('Arjun Mehta', 'arjun@example.com', 'India', '2025-08-02');
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  order_date DATE NOT NULL,
  status TEXT DEFAULT 'pending'
);
INSERT INTO orders (customer_id, order_date, status) VALUES
  (1, '2025-01-05', 'shipped'),
  (2, '2025-01-18', 'shipped'),
  (1, '2025-02-02', 'shipped'),
  (3, '2025-02-14', 'cancelled'),
  (4, '2025-03-01', 'shipped'),
  (5, '2025-03-22', 'shipped'),
  (2, '2025-04-10', 'pending'),
  (6, '2025-04-28', 'shipped'),
  (1, '2025-05-15', 'pending'),
  (4, '2025-06-03', 'shipped');
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(6,2) NOT NULL
);
INSERT INTO order_items (order_id, game_id, quantity, unit_price) VALUES
  (1, 1, 1, 59.99),
  (1, 10, 2, 4.99),
  (2, 2, 1, 49.99),
  (3, 7, 1, 39.99),
  (3, 13, 1, 19.99),
  (4, 3, 1, 69.99),
  (5, 1, 1, 59.99),
  (5, 4, 1, 24.99),
  (6, 8, 2, 39.99),
  (7, 9, 1, 69.99),
  (8, 12, 3, 9.99),
  (8, 4, 1, 24.99),
  (9, 3, 1, 69.99),
  (10, 1, 1, 59.99),
  (10, 16, 1, 49.99);`;

const USERS_SEED = `CREATE TABLE users (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'player');
INSERT INTO users (username, password, role) VALUES ('admin', 's3cret-admin', 'admin'), ('ada', 'correct-horse', 'player'), ('linus', 'penguin42', 'player');`;

export const DATABASES = {
  id: "db",
  title: "Databases",
  blurb: "Store, query and relate data with SQL: the language behind almost every app.",
  concepts: ["SQL vs NoSQL", "SELECT, WHERE, ORDER BY and LIMIT", "INSERT, UPDATE and DELETE", "CREATE and ALTER TABLE with constraints", "JOINs and aggregates", "SQL injection"],
  lessons: [
    /* ───────────────────────── Intro ───────────────────────── */
    { id: "db-intro", title: "Intro to Databases", min: 25, kind: "lesson", body: [
      { t: "p", h: "Your Node servers kept data in arrays and JSON files. That works until two requests write at the same time, the file grows to millions of records, or you need \"every order from customers in India last month\". A <b>database</b> stores data safely, lets many users read and write it at once, and answers questions about it quickly." },
      { t: "h", h: "SQL vs NoSQL" },
      { t: "p", h: "<b>Relational databases</b> (PostgreSQL, MySQL, SQLite, SQL Server) store data in <b>tables</b>: rows and columns with a fixed <b>schema</b>. Tables link to each other through keys, and you query them with <b>SQL</b> (Structured Query Language). <b>NoSQL databases</b> drop the table model: <b>document</b> stores like MongoDB keep JSON-like documents, <b>key-value</b> stores like Redis map keys to values, and <b>graph</b> databases store nodes and relationships." },
      { t: "diagram", name: "db-compare" },
      { t: "steps", items: [
        "<b>Choose relational</b> when your data has clear relationships (customers, orders, products) and correctness matters: transactions, constraints, joins. It's the right default for most apps",
        "<b>Choose a document store</b> when records vary a lot in shape, or you mostly read and write whole documents by id",
        "<b>Choose key-value</b> for caching, sessions and counters, where speed matters more than querying",
        "Many real systems use both: PostgreSQL as the source of truth, Redis as a cache",
      ] },
      { t: "callout", kind: "key", h: "Relational databases guarantee <b>ACID</b> transactions: a group of changes either all happens or none does (<i>atomic</i>), the data always obeys its rules (<i>consistent</i>), concurrent transactions don't see each other's half-finished work (<i>isolated</i>), and committed data survives a crash (<i>durable</i>). Transferring money between accounts is the classic example." },
      { t: "quiz", q: "An online shop has customers, products and orders that reference both. Which fits best?", opts: ["A key-value store", "A relational database", "A JSON file per order"], a: 1, why: "The data is made of related entities, and orders must never point at missing customers. That's exactly what tables, foreign keys and joins are for." },
      { t: "h", h: "Your first query" },
      { t: "p", h: "Here's a real table of games from <b>GameVault</b>, the store you'll query in this module. Run the query, then edit it. The labs use a PostgreSQL-flavoured engine that runs in your browser." },
      { t: "sqlplay", seed: GAMES_SEED, sql: "SELECT title, genre, price\nFROM games\nWHERE price < 30;", task: "Run it. Then change <code>30</code> to <code>50</code>, or add <code>ORDER BY price</code> before the semicolon." },
      { t: "h", h: "Developing with databases" },
      { t: "p", h: "A database is a separate program, a <b>server</b>, usually on another machine. Your backend connects to it with a <b>driver</b> (like <code>pg</code> for PostgreSQL in Node) using a <b>connection string</b>, sends SQL, and gets rows back as JavaScript objects." },
      { t: "code", lang: "javascript", code: `import pg from "pg"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })  // never hard-code credentials

const { rows } = await pool.query("SELECT title, price FROM games WHERE genre = $1", ["RPG"])
// rows → [{ title: "Starfall Odyssey", price: "59.99" }, …]` },
      { t: "steps", items: [
        "<b>Environment variables</b> hold the connection string, so the password never lands in Git",
        "A <b>connection pool</b> reuses a few open connections instead of opening one per request",
        "<b>Migrations</b> are versioned SQL files that create and change tables, so every environment has the same schema",
        "<b>ORMs and query builders</b> (Prisma, Drizzle, Knex) generate SQL for you. Learn SQL first, so you know what they're doing",
      ] },
      { t: "h", h: "Managed vs self-hosted" },
      { t: "p", h: "<b>Self-hosted</b> means you install and run PostgreSQL yourself on a server: full control, but you handle backups, upgrades, security patches and scaling. A <b>managed</b> database (Supabase, Neon, Amazon RDS, Google Cloud SQL and others) is run for you: backups, failover and updates are handled, and you pay for the convenience. For most new projects, managed is the sensible start." },
      { t: "quiz", q: "Which job does a managed database take off your hands?", opts: ["Designing your tables", "Writing your SQL queries", "Backups, patching and keeping the server running"], a: 2, why: "The provider runs the infrastructure. Your schema and queries are still yours." },
      { t: "recap", items: ["Databases store data safely, for many users at once, and answer questions fast", "Relational = tables + schema + SQL + joins; NoSQL = documents, key-value, graphs", "Relational databases give you ACID transactions", "Apps connect through a driver and a connection string kept in an environment variable", "Managed databases trade cost for less operations work"] },
    ]},

    /* ───────────────────────── Writing SQL Queries ───────────────────────── */
    { id: "db-queries", title: "Writing SQL Queries", min: 110, kind: "lesson", body: [
      { t: "p", h: "GameVault's catalogue lives in one table, <code>games</code>. You'll answer real questions about it with SQL, then change the data. Every lab starts from a fresh copy, so experiment freely." },
      { t: "h", h: "SELECT all" },
      { t: "code", lang: "sql", code: `SELECT * FROM games;                  -- every column, every row
SELECT title, price FROM games;        -- just these columns
SELECT title AS name, price * 0.9 AS sale_price FROM games;   -- rename and calculate` },
      { t: "p", h: "SQL keywords aren't case-sensitive, but writing them in capitals makes queries easier to read. End each statement with a semicolon. <b>Text values use single quotes</b> (<code>'RPG'</code>); double quotes are for column and table names." },
      { t: "sqlplay", seed: GAMES_SEED, sql: "SELECT * FROM games;", task: "Select just <code>title</code> and <code>release_year</code>. Then add a calculated column <code>2026 - release_year AS age</code>." },
      { t: "h", h: "Sorting and limiting" },
      { t: "code", lang: "sql", code: `SELECT title, rating FROM games
ORDER BY rating DESC      -- ASC (the default) or DESC
LIMIT 5;                  -- just the top 5` },
      { t: "callout", kind: "tip", h: "In PostgreSQL, <code>NULL</code> sorts as if it were larger than every value: last in ascending order, first in descending order. Add <code>NULLS LAST</code> to change that: <code>ORDER BY rating DESC NULLS LAST</code>." },
      { t: "video", name: "sql-order" },
      { t: "sqlch", seed: GAMES_SEED, prompt: "List the <code>title</code> and <code>price</code> of every game, most expensive first.", sql: "-- Write your query here\n", solution: "SELECT title, price\nFROM games\nORDER BY price DESC;", tests: [
        { msg: "Returns exactly the columns title and price", fn: (t) => t.cols().join() === "title,price" },
        { msg: "Returns all 16 games", fn: (t) => !!t.last && t.last.rows.length === 16 },
        { msg: "Sorted by price, highest first", fn: (t) => t.expect("SELECT title, price FROM games ORDER BY price DESC", { ordered: true }) },
      ] },
      { t: "h", h: "The WHERE clause" },
      { t: "p", h: "<code>WHERE</code> keeps only the rows where a condition is true. Compare with <code>=</code>, <code>&lt;&gt;</code> (not equal; <code>!=</code> works too), <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>." },
      { t: "code", lang: "sql", code: `SELECT title FROM games WHERE genre = 'RPG';
SELECT title FROM games WHERE price <= 20;
SELECT title FROM games WHERE in_stock = false;` },
      { t: "h", h: "NOT, AND and OR" },
      { t: "code", lang: "sql", code: `SELECT title FROM games WHERE platform = 'PC' AND price < 30;
SELECT title FROM games WHERE genre = 'Racing' OR genre = 'Puzzle';
SELECT title FROM games WHERE NOT genre = 'Action';
SELECT title FROM games WHERE (genre = 'RPG' OR genre = 'Action') AND in_stock;  -- brackets matter!` },
      { t: "callout", kind: "warn", h: "<code>AND</code> binds tighter than <code>OR</code>, just like <code>&&</code> and <code>||</code> in JavaScript. <code>genre = 'RPG' OR genre = 'Action' AND in_stock</code> means RPGs (in stock or not) plus in-stock action games. Use brackets to say what you mean." },
      { t: "sqlch", seed: GAMES_SEED, prompt: "Find the <code>title</code>, <code>genre</code> and <code>price</code> of PC games that cost less than 30 and are <b>not</b> Simulation games.", sql: "SELECT title, genre, price\nFROM games\n", solution: "SELECT title, genre, price\nFROM games\nWHERE platform = 'PC' AND price < 30 AND NOT genre = 'Simulation';", tests: [
        { msg: "Returns the columns title, genre and price", fn: (t) => t.cols().join() === "title,genre,price" },
        { msg: "Only PC games under 30", fn: (t) => !!t.last && t.last.rows.length > 0 && t.last.rows.every((r) => r[2] !== null && r[2] < 30) },
        { msg: "No Simulation games (Dungeon Bakers is out)", fn: (t) => !!t.last && t.last.rows.every((r) => r[1] !== "Simulation") },
        { msg: "Exactly the right 3 games", fn: (t) => t.expect("SELECT title, genre, price FROM games WHERE platform = 'PC' AND price < 30 AND genre <> 'Simulation'") },
      ] },
      { t: "h", h: "IN, BETWEEN and LIKE" },
      { t: "code", lang: "sql", code: `SELECT title FROM games WHERE genre IN ('Racing', 'Puzzle', 'Strategy');   -- any of these
SELECT title FROM games WHERE genre NOT IN ('RPG', 'Action');
SELECT title FROM games WHERE release_year BETWEEN 2020 AND 2023;            -- inclusive
SELECT title FROM games WHERE title LIKE 'S%';        -- % = any characters, _ = exactly one
SELECT title FROM games WHERE title ILIKE '%quest%';  -- ILIKE ignores case (PostgreSQL)` },
      { t: "h", h: "NULL: the missing value" },
      { t: "p", h: "<code>NULL</code> means \"unknown\" or \"no value\". It isn't zero or an empty string, and it isn't equal to anything, not even another <code>NULL</code>. <code>rating = NULL</code> is never true. Use <code>IS NULL</code> and <code>IS NOT NULL</code>." },
      { t: "quiz", q: "Which query finds games that don't have a rating yet?", opts: ["WHERE rating = NULL", "WHERE rating IS NULL", "WHERE rating = 0", "WHERE rating = ''"], a: 1, why: "Any comparison with NULL using = gives NULL (unknown), which WHERE treats as false. IS NULL is the only way to test for it." },
      { t: "sqlch", seed: GAMES_SEED, prompt: "Find the <code>title</code> and <code>genre</code> of every Racing, Puzzle or Strategy game released from 2020 to 2024, using <code>IN</code> and <code>BETWEEN</code>. Sort by title.", sql: "", solution: "SELECT title, genre\nFROM games\nWHERE genre IN ('Racing', 'Puzzle', 'Strategy')\n  AND release_year BETWEEN 2020 AND 2024\nORDER BY title;", tests: [
        { msg: "Uses IN (…)", fn: (t) => t.has(/\bIN\s*\(/i) },
        { msg: "Uses BETWEEN", fn: (t) => t.has(/\bBETWEEN\b/i) },
        { msg: "Returns the right games, sorted by title", fn: (t) => t.cols().join() === "title,genre" && t.expect("SELECT title, genre FROM games WHERE genre IN ('Racing','Puzzle','Strategy') AND release_year >= 2020 AND release_year <= 2024 ORDER BY title", { ordered: true }) },
      ] },
      { t: "h", h: "COUNT and AS" },
      { t: "p", h: "<b>Aggregate functions</b> squash many rows into one value: <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>. Name the result with <code>AS</code>." },
      { t: "code", lang: "sql", code: `SELECT COUNT(*) AS total_games FROM games;            -- counts rows
SELECT COUNT(rating) AS rated_games FROM games;        -- counts non-NULL ratings only
SELECT ROUND(AVG(price), 2) AS avg_price, MAX(price) AS most_expensive FROM games;` },
      { t: "quiz", q: "<code>games</code> has 16 rows and 2 have a NULL rating. What does <code>SELECT COUNT(rating) FROM games</code> return?", opts: ["16", "14", "2"], a: 1, why: "<code>COUNT(column)</code> skips NULLs. <code>COUNT(*)</code> counts rows, so it would return 16." },
      { t: "sqlch", seed: GAMES_SEED, prompt: "How many games were released in 2024 or later? Return a single column called <code>new_releases</code>.", sql: "", solution: "SELECT COUNT(*) AS new_releases\nFROM games\nWHERE release_year >= 2024;", tests: [
        { msg: "One column called new_releases", fn: (t) => t.cols().join() === "new_releases" },
        { msg: "One row with the right count", fn: (t) => !!t.last && t.last.rows.length === 1 && t.last.rows[0][0] === 6 },
        { msg: "Uses COUNT", fn: (t) => t.has(/COUNT\s*\(/i) },
      ] },
      { t: "h", h: "Challenges" },
      { t: "sqlplay", seed: GAMES_SEED, sql: "-- 1. The three highest-rated games that are in stock\n\n-- 2. The average price of Switch games, rounded to 2 decimal places\n\n-- 3. Every game whose title contains the word 'of' (any case)\n", task: "Write a query under each comment. Run them all at once: you'll see one result per statement." },
      { t: "h", h: "Manipulating data: INSERT" },
      { t: "code", lang: "sql", code: `INSERT INTO games (title, genre, platform, price, release_year)
VALUES ('Cosmic Chef', 'Simulation', 'Switch', 29.99, 2026);

-- several rows at once
INSERT INTO games (title, genre, platform, price) VALUES
  ('Lantern Lake', 'Adventure', 'PC', 19.99),
  ('Byte Brawlers', 'Action', 'Xbox', 39.99)
RETURNING id, title;     -- PostgreSQL can hand back the new rows` },
      { t: "p", h: "List the columns you're filling. Columns you leave out get their <code>DEFAULT</code> (<code>in_stock</code> becomes <code>true</code>) or <code>NULL</code>, and <code>id</code> is generated for you." },
      { t: "sqlch", seed: GAMES_SEED, prompt: "GameVault just added <b>Cosmic Chef</b>: a <code>Simulation</code> game for <code>Switch</code> costing <code>29.99</code>, released in <code>2026</code>, not yet rated. Insert it, then select it back.", sql: "", solution: "INSERT INTO games (title, genre, platform, price, release_year)\nVALUES ('Cosmic Chef', 'Simulation', 'Switch', 29.99, 2026);\n\nSELECT * FROM games WHERE title = 'Cosmic Chef';", tests: [
        { msg: "The table now has 17 games", fn: (t) => t.rows("SELECT COUNT(*) AS n FROM games")[0].n === 17 },
        { msg: "Cosmic Chef has the right genre, platform, price and year", fn: (t) => { const r = t.rows("SELECT * FROM games WHERE title = 'Cosmic Chef'")[0]; return !!r && r.genre === "Simulation" && r.platform === "Switch" && r.price === 29.99 && r.release_year === 2026; } },
        { msg: "Its id was generated (17) and in_stock used the default", fn: (t) => { const r = t.rows("SELECT * FROM games WHERE title = 'Cosmic Chef'")[0]; return !!r && r.id === 17 && r.in_stock === true && r.rating === null; } },
        { msg: "Your last query selects it back", fn: (t) => !!t.last && t.last.rows.length === 1 && t.last.rows[0].includes("Cosmic Chef") },
      ] },
      { t: "h", h: "UPDATE and DELETE" },
      { t: "code", lang: "sql", code: `UPDATE games SET price = 44.99 WHERE id = 2;
UPDATE games SET price = price * 0.8, in_stock = true WHERE genre = 'Racing';
DELETE FROM games WHERE price IS NULL;` },
      { t: "callout", kind: "warn", h: "<b>An UPDATE or DELETE without WHERE changes every row.</b> <code>DELETE FROM games;</code> empties the table. Write the <code>WHERE</code> first, test it with a <code>SELECT</code>, then turn it into the UPDATE or DELETE." },
      { t: "sqlch", seed: GAMES_SEED, prompt: "Run a sale and tidy up: give every <b>Racing</b> game a 20% discount (<code>price * 0.8</code>), put <b>Sky Knights</b> back in stock, and delete games that have no price.", sql: "", solution: "UPDATE games SET price = price * 0.8 WHERE genre = 'Racing';\nUPDATE games SET in_stock = true WHERE title = 'Sky Knights';\nDELETE FROM games WHERE price IS NULL;", tests: [
        { msg: "Racing games are 20% cheaper (Turbo Kart Legends: 39.99)", fn: (t) => { const r = t.rows("SELECT title, price FROM games WHERE genre = 'Racing' ORDER BY id"); return r.length === 3 && r[0].price === 39.99 && r[1].price === 31.99 && r[2].price === 7.99; } },
        { msg: "Other games keep their prices", fn: (t) => t.rows("SELECT price FROM games WHERE title = 'Starfall Odyssey'")[0].price === 59.99 && t.rows("SELECT COUNT(*) AS n FROM games WHERE genre <> 'Racing' AND price IS NOT NULL")[0].n === 12 },
        { msg: "Sky Knights is in stock", fn: (t) => t.rows("SELECT in_stock FROM games WHERE title = 'Sky Knights'")[0].in_stock === true },
        { msg: "Word Quest (no price) is deleted, and nothing else", fn: (t) => t.rows("SELECT COUNT(*) AS n FROM games")[0].n === 15 && t.rows("SELECT COUNT(*) AS n FROM games WHERE title = 'Word Quest'")[0].n === 0 },
      ] },
      { t: "recap", items: ["<code>SELECT cols FROM table WHERE … ORDER BY … LIMIT …</code>", "AND, OR, NOT (with brackets), IN, BETWEEN, LIKE / ILIKE", "NULL needs <code>IS NULL</code>; <code>COUNT(col)</code> skips NULLs", "Aggregates: COUNT, SUM, AVG, MIN, MAX, named with AS", "INSERT INTO … VALUES …; UPDATE … SET … WHERE …; DELETE FROM … WHERE …", "Always check the WHERE before UPDATE or DELETE"] },
    ]},

    /* ───────────────────────── Creating and Joining Tables ───────────────────────── */
    { id: "db-joins", title: "Creating and Joining Tables", min: 130, kind: "lesson", body: [
      { t: "h", h: "Why multiple tables?" },
      { t: "p", h: "Imagine one giant <code>orders</code> table that repeats the customer's name, email and country on every order. Change an email and you must update dozens of rows, and miss one and the data disagrees with itself. Instead, store each fact <b>once</b> and link tables with <b>keys</b>. This is called <b>normalisation</b>." },
      { t: "diagram", name: "store-erd" },
      { t: "steps", items: [
        "A <b>primary key</b> (PK) uniquely identifies each row: <code>customers.id</code>",
        "A <b>foreign key</b> (FK) is a column that points at another table's primary key: <code>orders.customer_id → customers.id</code>",
        "The database <b>enforces</b> foreign keys: you can't create an order for a customer who doesn't exist",
        "<b>One-to-many</b>: one customer has many orders. <b>Many-to-many</b>: orders contain many games and games appear in many orders, so a <b>join table</b> (<code>order_items</code>) sits between them",
      ] },
      { t: "h", h: "Creating tables" },
      { t: "code", lang: "sql", code: `CREATE TABLE customers (
  id SERIAL PRIMARY KEY,                 -- auto-incrementing integer
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  country TEXT,
  joined DATE DEFAULT CURRENT_DATE
);

CREATE TABLE orders (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- the modern way to write SERIAL
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  order_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'cancelled'))
);` },
      { t: "steps", items: [
        "<b>Types</b>: <code>INTEGER</code>, <code>NUMERIC(6,2)</code> for money (never floats), <code>TEXT</code>, <code>VARCHAR(50)</code>, <code>BOOLEAN</code>, <code>DATE</code>, <code>TIMESTAMP</code>",
        "<b>Constraints</b> are rules the database enforces: <code>PRIMARY KEY</code>, <code>NOT NULL</code>, <code>UNIQUE</code>, <code>DEFAULT</code>, <code>CHECK (…)</code>, <code>REFERENCES</code>",
        "Constraints are your last line of defence: even buggy app code can't save bad data",
      ] },
      { t: "sqlch", seed: STORE_SEED, prompt: "Create a <code>reviews</code> table with: <code>id</code> (auto-generated primary key), <code>game_id</code> (required, references <code>games</code>), <code>customer_id</code> (references <code>customers</code>), <code>stars</code> (an integer that must be between 1 and 5), and <code>body</code> (text). Then insert two reviews.", sql: "CREATE TABLE reviews (\n\n);\n", solution: "CREATE TABLE reviews (\n  id SERIAL PRIMARY KEY,\n  game_id INTEGER NOT NULL REFERENCES games(id),\n  customer_id INTEGER REFERENCES customers(id),\n  stars INTEGER CHECK (stars BETWEEN 1 AND 5),\n  body TEXT\n);\n\nINSERT INTO reviews (game_id, customer_id, stars, body) VALUES\n  (1, 1, 5, 'Gorgeous world, great story.'),\n  (4, 4, 4, 'Relaxing and surprisingly deep.');", tests: [
        { msg: "reviews has id, game_id, customer_id, stars and body", fn: (t) => { const s = t.db.schema().find((x) => x.name === "reviews"); return !!s && ["id", "game_id", "customer_id", "stars", "body"].every((c) => s.cols.some((x) => x.name === c)); } },
        { msg: "id is a generated primary key", fn: (t) => { const s = t.db.schema().find((x) => x.name === "reviews"); if (!s || !s.cols.find((c) => c.name === "id").pk) return false; try { t.db.exec("INSERT INTO reviews (game_id, stars) VALUES (2, 3)"); return t.rows("SELECT MAX(id) AS m FROM reviews")[0].m >= 1; } catch (e) { return false; } } },
        { msg: "game_id is required and must reference a real game", fn: (t) => { if (!t.db.tables.reviews) return false; const bad = (q) => { try { t.db.exec(q); return false; } catch (e) { return true; } }; return bad("INSERT INTO reviews (game_id, stars) VALUES (999, 3)") && bad("INSERT INTO reviews (customer_id, stars) VALUES (1, 3)"); } },
        { msg: "stars must be between 1 and 5", fn: (t) => { if (!t.db.tables.reviews) return false; const bad = (q) => { try { t.db.exec(q); return false; } catch (e) { return true; } }; return bad("INSERT INTO reviews (game_id, stars) VALUES (1, 6)") && bad("INSERT INTO reviews (game_id, stars) VALUES (1, 0)"); } },
        { msg: "Two reviews were inserted", fn: (t) => { try { return t.rows("SELECT COUNT(*) AS n FROM reviews")[0].n >= 2; } catch (e) { return false; } } },
      ] },
      { t: "h", h: "Altering tables" },
      { t: "code", lang: "sql", code: `ALTER TABLE games ADD COLUMN discount NUMERIC(4,2) DEFAULT 0;
ALTER TABLE games RENAME COLUMN release_year TO year;
ALTER TABLE games DROP COLUMN rating;
ALTER TABLE games ALTER COLUMN genre SET NOT NULL;
ALTER TABLE games RENAME TO products;
DROP TABLE reviews;            -- deletes the table and all its rows` },
      { t: "callout", kind: "warn", h: "<code>DROP TABLE</code> and <code>DROP COLUMN</code> delete data permanently. In real projects, schema changes go through <b>migrations</b> that are reviewed and tested before they touch production." },
      { t: "h", h: "Joins" },
      { t: "p", h: "A <b>join</b> combines rows from two tables where a condition matches, usually a foreign key equal to a primary key. The result has columns from both." },
      { t: "video", name: "sql-join" },
      { t: "code", lang: "sql", code: `SELECT orders.id, customers.name, orders.order_date
FROM orders
JOIN customers ON orders.customer_id = customers.id;   -- JOIN means INNER JOIN

-- aliases keep it short
SELECT o.id, c.name, o.order_date
FROM orders AS o
JOIN customers AS c ON o.customer_id = c.id;` },
      { t: "callout", kind: "tip", h: "When two tables share a column name, like <code>id</code>, say which one you mean: <code>o.id</code> or <code>c.id</code>. Otherwise PostgreSQL stops with \"column reference is ambiguous\"." },
      { t: "sqlch", seed: STORE_SEED, prompt: "List every order's <code>id</code>, the customer's <code>name</code>, and the <code>order_date</code>, newest first. Name the columns <code>order_id</code>, <code>name</code> and <code>order_date</code>.", sql: "", solution: "SELECT o.id AS order_id, c.name, o.order_date\nFROM orders AS o\nJOIN customers AS c ON o.customer_id = c.id\nORDER BY o.order_date DESC;", tests: [
        { msg: "Columns are order_id, name, order_date", fn: (t) => t.cols().join() === "order_id,name,order_date" },
        { msg: "Uses a JOIN … ON", fn: (t) => t.has(/\bJOIN\b.+\bON\b/i) },
        { msg: "All 10 orders with the right customer, newest first", fn: (t) => t.expect("SELECT o.id, c.name, o.order_date FROM orders o JOIN customers c ON o.customer_id = c.id ORDER BY o.order_date DESC", { ordered: true }) },
      ] },
      { t: "h", h: "LEFT, RIGHT and FULL joins" },
      { t: "gif", name: "join-types" },
      { t: "steps", items: [
        "<b>INNER JOIN</b>: only rows that match on both sides",
        "<b>LEFT JOIN</b>: every row from the left table, with NULLs where the right side has no match. Perfect for \"customers and their orders, including customers with none\"",
        "<b>RIGHT JOIN</b>: the mirror image (most people rewrite it as a LEFT JOIN with the tables swapped)",
        "<b>FULL JOIN</b>: everything from both sides, matched where possible",
      ] },
      { t: "sqlch", seed: STORE_SEED, prompt: "Find customers who have <b>never</b> placed an order. Return just their <code>name</code>.", sql: "", solution: "SELECT c.name\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nWHERE o.id IS NULL;", tests: [
        { msg: "Returns one column, name", fn: (t) => t.cols().join() === "name" },
        { msg: "Exactly Sofia Rossi and Arjun Mehta", fn: (t) => t.expect("SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)") },
        { msg: "Uses a LEFT JOIN (or a subquery)", fn: (t) => t.has(/LEFT\s+(OUTER\s+)?JOIN|NOT\s+IN\s*\(\s*SELECT|NOT\s+EXISTS/i) },
      ] },
      { t: "h", h: "Aggregates with GROUP BY" },
      { t: "p", h: "<code>GROUP BY</code> splits rows into groups and runs the aggregate once per group. <code>HAVING</code> filters groups, the way <code>WHERE</code> filters rows." },
      { t: "code", lang: "sql", code: `SELECT genre, COUNT(*) AS games, ROUND(AVG(price), 2) AS avg_price
FROM games
GROUP BY genre
HAVING COUNT(*) > 1
ORDER BY games DESC;` },
      { t: "callout", kind: "key", h: "Every column in the SELECT list must either be in the <code>GROUP BY</code> or be inside an aggregate. PostgreSQL won't guess which one of a group's many titles you meant." },
      { t: "quiz", q: "What's the difference between WHERE and HAVING?", opts: ["They're interchangeable", "WHERE filters rows before grouping; HAVING filters groups after aggregating", "HAVING is faster"], a: 1, why: "You can't use <code>COUNT(*)</code> in WHERE, because the groups don't exist yet when WHERE runs." },
      { t: "sqlch", seed: STORE_SEED, prompt: "For every customer, show their <code>name</code> and how many orders they've placed as <code>order_count</code>, including customers with 0 orders. Most orders first, then by name.", sql: "", solution: "SELECT c.name, COUNT(o.id) AS order_count\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nGROUP BY c.name\nORDER BY order_count DESC, c.name;", tests: [
        { msg: "Columns are name and order_count", fn: (t) => t.cols().join() === "name,order_count" },
        { msg: "All 8 customers, including those with 0 orders", fn: (t) => !!t.last && t.last.rows.length === 8 && t.last.rows.some((r) => r[1] === 0) },
        { msg: "Counts are right and sorted", fn: (t) => t.expect("SELECT c.name, COUNT(o.id) AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.name ORDER BY order_count DESC, c.name", { ordered: true }) },
      ] },
      { t: "h", h: "Joining multiple tables" },
      { t: "p", h: "Chain joins to walk across the schema. To see which games each customer bought: customers → orders → order_items → games." },
      { t: "code", lang: "sql", code: `SELECT c.name, g.title, oi.quantity
FROM customers AS c
JOIN orders AS o       ON o.customer_id = c.id
JOIN order_items AS oi ON oi.order_id = o.id
JOIN games AS g        ON g.id = oi.game_id
WHERE o.status = 'shipped'
ORDER BY c.name;` },
      { t: "sqlch", seed: STORE_SEED, prompt: "Which games earn the most? For each game <code>title</code>, total the revenue (<code>quantity * unit_price</code>) as <code>revenue</code>, ignoring <b>cancelled</b> orders. Only show games with revenue over 50, highest first.", sql: "", solution: "SELECT g.title, SUM(oi.quantity * oi.unit_price) AS revenue\nFROM order_items AS oi\nJOIN orders AS o ON o.id = oi.order_id\nJOIN games AS g ON g.id = oi.game_id\nWHERE o.status <> 'cancelled'\nGROUP BY g.title\nHAVING SUM(oi.quantity * oi.unit_price) > 50\nORDER BY revenue DESC;", tests: [
        { msg: "Columns are title and revenue", fn: (t) => t.cols().join() === "title,revenue" },
        { msg: "Joins three tables", fn: (t) => (t.src.match(/\bJOIN\b/gi) || []).length >= 2 },
        { msg: "Leaves out cancelled orders and filters with HAVING", fn: (t) => t.has(/\bHAVING\b/i) && !!t.last && !t.last.rows.some((r) => r[0] === "Shadow Protocol" && Math.abs(r[1] - 139.98) < 0.01) },
        { msg: "Correct totals, highest first", fn: (t) => t.expect("SELECT g.title, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN games g ON g.id = oi.game_id WHERE o.status <> 'cancelled' GROUP BY g.title HAVING SUM(oi.quantity * oi.unit_price) > 50 ORDER BY revenue DESC", { ordered: true }) },
      ] },
      { t: "sqlplay", seed: STORE_SEED, sql: "-- Explore the whole store. Click \"browse\" on a table to see its rows.\nSELECT c.country, COUNT(DISTINCT c.id) AS customers, COUNT(o.id) AS orders\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nGROUP BY c.country\nORDER BY orders DESC;", task: "Try: which month had the most orders? (Hint: <code>LEFT(order_date::text, 7)</code> gives \"2025-03\".) Or delete an order and watch its order_items disappear thanks to <code>ON DELETE CASCADE</code>." },
      { t: "h", h: "A primer on SQL injection" },
      { t: "p", h: "The most famous database attack happens when an app builds SQL by gluing user input into a string. The input stops being data and becomes part of the query. Try it: log in as <code>ada</code> without knowing her password." },
      { t: "sqlinj", seed: USERS_SEED },
      { t: "p", h: "The fix is a <b>parameterised query</b>. The SQL and the values travel to the database separately, so input is always treated as a value, never as SQL. Every driver supports it, and ORMs do it for you." },
      { t: "code", lang: "javascript", code: `// ✗ vulnerable: input becomes part of the SQL
const sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
await pool.query(sql)

// ✓ safe: $1 and $2 are placeholders; the values are sent separately
await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password])` },
      { t: "callout", kind: "warn", h: "Two more rules from that demo: never store plain-text passwords (store a slow hash such as bcrypt or argon2), and give your app's database user only the permissions it needs." },
      { t: "quiz", q: "Which change actually prevents SQL injection?", opts: ["Escaping quotes with a regex", "Hiding error messages", "Parameterised queries (placeholders like $1)", "Making the input box shorter"], a: 2, why: "With parameters, the database never parses the input as SQL. Hand-written escaping misses edge cases, and the others don't address the cause at all." },
      { t: "recap", items: ["Store each fact once; link tables with primary and foreign keys", "CREATE TABLE with types and constraints: PK, NOT NULL, UNIQUE, DEFAULT, CHECK, REFERENCES", "ALTER TABLE to add, rename and drop columns; DROP TABLE removes everything", "INNER JOIN for matches; LEFT JOIN to keep every left row (find missing matches with IS NULL)", "GROUP BY + aggregates; HAVING filters groups", "Never concatenate user input into SQL: use parameterised queries"] },
    ]},
  ],
};
