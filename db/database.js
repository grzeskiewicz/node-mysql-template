const mysql = require('mysql')
const async = require("async");

const connection = mysql.createConnection({
    host: 'mysql.cinemanode.svc',
    user: 'benuch',
    password: 'palkast',
    database: 'cinemadb',
    port: 3306
});




const showings = function(req, res) {
    connection.query("select s.id,f.title,f.director,f.genre,f.length,f.category,f.imageUrl,p.normal, p.discount,r.id as room,r.seats,date from showings s, prices p, rooms r, films f where s.film=f.id AND s.room=r.id AND s.price=p.id ", function(err, rows, fields) {
        if (err) res.json(err);

        res.json(rows);

    });
}


const showingsbydate = function(req, res) {
    console.log(req.params.date);
    connection.query('select s.id,f.title,f.director,f.genre,f.length,f.category,f.imageUrl,p.normal, p.discount,r.id as room,r.seats,date from showings s, prices p, rooms r, films f where s.film=f.id AND s.room=r.id AND s.price=p.id AND date LIKE ' + "'" + req.params.date + "%'", function(err, rows, fields) {
        if (err) throw err

        res.json(rows);

    });

}


const seatsshowing = function(req, res) {
    connection.query("select r.seats from showings s, rooms r where r.id=s.room AND s.id='" + req.params.showingid + "'", function(err, rows, fields) {
        if (err) throw err

        res.json(rows[0]);

    });

}


const seatstaken = function(req, res) {
    console.log(JSON.stringify(req.params.showingid));
    connection.query("select seat from tickets where showing='" + req.params.showingid + "'", function(err, rows, fields) {
        if (err) throw err
        const arr = [];
        for (const i in rows) {
            arr.push(rows[i].seat);
        }
        res.json(arr);

    });

}

const newticket = function(req, res) {
    const vals = Object.keys(req.body).map(function(key) {
        return req.body[key];
    });
    const results = [];
    vals.splice(1, 1);
    console.log(vals);
    vals.forEach(function(params) {
        if (params === undefined || params === '') {
            res.json({ success: false, msg: "Missing parameters" });
        }
    });
    const seats = req.body.seats;
    async.forEachOf(seats, function(seat) {
        console.log(seat);
        connection.query("INSERT INTO tickets(showing,seat,price,email,status,purchasedate) VALUES(?," + seat + ",?,?,1,'" + datex.dateNow() + "')", vals, function(err, result) {
            // if (err) res.json({ success: false, msg: err });
            if (err) throw err;


        });


    });
    res.json({ success: true, msg: "Tickets created!" });
    // next();
}


const tickets = function(req, res) {
    connection.query("select * from tickets", function(err, rows, fields) {
        if (err) res.json(err);
        res.json(rows);
    });
}


module.exports = { showings, showingsbydate, seatsshowing, seatstaken, newticket, tickets, test };