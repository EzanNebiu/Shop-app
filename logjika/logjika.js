const mysql2 = require('mysql2')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')

// A pool (instead of one shared connection) so purchase transactions from
// different users can't interleave, and a dropped connection doesn't kill the app.
const pool = mysql2.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'shop_163',
    waitForConnections: true,
    connectionLimit: 10
})

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "localhost",
    port: Number(process.env.EMAIL_PORT) || 1025,
    ignoreTLS: false
})

pool.getConnection(function (err, conn) {
    if (err) {
        console.log("Error databaza : ", err.message)
    } else {
        conn.release()
    }
})

const BCRYPT_ROUNDS = 10

function isBcryptHash(value) {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value)
}

// Escape user-controlled text before putting it into the HTML invoice email
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function parsePositiveInt(value) {
    const n = Number(value)
    return Number.isInteger(n) && n > 0 ? n : null
}

function faqjaKryesore(req, res) {
    let kerkimi = req.query.kerkimi
    let query = `SELECT * FROM produktet`
    let params = []

    if (kerkimi) {
        // Parameterised: the search box used to be injected straight into the SQL
        query = `SELECT * FROM produktet WHERE emri LIKE ?`
        params = [`%${kerkimi}%`]
    }

    pool.query(query, params, function (err, results) {
        if (err) {
            console.log("Error fetching products:", err.message)
            results = []
        }

        res.render('faqja_kryesore', {
            produktet: results || [],
            perdoruesi: req.session.perdoruesi ?? false,
            isLoggedIn: req.session.isLoggedIn ?? false
        })

    })
}

function produkti(req, res) {
    let produkti_id = parsePositiveInt(req.params.id)
    if (!produkti_id) {
        return res.status(404).render('404')
    }

    pool.query(`SELECT * FROM produktet WHERE id = ?`, [produkti_id], function (err, results) {
        if (!err && results[0]) {
            const p = results[0]
            const pershkrimi = String(p.pershkrimi || '').trim()
            res.locals.seo = Object.assign({}, res.locals.seo, {
                title: `${p.emri} – €${Number(p.cmimi).toFixed(2)} | ModernShop`,
                description: (pershkrimi ? pershkrimi + '. ' : '') + `Bli ${p.emri} online per €${Number(p.cmimi).toFixed(2)}.`,
                image: p.foto || undefined,
                ogType: 'product',
                jsonLd: {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: p.emri,
                    description: pershkrimi || p.emri,
                    image: p.foto || undefined,
                    sku: String(p.id),
                    offers: {
                        '@type': 'Offer',
                        price: Number(p.cmimi).toFixed(2),
                        priceCurrency: 'EUR',
                        availability: p.stoku > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        url: res.locals.seo && res.locals.seo.url
                    }
                }
            })
            res.render('produkti', {
                produkti: results[0],
                perdoruesi: req.session.perdoruesi ?? false,
                isLoggedIn: req.session.isLoggedIn ?? false
            })
        } else {
            if (err) console.log("Error fetching product:", err.message)
            res.status(404).render('404')
        }
    })
}

function regjistrohu(req, res) {
    let emri = (req.body.emri || '').trim()
    let email = (req.body.email || '').trim().toLowerCase()
    let password = req.body.password || ''

    if (!emri || !email || !password) {
        return res.send({
            error: true,
            mesazhi: "Plotesoni te gjitha fushat"
        })
    }

    pool.query(`SELECT id FROM perdoruesit WHERE email = ?`, [email], function (err, results) {
        if (err) {
            console.log("Error register:", err.message)
            return res.send({ error: true, mesazhi: "Regjistrimi deshtoj" })
        }

        if (results.length > 0) {
            // Emaila ekziston
            return res.send({
                error: true,
                mesazhi: "Emaila ekziston"
            })
        }

        // Passwords used to be stored in plain text
        bcrypt.hash(password, BCRYPT_ROUNDS, function (hashErr, hash) {
            if (hashErr) {
                return res.send({ error: true, mesazhi: "Regjistrimi deshtoj" })
            }

            pool.query(
                `INSERT INTO perdoruesit (emri, email, fjalekalimi) VALUES (?, ?, ?)`,
                [emri, email, hash],
                function (err2) {
                    if (err2) {
                        console.log("Error register:", err2.message)
                        return res.send({ error: true, mesazhi: "Regjistrimi deshtoj" })
                    }
                    res.send({
                        error: false,
                        mesazhi: "U regjistruat me sukses"
                    })
                }
            )
        })
    })
}

