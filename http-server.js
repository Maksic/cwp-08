const http = require('http');
const net = require('net');
const hostname = '127.0.0.1';
const port = 3000;
const tcp_port = 8124;
const connection = new net.Socket();
const buf = require('buffer');

const handlers = {
    '/workers': workers,
    '/workers/add': add,
    '/workers/remove': remove
};

function workers(req, res, payload, cb){
    let request = {
        key : 'worker',
        method : 'get'
    }
    connection.write(JSON.stringify(request));
    connection.on('data', (data) => {
        let d = JSON.parse(data);
        if(data !== undefined)
        if(d.meta === 'get'){
            d.workers.forEach((element) =>{
                let b = new Buffer(element.numbers);
                element.numbers = b.toString();
            })
            cb(null, d);
        }
   })
}

function add(req, res, payload, cb){
    if(payload.x !== undefined){
        let request = { 
            key : 'worker', 
            method : 'start', 
            interval : payload.x}
        connection.write(JSON.stringify(request));
        connection.on('data', (data, err) =>{
            let d = JSON.parse(data);
            if(d.meta = 'add'){
                cb(null, d);
            }
        })
    }
    else{
        cb({code: 405, message: `Can't create worker`});
    }
}

function remove(req, res, payload, cb){
    if(payload.id !== undefined){
        let request = {
            key : 'worker',
            method : 'remove',
            id : payload.id
        }
        connection.write(JSON.stringify(request));
        connection.on('data', (data, err) => {
            let d = JSON.parse(data);
            if(d.meta === 'remove'){
                let b = new Buffer(d.numbers);
                let resp = {
                    id: d.id,
                    startedOn: d.startedOn,
                    numbers: b.toString()
                }
                cb(null, resp);
            }else{
        cb({code: 405, message: `Can't remove worker`});
            }
        })
    }else{
        cb({code: 405, message: `Can't create worker`});
    }
}

connection.connect(tcp_port, function () {
    console.log('Connected to the TCP server');
});

const server = http.createServer((req, res) => {
    parseBodyJson(req, (err, payload) => {
        const handler = getHandler(req.url);
        handler(req, res, payload, (err, result) => {
            if (err) {
                res.writeHead(err.code, {'Content-Type' : 'application/json'});
                res.end( JSON.stringify(err) );
                return;
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result, null, "\t"));
        });
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function getHandler(url) {
    console.log(url);
    return handlers[url] || notFound;
}

function notFound(req, res, payload, cb) {
    cb({code: 404, message: 'Not found'});
}

function parseBodyJson(req, cb) {
    let body = [];
    req.on('data', function (chunk) {
        body.push(chunk);
    }).on('end', function () {
        body = Buffer.concat(body).toString();
        if (body !== "") {
            params = JSON.parse(body);
            cb(null, params);
        }
        else {
            cb(null, null);
        }
    });
}