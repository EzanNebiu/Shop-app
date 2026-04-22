const mysql2 = require('mysql2')
const nodemailer = require('nodemailer')

const connection = mysql2.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'shop_163'
})

const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    ignoreTLS: false
})

connection.connect(function (err) {
    if (err) {
        console.log("Error databaza : ", err.message)
    }
})

function faqjaKryesore(req, res) {
    let query = ``
    let kerkimi = req.query.kerkimi

    if (kerkimi) {
        query = `SELECT * FROM produktet WHERE emri LIKE '%${kerkimi}%'`
    } else {
        query = `SELECT * FROM produktet`
    }

    connection.query(query, function (err, results) {

        res.render('faqja_kryesore', {
            produktet: results,
            perdoruesi: req.session.perdoruesi ?? false,
            isLoggedIn: req.session.isLoggedIn ?? false
        })

    })
}

function produkti(req, res) {
    let produkti_id = req.params.id

    let query = `SELECT * FROM produktet WHERE id = ${produkti_id}`

    connection.query(query, function (err, results) {

        if (results[0]) {
            res.render('produkti', {
                produkti: results[0],
                perdoruesi: req.session.perdoruesi ?? false,
                isLoggedIn: req.session.isLoggedIn ?? false
            })
        } else {
            res.render('404')
        }
    })
}

function regjistrohu(req, res) {
    let emri = req.body.emri
    let email = req.body.email
    let password = req.body.password

    let query_email = `SELECT * FROM perdoruesit WHERE email = '${email}'`

    connection.query(query_email, function (err, results) {
        if (results.length > 0) {
            // Emaila ekziston
            res.send({
                error: true,
                mesazhi: "Emaila ekziston"
            })
        } else {
            let query_register = `INSERT INTO perdoruesit (emri, email, fjalekalimi) 
                                    VALUES('${emri}', '${email}', '${password}')`

            connection.query(query_register, function (err2, results2) {
                res.send({
                    error: false,
                    mesazhi: "U regjistruat me sukses"
                })
            })
        }
    })
}

function kycu(req, res) {
    let email = req.body.email
    let password = req.body.password

    let query_login = `SELECT id, emri, email FROM perdoruesit WHERE email = "${email}" AND fjalekalimi = "${password}"`

    connection.query(query_login, function (err, results) {
        if (results.length == 0) {
            res.send({
                error: true,
                mesazhi: 'Fjalekalimi ose emaila jane gabim'
            })
        } else {
            req.session.isLoggedIn = true
            req.session.perdoruesi = {
                id: results[0].id,
                emri: results[0].emri,
                email: results[0].email
            }

            res.send({
                error: false
            })
        }
    })
}

function ndryshoProfilin(req, res) {

    let emri = req.body.emri
    let email = req.body.email
    let password = req.body.password

    let query = ''

    if (password == "") {
        query = `UPDATE perdoruesit 
                SET 
                    emri = "${emri}", 
                    email = "${email}"
                WHERE id = ${req.session.perdoruesi.id}`
    } else {
        query = `UPDATE perdoruesit 
                SET 
                    emri = "${emri}", 
                    email = "${email}",
                    fjalekalimi = "${password}"
                WHERE id = ${req.session.perdoruesi.id}`
    }

    connection.query(query, function (err, results) {
        if (err) {
            res.send({
                error: true,
                mesazhi: "Ndryshimi i profilit deshtoj"
            })
        } else {

            req.session.perdoruesi.emri = emri
            req.session.perdoruesi.email = email

            res.send({
                error: false,
                mesazhi: "Profili u ndryshua me sukses"
            })
        }
    })
}

