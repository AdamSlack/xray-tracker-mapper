const DB = require("../db/db")
const db = new DB('koala');
const express = require("express");
const config = require("../config/config.json");
const whois = require('whois-json')
const url = require('url');

const app = express();

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get('/host/:hostName', async (req, res) => {
    let hostID = await db.selectHostNameID(domainName);
    let companyID = await db.selectHostsCompany(domainName);
    let companyName = await db.selectCompanyName(companyID);
    
    let results = await whois(hostName);
    
    res.send({
            "host_name": domainName,
            "host_id": hostID,
            "company_id": companyID,
            "company_name": companyName,
            "whois": results.registrantOrganization
        });
});

app.listen(config.api.port, () => console.log(`listening on port ${config.api.port}`));
