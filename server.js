const express = require('express');
const path = require('path');
const app = require('express')();
const http = require('http').Server(app);
// const io = require('socket.io')(http);

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.listen(8081, () => console.log('FILE SERVER listening on http://localhost:' + 8081));