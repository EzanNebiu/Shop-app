const mysql2 = require('mysql2');
const readline = require('readline');

const connection = mysql2.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'shop_163'
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function addProduct() {
    console.log('\n=== Add New Product ===\n');

    const emri = await question('Product Name: ');
    const pershkrimi = await question('Product Description: ');
    const cmimi = await question('Price (in euros): ');
    const stoku = await question('Stock Quantity: ');
    const foto = await question('Image URL (or press Enter for default): ');

    const defaultImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
    const imageUrl = foto.trim() || defaultImage;

    const query = `
        INSERT INTO produktet (emri, pershkrimi, cmimi, stoku, foto) 
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(query, [emri, pershkrimi, parseFloat(cmimi), parseInt(stoku), imageUrl], function(err, results) {
        if (err) {
            console.log('\n❌ Error adding product:', err.message);
        } else {
            console.log('\n✅ Product added successfully!');
            console.log('Product ID:', results.insertId);
            console.log('\nProduct Details:');
            console.log('- Name:', emri);
            console.log('- Price: €' + cmimi);
            console.log('- Stock:', stoku);
        }

        rl.question('\nAdd another product? (y/n): ', function(answer) {
            if (answer.toLowerCase() === 'y') {
                addProduct();
            } else {
                console.log('\n👋 Goodbye!\n');
                rl.close();
                connection.end();
            }
        });
    });
}

connection.connect(function(err) {
    if (err) {
        console.log('❌ Database connection error:', err.message);
        console.log('Make sure MySQL is running and shop_163 database exists.');
        process.exit(1);
    }

    console.log('✅ Connected to database');
    addProduct();
});
