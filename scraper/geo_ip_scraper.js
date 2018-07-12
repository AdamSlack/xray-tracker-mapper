
const geoip = require('geoip-lite');
const DB = require("../db/db");
const db = new DB('koala');


async function main() {
    let rows = await db.selectHostnames();
    for(let record of rows) {
        let geo = geoip.lookup(record.host_name);
        console.log(record.host_name);
        console.log(geo);
        console.log('\n\n');
    }
}

main();