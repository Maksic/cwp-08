const fs = require('fs');

if (process.argv.length != 4) {
    console.log('error in params');
    process.exit(0);
}
const path = process.argv[2];
const X = 1000 * parseInt(process.argv[3]);

console.log(path + ' ' + X);
fs.exists(path, (res) => {
    if (res)
        readJSON();
    else {
        fs.writeFile(path, '[]', () => {
            readJSON();
        });
    }
});
function readJSON() {
    fs.readFile(path, 'utf8', (err, data) => {
        let arr = JSON.parse(data);
        let rand;
        const min = 0;
        const max = 100;
    
        setTimeout(function pushData() {
            rand = Math.floor(Math.random() * (max - min)) + min;
            arr.push(rand);
            let dat = JSON.stringify(arr);
            console.log(dat);
            fs.writeFile(path, dat, (err) => {
                if (err) console.error(err);
            });
            setTimeout(pushData, X);
        }, X); 
    });
}