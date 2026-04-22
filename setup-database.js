const mysql2 = require('mysql2');

// First connect without database to create it
const connection = mysql2.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    multipleStatements: true
});

connection.connect(function(err) {
    if (err) {
        console.log("Error connecting to MySQL:", err.message);
        console.log("\nMake sure MySQL is running on localhost:3306");
        process.exit(1);
    }

    console.log("Connected to MySQL");

    const setupSQL = `
        -- Create the database
        CREATE DATABASE IF NOT EXISTS shop_163;
        USE shop_163;

        -- Create perdoruesit (users) table
        CREATE TABLE IF NOT EXISTS perdoruesit (
            id INT AUTO_INCREMENT PRIMARY KEY,
            emri VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            fjalekalimi VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create produktet (products) table
        CREATE TABLE IF NOT EXISTS produktet (
            id INT AUTO_INCREMENT PRIMARY KEY,
            emri VARCHAR(255) NOT NULL,
            pershkrimi TEXT,
            cmimi DECIMAL(10, 2) NOT NULL,
            stoku INT NOT NULL DEFAULT 0,
            foto VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create blerjet (purchases) table
        CREATE TABLE IF NOT EXISTS blerjet (
            id INT AUTO_INCREMENT PRIMARY KEY,
            perdoruesi_id INT NOT NULL,
            produkti_id INT NOT NULL,
            sasia INT NOT NULL,
            cmimi_total DECIMAL(10, 2) NOT NULL,
            data_e_blerjes TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (perdoruesi_id) REFERENCES perdoruesit(id),
            FOREIGN KEY (produkti_id) REFERENCES produktet(id)
        );

        -- Insert sample products
        INSERT INTO produktet (emri, pershkrimi, cmimi, stoku, foto) VALUES
        ('Laptop HP', 'Laptop i fuqishem per pune dhe lojera', 899.99, 15, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
        ('iPhone 15 Pro', 'Telefon i ri me kamera te avancuar', 1199.99, 25, 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400'),
        ('Samsung Galaxy S24', 'Smartphone Android i fundit', 999.99, 20, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'),
        ('MacBook Pro', 'Laptop profesional per krijues', 2499.99, 10, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'),
        ('Sony Headphones', 'Kufje me noise cancellation', 349.99, 30, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
        ('iPad Air', 'Tablet i lehte dhe i shpejte', 599.99, 18, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'),
        ('Gaming Mouse', 'Mouse per gaming me RGB', 79.99, 50, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
        ('Mechanical Keyboard', 'Tastiere mekanike per gaming', 149.99, 35, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'),
        ('Monitor 4K', 'Monitor 27 inch 4K', 449.99, 12, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
        ('Webcam HD', 'Kamera per video calls', 89.99, 40, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400');
    `;

    connection.query(setupSQL, function(err, results) {
        if (err) {
            console.log("Error setting up database:", err.message);
            connection.end();
            process.exit(1);
        }

        console.log("\n✓ Database 'shop_163' created successfully");
        console.log("✓ Tables created: perdoruesit, produktet, blerjet");
        console.log("✓ Sample products inserted");
        console.log("\nSetup complete! You can now run: npm start");

        connection.end();
    });
});
