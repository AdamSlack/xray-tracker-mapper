
const DB = require("../db/db");
const db = new DB('koala');
const fs = require('fs');
const LineByLineReader = require('line-by-line');
  
async function main() {
    let path = process.argv[2];
    if(fs.existsSync(path)) {
        const lr = new LineByLineReader(path);
        lr.on('error', function (err) {

        });
        
        lr.on('line', function (line) {
            lr.pause();
            setTimeout(function () {
                let parts = line.split(',');
                db.insertCompanyHostPair(parts[2], parts[1]);
                lr.resume();
            }, 100);
        });
        
        lr.on('end', function () {

        });
    }
}

main();