const app =  require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mysql = require('mysql');

/* Create connection to Database */
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'realtimechat_test',
});

con.connect((err) => {
    if (err) throw err;

    console.log('Connected');

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    io.on('connection', (socket) => {
        socket.on('fetchMessages', () => {
            const sql = `SELECT * FROM messages`;
            con.query(sql, (err, result, fields) => {
                if (err) throw err;

                io.emit('fetchedMessages', result);
            });
        });

        socket.on('receiveNewMessage', (data) => {
            const sql = `INSERT INTO messages (name, message) VALUES ('${data.name}', '${data.message}')`;
            con.query(sql, (err, result) => {
                if (err) throw err;

                io.emit('receivedNewMessage', data);
                console.log('New Message : ' + data.message);
            });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
        });
    });
});

http.listen(3000, () => {
   console.log('Listening on 3000');
});