function kycu(req, res) {
    let email = (req.body.email || '').trim().toLowerCase()
    let password = req.body.password || ''

    const gabim = {
        error: true,
        mesazhi: 'Fjalekalimi ose emaila jane gabim'
    }

    // Login used to be `WHERE email = "${email}"`, so `" OR "1"="1` logged in as anyone
    pool.query(
        `SELECT id, emri, email, fjalekalimi FROM perdoruesit WHERE email = ?`,
        [email],
        function (err, results) {
            if (err || results.length == 0) {
                if (err) console.log("Error login:", err.message)
                return res.send(gabim)
            }

            const user = results[0]

            const finishLogin = function () {
                // Regenerate to avoid session fixation
                req.session.regenerate(function (regenErr) {
                    if (regenErr) {
                        return res.send({ error: true, mesazhi: 'Kycja deshtoj' })
                    }
                    req.session.isLoggedIn = true
                    req.session.perdoruesi = {
                        id: user.id,
                        emri: user.emri,
                        email: user.email
                    }
                    res.send({ error: false })
                })
            }

            if (isBcryptHash(user.fjalekalimi)) {
                bcrypt.compare(password, user.fjalekalimi, function (cmpErr, ok) {
                    if (cmpErr || !ok) return res.send(gabim)
                    finishLogin()
                })
            } else if (user.fjalekalimi === password) {
                // Older account with a plain-text password: let them in once and upgrade it to a hash
                bcrypt.hash(password, BCRYPT_ROUNDS, function (hashErr, hash) {
                    if (!hashErr) {
                        pool.query(`UPDATE perdoruesit SET fjalekalimi = ? WHERE id = ?`, [hash, user.id], function () {})
                    }
                    finishLogin()
                })
            } else {
                res.send(gabim)
            }
        }
    )
}

function ndryshoProfilin(req, res) {
    // Used to crash the server (req.session.perdoruesi.id of null) when not logged in
    if (!req.session.isLoggedIn || !req.session.perdoruesi) {
        return res.send({
            error: true,
            mesazhi: "Ju lutem kycuni"
        })
    }

    let emri = (req.body.emri || '').trim()
    let email = (req.body.email || '').trim().toLowerCase()
    let password = req.body.password || ''
    const id = req.session.perdoruesi.id

    if (!emri || !email) {
        return res.send({ error: true, mesazhi: "Emri dhe emaila jane te detyrueshme" })
    }

    const ruaj = function (hash) {
        let query = `UPDATE perdoruesit SET emri = ?, email = ? WHERE id = ?`
        let params = [emri, email, id]

        if (hash) {
            query = `UPDATE perdoruesit SET emri = ?, email = ?, fjalekalimi = ? WHERE id = ?`
            params = [emri, email, hash, id]
        }

        pool.query(query, params, function (err) {
            if (err) {
                return res.send({
                    error: true,
                    mesazhi: err.code === 'ER_DUP_ENTRY' ? "Emaila ekziston" : "Ndryshimi i profilit deshtoj"
                })
            }

            req.session.perdoruesi.emri = emri
            req.session.perdoruesi.email = email

            res.send({
                error: false,
                mesazhi: "Profili u ndryshua me sukses"
            })
        })
    }

    if (password == "") {
        ruaj(null)
    } else {
        bcrypt.hash(password, BCRYPT_ROUNDS, function (hashErr, hash) {
            if (hashErr) {
                return res.send({ error: true, mesazhi: "Ndryshimi i profilit deshtoj" })
            }
            ruaj(hash)
        })
    }
}