function blejProduktin(req, res) {
    if (!req.session.isLoggedIn) {
        return res.send({
            error: true,
            redirect: true,
            mesazhi: ""
        })
    }

    let produkti_id = req.body.produkti_id
    let sasia = req.body.sasia
    let cmimi = req.body.cmimi
    let cmimi_total = cmimi * sasia
    let perdoruesi_id = req.session.perdoruesi.id

    // Query 1
    // Me e insertu te dhanata e blerjes
    let query_blerja = `INSERT INTO blerjet (perdoruesi_id, produkti_id, sasia, cmimi_total) 
                            VALUES (${perdoruesi_id}, ${produkti_id}, ${sasia}, ${cmimi_total})`

    connection.query(query_blerja, function (err1, results1) {
        let blerja_id = results1.insertId

        let query_update =
            `UPDATE 
                produktet 
             SET stoku = stoku - ${sasia}
             WHERE id = ${produkti_id}
            `

        connection.query(query_update, function (err2, results2) {
            if (err2) {
                res.send({
                    error: true,
                    redirect: false,
                    mesazhi: "Blerja deshtoj"
                })
            } else {

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
                    WHERE B.id = ${blerja_id}
                `

                connection.query(query_fatura, function (err3, results3) {

                    results3[0].perdoruesi = {}
                    results3[0].perdoruesi = {
                        emri: req.session.perdoruesi.emri,
                        email: req.session.perdoruesi.email
                    }


                    const mail_options = {
                        from: "shop@jcoders.com",
                        to: req.session.perdoruesi.email,
                        subject: "Fatura",
                        html: gjeneroEmail(results3[0])
                    }
    
                    transporter.sendMail(mail_options, function (error, info) {
                        if (error) {
                            console.log("Emaila deshtoj", error)
                        } else {
                            console.log(info)
                        }
                    })
    
                    res.send({
                        error: false,
                        blerja_id: blerja_id,
                        mesazhi: "Blerja u perfundua me sukses"
                    })
                })
            }
        })
    })
}


function gjeneroEmail(fatura) {
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
                                <td>${fatura.produkti_id}</td>
                                <td>
                                    <img src="${fatura.foto}" width="30" height="30" alt="">
                                </td>

                                <td>${ fatura.emri }</td>
                                <td>${ fatura.sasia }</td>
                                <td>${ fatura.cmimi_total } $</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr>

                <div> 
                    <div class="totali">Totali: ${fatura.cmimi_total} $</div>
                </div>
                
                <hr>

                <div>
                    <h4>Numri i fatures: # ${fatura.blerja_id}</h4>
                    <p>Bleresi: ${ fatura.perdoruesi.emri } </p>
                    <p>Email: ${ fatura.perdoruesi.email } </p>
                    <p>Data: ${fatura.data_e_blerjes}</p>
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

    const blerja_id = req.params.id

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
        WHERE B.id = ${blerja_id}
    `

    connection.query(query, function (err, results) {

        if (!results[0]) {
            res.render('404')
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

    connection.query(statsQuery, function(err, stats) {
        res.render('admin/dashboard', {
            stats: stats[0],
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
    
    connection.query(query, function(err, products) {
        res.render('admin/products', {
            products: products,
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

    connection.query(query, [emri, pershkrimi, cmimi, stoku, foto], function(err, results) {
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

    connection.query(query, [emri, pershkrimi, cmimi, stoku, foto, id], function(err) {
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

    connection.query(query, [id], function(err) {
        if (err) {
            res.send({ error: true, mesazhi: 'Failed to delete product' })
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

    connection.query(query, function(err, orders) {
        res.render('admin/orders', {
            orders: orders,
            isAdmin: true
        })
    })
}

function adminUsers(req, res) {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login')
    }

    let query = 'SELECT id, emri, email, created_at FROM perdoruesit ORDER BY created_at DESC'
    
    connection.query(query, function(err, users) {
        res.render('admin/users', {
            users: users,
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
        WHERE B.perdoruesi_id = ${perdoruesi_id}
        ORDER BY B.data_e_blerjes DESC
    `

    connection.query(query, function(err, orders) {
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

module.exports = {
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