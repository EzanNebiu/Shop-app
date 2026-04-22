const express = require('express');
const session = require('express-session');
const app = express();

const {
    faqjaKryesore,
    produkti,
    regjistrohu,
    kycu,
    ndryshoProfilin,
    blejProduktin,
    fatura,
    userOrders,
    adminDashboard,
    adminLogin,
    adminLoginPost,
    adminProducts,
    adminAddProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    adminOrders,
    adminUsers,
    adminLogout
} = require('./logjika/logjika');

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(express.json({ type: "*/*" }));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', 'faqet');

app.get('/', function(req, res) {
    faqjaKryesore(req, res);
});

app.get('/login', function(req, res) {
    if (req.session.isLoggedIn) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

app.post('/login', function(req, res) {
    kycu(req, res);
});

app.get('/register', function(req, res) {
    if (req.session.isLoggedIn) {
        res.redirect('/');
    } else {
        res.render('register');
    }
});

app.post('/register', function(req, res) {
    regjistrohu(req, res);
});

app.get('/produkti/:id', function(req, res) {
    produkti(req, res);
});

app.get('/logout', function(req, res) {
    req.session.isLoggedIn = null;
    req.session.perdoruesi = null;

    res.redirect('/');
});

app.get('/profili', function(req, res) {
    if (req.session.isLoggedIn) {
        res.render('profili', {
            perdoruesi: req.session.perdoruesi,
            isLoggedIn: req.session.isLoggedIn
        });
    } else {
        res.redirect('/');
    }
});

app.post('/ndrysho_profilin', function(req, res) {
    ndryshoProfilin(req, res);
});

app.post('/blej_produktin', function(req, res) {
    blejProduktin(req, res);
});

app.get('/fatura/:id', function(req, res) {
    fatura(req, res);
});

app.get('/orders', function(req, res) {
    userOrders(req, res);
});

// ==================== Admin Routes ====================
app.get('/admin/login', function(req, res) {
    adminLogin(req, res);
});

app.post('/admin/login', function(req, res) {
    adminLoginPost(req, res);
});

app.get('/admin', function(req, res) {
    adminDashboard(req, res);
});

app.get('/admin/products', function(req, res) {
    adminProducts(req, res);
});

app.post('/admin/products/add', function(req, res) {
    adminAddProduct(req, res);
});

app.post('/admin/products/update', function(req, res) {
    adminUpdateProduct(req, res);
});

app.post('/admin/products/delete', function(req, res) {
    adminDeleteProduct(req, res);
});

app.get('/admin/orders', function(req, res) {
    adminOrders(req, res);
});

app.get('/admin/users', function(req, res) {
    adminUsers(req, res);
});

app.get('/admin/logout', function(req, res) {
    adminLogout(req, res);
});

app.listen(3000, function() {
    console.log("Serveri u startua ne portin 3000");
});