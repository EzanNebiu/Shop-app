-- ADD NEW PRODUCTS TO YOUR SHOP
-- You can run these SQL queries directly in MySQL or phpMyAdmin

-- Method 1: Add a single product
INSERT INTO produktet (emri, pershkrimi, cmimi, stoku, foto) 
VALUES (
    'Product Name',
    'Product description here',
    99.99,
    50,
    'https://images.unsplash.com/photo-example?w=400'
);

-- Method 2: Add multiple products at once
INSERT INTO produktet (emri, pershkrimi, cmimi, stoku, foto) VALUES
('Apple Watch Series 9', 'Smartwatch with health tracking and fitness features', 399.99, 30, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'),
('AirPods Pro', 'Wireless earbuds with active noise cancellation', 249.99, 45, 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400'),
('Dell XPS 13', 'Ultrabook laptop with 13-inch display', 1299.99, 12, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400'),
('Sony PlayStation 5', 'Next-gen gaming console', 499.99, 8, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400'),
('Canon EOS R6', 'Professional mirrorless camera', 2499.99, 5, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400');

-- Method 3: Update existing product
UPDATE produktet 
SET 
    emri = 'New Product Name',
    pershkrimi = 'New description',
    cmimi = 149.99,
    stoku = 100,
    foto = 'https://new-image-url.com'
WHERE id = 1;

-- Method 4: Delete a product
DELETE FROM produktet WHERE id = 5;

-- View all products
SELECT * FROM produktet;

-- View products that are out of stock
SELECT * FROM produktet WHERE stoku = 0;

-- View products sorted by price
SELECT * FROM produktet ORDER BY cmimi DESC;
