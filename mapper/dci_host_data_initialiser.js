
const DB = require("../db/db");
const db = new DB('koala');
const fs = require('fs');
const LineByLineReader = require('line-by-line');
  
async function main() {
    let path = process.argv[2];
    if(fs.existsSync(path)) {
        lines = fs.readFileSync(path, 'utf8').split('\n');
        for (let line of lines){
            parts = line.split(',');
            if(parts.length == 3 ) {
                await db.insertCompanyHostPair(parts[2], parts[1]);
            }
        }

    }
}

main();