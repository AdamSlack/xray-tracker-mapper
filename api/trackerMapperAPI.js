const DB = require("../db/db")
const db = new DB('koala');


async function main() {
    let HostName = "example.com";
    let results = await db.selectHostNameID(HostName);
    console.log(`ID for ${HostName} is: ${results}`);
}

main();