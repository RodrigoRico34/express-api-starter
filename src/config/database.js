// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'dev.sqlite');

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Could not connect to sqlite', err);
        process.exit(1);
    }
    console.log('Connected to sqlite database:', dbFile);
});

// Initialize pizzas table if not exists
const initPizzasSql = `
    CREATE TABLE IF NOT EXISTS pizzas (
                                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                                          name TEXT NOT NULL,
                                          ingredients TEXT,
                                          imageUrl TEXT,
                                          price REAL NOT NULL,
                                          created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
        );
`;

// Initialize ingredients table if not exists
const initIngredientsSql = `
    CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );
`;

db.serialize(() => {
    db.run(initPizzasSql, (err) => {
        if (err) {
            console.error('Failed to initialize pizzas table', err);
            process.exit(1);
        }

        // Seed a few pizzas on first run (empty table only)
        db.get('SELECT COUNT(*) AS count FROM pizzas', (countErr, row) => {
            if (countErr) {
                console.error('Failed to check pizzas table', countErr);
                return;
            }
            if (row.count === 0) {
                const seedSql = `
                    INSERT INTO pizzas (name, ingredients, imageUrl, price)
                    VALUES (?, ?, ?, ?)
                `;
                const seedData = [
                    ['Pizza du moment', 'Sauce de tomates jaunes, bresaola, copeaux de parmesan, rucola, tomates cerises, mozzarella fior di latte.', 'https://picsum.photos/200?1', 20],
                    ['Margherita', 'Mozzarella', '', 12],
                    ['4 Saisons', 'Jambon, champignons frais, poivrons, artichauts, mozzarella', '', 17],
                ];
                const stmt = db.prepare(seedSql);
                seedData.forEach((pizza) => stmt.run(pizza));
                stmt.finalize();
            }
        });
    });

    db.run(initIngredientsSql, (err) => {
        if (err) {
            console.error('Failed to initialize ingredients table', err);
            process.exit(1);
        }

        // Seed a few ingredients on first run (empty table only)
        db.get('SELECT COUNT(*) AS count FROM ingredients', (countErr, row) => {
            if (countErr) {
                console.error('Failed to check ingredients table', countErr);
                return;
            }
            if (row.count === 0) {
                const seedSql = `
                    INSERT INTO ingredients (name, price)
                    VALUES (?, ?)
                `;
                const seedData = [
                    ['Champignons', 1],
                    ['Oignons', 1],
                    ['Jambon', 2],
                    ['Lardons', 2],
                ];
                const stmt = db.prepare(seedSql);
                seedData.forEach((ingredient) => stmt.run(ingredient));
                stmt.finalize();
            }
        });
    });
});

module.exports = db;