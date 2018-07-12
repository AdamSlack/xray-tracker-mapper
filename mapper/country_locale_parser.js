const DB = require("../db/db");
const db = new DB('koala');


async function main() {
    const jsonData = require(process.argv[2]);
    if(!jsonData){
        console.log('Invalid Json File');
        return;
    }
    for(let c of jsonData) {
        await db.updateCompanyLocation(c.owner_name, c.country);
        console.log(c.owner_name + '  --  ' + c.country);
    }
}

main();