function blejProduktin(req, res) {
    if (!req.session.isLoggedIn) {
        return res.send({
            error: true,
            redirect: true,
            mesazhi: ""
        })
    }

    const deshtoj = function (mesazhi) {
        res.send({
            error: true,
            redirect: false,
            mesazhi: mesazhi || "Blerja deshtoj"
        })
    }

    let produkti_id = parsePositiveInt(req.body.produkti_id)
    let sasia = parsePositiveInt(req.body.sasia)
    let perdoruesi_id = req.session.perdoruesi.id

    if (!produkti_id || !sasia) {
        return deshtoj("Sasia ose produkti jane te pavlefshme")
    }

    // The price used to come from the browser (req.body.cmimi), so anyone could buy at any price,
    // and stock was never checked. Now the price comes from the database and the stock check,
    // order and stock update happen in one transaction.
    pool.getConnection(function (connErr, conn) {
        if (connErr) {
            console.log("Error blerja:", connErr.message)
            return deshtoj()
        }

        const rollback = function (mesazhi, err) {
            if (err) console.log("Error blerja:", err.message)
            conn.rollback(function () {
                conn.release()
                deshtoj(mesazhi)
            })
        }

        conn.beginTransaction(function (txErr) {
            if (txErr) {
                conn.release()
                return deshtoj()
            }

            conn.query(
                `SELECT cmimi, stoku FROM produktet WHERE id = ? FOR UPDATE`,
                [produkti_id],
                function (err0, produktet) {
                    if (err0) return rollback(null, err0)
                    if (!produktet[0]) return rollback("Produkti nuk ekziston")
                    if (produktet[0].stoku < sasia) return rollback("Nuk ka mjaftueshem ne stok")

                    const cmimi_total = Number(produktet[0].cmimi) * sasia

                    conn.query(
                        `INSERT INTO blerjet (perdoruesi_id, produkti_id, sasia, cmimi_total) VALUES (?, ?, ?, ?)`,
                        [perdoruesi_id, produkti_id, sasia, cmimi_total],
                        function (err1, results1) {
                            if (err1) return rollback(null, err1)
                            const blerja_id = results1.insertId

                            conn.query(
                                `UPDATE produktet SET stoku = stoku - ? WHERE id = ?`,
                                [sasia, produkti_id],
                                function (err2) {
                                    if (err2) return rollback(null, err2)

                                    conn.commit(function (commitErr) {
                                        if (commitErr) return rollback(null, commitErr)
                                        conn.release()

                                        res.send({
                                            error: false,
                                            blerja_id: blerja_id,
                                            mesazhi: "Blerja u perfundua me sukses"
                                        })

                                        dergoFaturen(blerja_id, req.session.perdoruesi)
                                    })
                                }
                            )
                        }
                    )
                }
            )
        })
    })
}

// Email the invoice after the purchase has been committed (a mail failure no longer affects the order)
function dergoFaturen(blerja_id, perdoruesi) {
    let query_fatura = `
        SELECT
            B.id AS blerja_id,
            B.sasia,
            B.cmimi_total,
            B.data_e_blerjes,
            P.id AS produkti_id,
            P.emri AS emri,
            P.foto
        FROM blerjet B
        INNER JOIN produktet P ON P.id = B.produkti_id
        WHERE B.id = ?
    `

    pool.query(query_fatura, [blerja_id], function (err, results) {
        if (err || !results[0]) {
            if (err) console.log("Error fatura:", err.message)
            return
        }

        results[0].perdoruesi = {
            emri: perdoruesi.emri,
            email: perdoruesi.email
        }

        const mail_options = {
            from: process.env.EMAIL_FROM || "shop@jcoders.com",
            to: perdoruesi.email,
            subject: "Fatura",
            html: gjeneroEmail(results[0])
        }

        transporter.sendMail(mail_options, function (error, info) {
            if (error) {
                console.log("Emaila deshtoj", error.message)
            } else {
                console.log("Fatura u dergua:", info.messageId)
            }
        })
    })
}


