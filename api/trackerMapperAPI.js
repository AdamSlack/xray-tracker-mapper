const DB = require("../db/db")
const db = new DB('koala');
const express = require("express");

const app = express();

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get('/host/:hostName', async (req, res) => {
    let hostName = req.params.hostName;
    let hostID = await db.selectHostNameID(hostName);
    let companyID = await db.selectHostsCompany(hostName);
    let companyName = await db.selectCompanyName(companyID);
    res.send({
            "host_name": hostName,
            "host_id": hostID,
            "company_id": companyID,
            "company_name": companyName
        });
});

app.listen(8080, () => console.log("listening on port 8080"));


async function main() {
    let HostName = "example.com";
    let results = await db.selectHostNameID(HostName);
    console.log(`ID for ${HostName} is: ${results}`);
}

main();