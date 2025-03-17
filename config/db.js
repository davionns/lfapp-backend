const mysql = require('mysql2');

class Database {
    constructor() {
        this.db = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Admin@123',
            database: 'lostandfound',
            port: 3306
        });

        this.db.connect((err) => {
            if (err) {
                console.error('Database connection failed:', err.stack);
                return;
            }
            console.log('Connected to MySQL database');
            this.createTables();
        });
    }

    async tableExists(tableName) {
        return new Promise((resolve, reject) => {
            this.db.query(
                `SHOW TABLES LIKE ?`,
                [tableName],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result.length > 0);
                    }
                }
            );
        });
    }

    async createTables() {
        const tables = [
            { name: 'users', query: `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NULL,
                student_id VARCHAR(20) NULL,
                email VARCHAR(100) NULL,
                password VARCHAR(255) NULL,
                role ENUM('student', 'admin') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved TINYINT(1) NULL,
                contact VARCHAR(20) NULL
            )` },

            { name: 'lost_items', query: `CREATE TABLE IF NOT EXISTS lost_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                category VARCHAR(50) NULL,
                description TEXT NULL,
                image LONGBLOB NULL,
                location VARCHAR(100) NULL,
                reward_value DECIMAL(10,2) NULL,
                sentimental_value VARCHAR(255) NULL,
                status ENUM('pending', 'approved') NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )` },

            { name: 'found_items', query: `CREATE TABLE IF NOT EXISTS found_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(50) NULL,
                description TEXT NULL,
                image LONGBLOB NULL,
                location VARCHAR(100) NULL,
                finder_contact VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('pending', 'claimed') NULL,
                claimed_by INT NULL
            )` },

            { name: 'notifications', query: `CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                message VARCHAR(255) NOT NULL,
                status ENUM('unread', 'read') NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )` },

            { name: 'user_settings', query: `CREATE TABLE IF NOT EXISTS user_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                notify_found_match TINYINT(1) NULL,
                notify_claimed TINYINT(1) NULL,
                publicize_lost_items TINYINT(1) NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )` }
        ];

        for (const table of tables) {
            const exists = await this.tableExists(table.name);
            if (exists) {
                console.log(`✅ Table '${table.name}' already exists.`);
            } else {
                this.db.query(table.query, (err, result) => {
                    if (err) {
                        console.error(`❌ Error creating table '${table.name}':`, err);
                    } else {
                        console.log(`🆕 Table '${table.name}' was created.`);
                    }
                });
            }
        }
    }
}

module.exports = new Database();