function gjeneroEmail(fatura) {
    const e = escapeHtml
    return `
            <div class="fatura">
                <div>
                    <img src="https://gjirafa50.com/Gjirafa50/Content/images/logo-2.svg" alt="" height="50">
                </div>

                <hr>

                <div>
                    <h4>Gjirafa50 SHPK</h4>
                    <p>Adresa: Prishtine, Cagllavice</p>
                    <p>Email: info@gjirafa50.com</p>
                </div>

                <hr>

                <div class="produkti-rresht">
                    <table>
                        <thead>
                            <th>ID</th>
                            <th>Foto</th>
                            <th>Produkti</th>
                            <th>Sasia</th>
                            <th>Cmimi</th>
                        </thead>

                        <tbody>
                            <tr>
                                <td>${e(fatura.produkti_id)}</td>
                                <td>
                                    <img src="${e(fatura.foto)}" width="30" height="30" alt="">
                                </td>

                                <td>${ e(fatura.emri) }</td>
                                <td>${ e(fatura.sasia) }</td>
                                <td>${ e(fatura.cmimi_total) } $</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr>

                <div>
                    <div class="totali">Totali: ${e(fatura.cmimi_total)} $</div>
                </div>

                <hr>

                <div>
                    <h4>Numri i fatures: # ${e(fatura.blerja_id)}</h4>
                    <p>Bleresi: ${ e(fatura.perdoruesi.emri) } </p>
                    <p>Email: ${ e(fatura.perdoruesi.email) } </p>
                    <p>Data: ${e(fatura.data_e_blerjes)}</p>
                </div>


            </div>


            <style>
                .fatura {
                    width: 60%;
                    background-color: white;
                    padding: 1%;
                    margin: 0 auto;
                }

                table {
                    width: 100%;
                }

                th {
                    text-align: left;
                }

                .totali {
                    background-color: orange;
                    color: white;
                    width: 20%;
                    font-size: 26px;
                    text-align: center;
                    padding: 1%;
                }

            </style>
            `
}


function fatura(req, res) {
    if (!req.session.isLoggedIn) {
        return res.redirect('/')
    }

    const blerja_id = parsePositiveInt(req.params.id)
    if (!blerja_id) {
        return res.status(404).render('404')
    }

    // Only the buyer can see their invoice (any logged-in user could open /fatura/<any id> before)
    let query = `
        SELECT
            B.id AS blerja_id,
            B.sasia,
            B.cmimi_total,
            B.data_e_blerjes,
            P.id AS produkti_id,
            P.emri AS emri,
            P.foto
        FROM blerjet B
        INNER JOIN produktet P ON P.id = B.produkti_id
        WHERE B.id = ? AND B.perdoruesi_id = ?
    `

    pool.query(query, [blerja_id, req.session.perdoruesi.id], function (err, results) {

        if (err || !results[0]) {
            if (err) console.log("Error fatura:", err.message)
            res.status(404).render('404')
        } else {
            res.render('fatura', {
                perdoruesi: req.session.perdoruesi,
                isLoggedIn: req.session.isLoggedIn,
                blerja: results[0]
            })
        }
    })
}

// Admin Functions
function adminDashboard(req, res) {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login')
    }

    // Get stats
    let statsQuery = `
        SELECT
            (SELECT COUNT(*) FROM produktet) as total_products,
            (SELECT COUNT(*) FROM perdoruesit) as total_users,
            (SELECT COUNT(*) FROM blerjet) as total_orders,
            (SELECT COALESCE(SUM(cmimi_total), 0) FROM blerjet) as total_revenue
    `

    pool.query(statsQuery, function(err, stats) {
        if (err) console.log("Error dashboard:", err.message)
        res.render('admin/dashboard', {
            stats: (stats && stats[0]) || { total_products: 0, total_users: 0, total_orders: 0, total_revenue: 0 },
            isAdmin: true
        })
    })
}

function adminLogin(req, res) {
    if (req.session.isAdmin) {
        return res.redirect('/admin')
    }
    res.render('admin/login')
}

function adminLoginPost(req, res) {
    let email = req.body.email
    let password = req.body.password

    // Simple admin check (you can make this more secure)
    if (email === 'admin@shop.com' && password === 'admin123') {
        req.session.isAdmin = true
        res.send({ error: false })
    } else {
        res.send({ error: true, mesazhi: 'Invalid admin credentials' })
    }
}

function adminProducts(req, res) {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login')
    }

    let query = 'SELECT * FROM produktet ORDER BY id DESC'

    pool.query(query, function(err, products) {
        if (err) console.log("Error products:", err.message)
        res.render('admin/products', {
            products: products || [],
            isAdmin: true
        })
    })
}

function adminAddProduct(req, res) {
    if (!req.session.isAdmin) {
        return res.send({ error: true, mesazhi: 'Unauthorized' })
    }

    let { emri, pershkrimi, cmimi, stoku, foto } = req.body

    let query = `INSERT INTO produktet (emri, pershkrimi, cmimi, stoku, foto)
                 VALUES (?, ?, ?, ?, ?)`

    pool.query(query, [emri, pershkrimi, cmimi, stoku, foto], function(err, results) {
        if (err) {
            res.send({ error: true, mesazhi: 'Failed to add product' })
        } else {
            res.send({ error: false, mesazhi: 'Product added successfully' })
        }
    })
}

