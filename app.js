const express = require('express')
const bodyParser = require('body-parser')
const mySql = require('mysql')
const session = require('express-session')
const path = require('path');

const { connect } = require('http2')
const { off } = require('process')
const { response, query } = require('express')

const app = express()
const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/Images', express.static(__dirname + 'public/Images'))

app.set('view-engine', 'ejs')

const pool = mySql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ssms'
})

app.get('/login', (req, res) => {
    res.render('loginForm.ejs')
})

app.post('/login', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('SELECT * FROM admin WHERE username=? AND password=?', [req.body.username, req.body.password], (err, result, field) => {
            connection.release()

            if (err)
                console.log(err)

            if (result.length <= 0) {
                res.redirect('/login')
            }

            else {
                res.redirect('/adminDashboard')
            }
        })
    })
})

app.get('/AdminDashboard', (req, res) => {
    var results = []

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('SELECT COUNT(name) as count FROM distributor', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT COUNT(name) as count FROM store', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT SUM(profit) as total FROM STORE', (err, data) => {
            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT task FROM todo', (err, data) => {
            connection.release()

            if (err)
                console.log(err)
            results.push(data)

            res.render('adminDashboard.ejs', { data: results })
        })
    })
})

app.post('/AdminDashboard', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('INSERT INTO todo (task) VALUES (?)', [req.body.dpName], (err1, resu) => {

            if (err1)
                throw err1;
            else {
                connection.release()

                res.redirect('/AdminDashboard')
            }
})
    })
})

app.get('/AdminDistributors', (req, res) => {
    var results = []

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('SELECT COUNT(name) as count FROM distributor', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT COUNT(DISTINCT area) as count FROM distributor', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT SUM(NETWORTH) as total FROM distributor', (err, data) => {
            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT * FROM distributor', (err, data) => {
            connection.release()

            if (err)
                console.log(err)
            results.push(data)

            res.render('adminDistributors.ejs', { data: results })
        })
    })
})

app.post('/AdminDistributors/:id', (req, res) => {

    var ID = req.params.id;
    console.log(ID);

    if (ID == 1) {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`Connected as ID ${connection.threadId}`);

            connection.query('DELETE FROM DISTRIBUTOR WHERE name=?', [req.body.distName], (err, res) => { })
            connection.query('INSERT INTO DISTRIBUTOR(name,area,netWorth) VALUES(?,?,?)', [req.body.distName, req.body.distArea, req.body.distTotal], (err, result) => {
                if (err) {
                    console.log(err)
                }
                else {
                    connection.release()
                    res.redirect('/adminDistributors')
                }
            })
        })
    }

    else
    {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`Connected as ID ${connection.threadId}`);

            connection.query('DELETE FROM DISTRIBUTOR WHERE name=?', [req.body.ddistName], (err2, res2) => {
                if (err2) {
                    console.log(err2)
                }
                else {
                    connection.release()
                    res.redirect('/adminDistributors')
                }
            })
        })
        }
})

app.get('/AdminSalesAnalytics', (req, res) => {

 var results = []

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('SELECT COUNT(category) as cat FROM stock', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT SUM(sales) as sale FROM STORE', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT SUM(profit) as total FROM STORE', (err, data) => {
            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT * FROM STORE', (err, data) => {
            connection.release()

            if (err)
                console.log(err)
            results.push(data)

            res.render('adminSalesAnalytics.ejs', { data: results })
        })
    })
})

app.get('/AdminStocks', (req, res) => {
    var results = []

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('SELECT COUNT(name) as count FROM stock', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT COUNT(DISTINCT category) as count FROM stock', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT SUM(quantity*price) as total FROM stock', (err, data) => {
            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT * FROM stock', (err, data) => {
            connection.release()

            if (err)
                console.log(err)
            results.push(data)

            res.render('adminStock.ejs', { data: results })
        })
    })
})

app.post('/AdminStocks/:id', (req, res) => {

    var ID = req.params.id;
    console.log(ID);

    if (ID == 1) {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`Connected as ID ${connection.threadId}`);

            connection.query('SELECT * FROM stock WHERE name=?', [req.body.pName], (err1, resu) => {

                if (resu.length == 0) {
                    connection.query('INSERT INTO stock(name,quantity,price,category) VALUES(?,?,?,?)', [req.body.pName, req.body.pQuantity, req.body.pPrice, req.body.pCategory], (err2, result) => {
                        if (err2) {
                            console.log(err2)
                        }
                        else {
                            connection.release()
                            res.redirect('/AdminStocks')
                        }
                    })
                }

                else {
                    connection.query('UPDATE stock SET name=?,quantity=?,price=?,category=? WHERE name=?', [req.body.pName, req.body.pQuantity, req.body.pPrice, req.body.pCategory,req.body.pName], (err3, result) => {
                        if (err3) {
                            console.log(err3)
                        }
                        else {
                            connection.release()
                            res.redirect('/AdminStocks')
                        }
                    })
                }
            })

        })
    }

    else
    {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`Connected as ID ${connection.threadId}`);

            connection.query('DELETE FROM stock WHERE name=?', [req.body.dpName], (err2, res2) => {
                if (err2) {
                    console.log(err2)
                }
                else {
                    connection.release()
                    res.redirect('/AdminStocks')
                }
            })
        })
        }
})

app.get('/AdminStoresDetails', (req, res) => {
    var results = []

    pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Connected as ID ${connection.threadId}`);

        connection.query('SELECT COUNT(id) as count FROM STORE', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT SUM(sales) as sale FROM STORE', (err, data) => {

            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT SUM(profit) as total FROM STORE', (err, data) => {
            if (err)
                console.log(err)
            results.push(data)
        })

        connection.query('SELECT * FROM STORE', (err, data) => {
            connection.release()

            if (err)
                console.log(err)
            results.push(data)

            res.render('adminStoresDetails.ejs', { data: results })
        })
    })
})

app.post('/AdminStoresDetails/:id', (req, res) => {
    var ID = req.params.id;

    if (ID == 1) {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`Connected as ID ${connection.threadId}`);

            connection.query('DELETE FROM STORE WHERE name=?', [req.body.sName], (err, res) => { })

            connection.query('INSERT INTO STORE(id,name,sales,invested,profit) VALUES(0,?,?,?,?)', [req.body.sName, req.body.sSales, req.body.sInvested, req.body.sProfit], (err, result) => {
                if (err) {
                    console.log(err)
                }
                else {
                    connection.release()
                    res.redirect('/AdminStoresDetails')
                }
            })
        })
    }

    else
    {
         pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`Connected as ID ${connection.threadId}`);

            connection.query('DELETE FROM STORE WHERE name=?', [req.body.dsName], (err, result) => {
                if (err) {
                    console.log(err)
                }
                else {
                    connection.release()
                    res.redirect('/AdminStoresDetails')
                }
            })
        })
    }
})

app.listen(port, () => console.log(`Listen on Port ${port}`))