function adminUpdateProduct(req, res) {
    if (!req.session.isAdmin) {
        return res.send({ error: true, mesazhi: 'Unauthorized' })
    }

    let { id, emri, pershkrimi, cmimi, stoku, foto } = req.body

    let query = `UPDATE produktet
                 SET emri = ?, pershkrimi = ?, cmimi = ?, stoku = ?, foto = ?
                 WHERE id = ?`

    pool.query(query, [emri, pershkrimi, cmimi, stoku, foto, id], function(err) {
        if (err) {
            res.send({ error: true, mesazhi: 'Failed to update product' })
        } else {
            res.send({ error: false, mesazhi: 'Product updated successfully' })
        }
    })
}

function adminDeleteProduct(req, res) {
    if (!req.session.isAdmin) {
        return res.send({ error: true, mesazhi: 'Unauthorized' })
    }

    let id = req.body.id

    let query = 'DELETE FROM produktet WHERE id = ?'

    pool.query(query, [id], function(err) {
        if (err) {
            // Products that already have orders can't be deleted (foreign key)
            res.send({
                error: true,
                mesazhi: err.code === 'ER_ROW_IS_REFERENCED_2'
                    ? 'Product has orders and cannot be deleted'
                    : 'Failed to delete product'
            })
        } else {
            res.send({ error: false, mesazhi: 'Product deleted successfully' })
        }
    })
}

function adminOrders(req, res) {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login')
    }

    let query = `
        SELECT
            B.id,
            B.sasia,
            B.cmimi_total,
            B.data_e_blerjes,
            P.emri as produkti_emri,
            U.emri as perdoruesi_emri,
            U.email as perdoruesi_email
        FROM blerjet B
        INNER JOIN produktet P ON B.produkti_id = P.id
        INNER JOIN perdoruesit U ON B.perdoruesi_id = U.id
        ORDER BY B.data_e_blerjes DESC
    `

    pool.query(query, function(err, orders) {
        if (err) console.log("Error orders:", err.message)
        res.render('admin/orders', {
            orders: orders || [],
            isAdmin: true
        })
    })
}

function adminUsers(req, res) {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login')
    }

    let query = 'SELECT id, emri, email, created_at FROM perdoruesit ORDER BY created_at DESC'

    pool.query(query, function(err, users) {
        if (err) console.log("Error users:", err.message)
        res.render('admin/users', {
            users: users || [],
            isAdmin: true
        })
    })
}

function adminLogout(req, res) {
    req.session.isAdmin = null
    res.redirect('/admin/login')
}

// User Orders Function
function userOrders(req, res) {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login')
    }

    const perdoruesi_id = req.session.perdoruesi.id

    let query = `
        SELECT
            B.id,
            B.sasia,
            B.cmimi_total,
            B.data_e_blerjes,
            P.id as produkti_id,
            P.emri as produkti_emri,
            P.foto as produkti_foto,
            P.cmimi as produkti_cmimi
        FROM blerjet B
        INNER JOIN produktet P ON B.produkti_id = P.id
        WHERE B.perdoruesi_id = ?
        ORDER BY B.data_e_blerjes DESC
    `

    pool.query(query, [perdoruesi_id], function(err, orders) {
        if (err) {
            console.log('Error fetching orders:', err)
            return res.render('404')
        }

        res.render('orders', {
            orders: orders,
            perdoruesi: req.session.perdoruesi,
            isLoggedIn: req.session.isLoggedIn
        })
    })
}

function sitemap(req, res, siteUrl) {
    pool.query('SELECT id, created_at FROM produktet ORDER BY id', function (err, produktet) {
        if (err) {
            console.log('Error sitemap:', err.message)
            produktet = []
        }
        const urls = [`  <url><loc>${siteUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`]
            .concat(produktet.map(function (p) {
                const lastmod = p.created_at ? `<lastmod>${new Date(p.created_at).toISOString().slice(0, 10)}</lastmod>` : ''
                return `  <url><loc>${siteUrl}/produkti/${p.id}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.8</priority></url>`
            }))
        res.type('application/xml').send(
            `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
        )
    })
}

module.exports = {
    sitemap,
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
}
