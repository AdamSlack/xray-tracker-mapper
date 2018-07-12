
const DB = require("../db/db");
const db = new DB('koala');

const Mapper = require('./mapper');
const mapper = new Mapper();

const fs = require('fs');

var progressCounter = 0;
var path = "";
var lines = [];

const duds = new Set(
    ["Unknown"
    ,"what does 's' represent in 'https'?"
    ,"start_time:'"
    ,"boolean) on PopupWindow. Using the public version."
    ,"boolean) on PopupWindow. Using the public version."
    ,"and a minor (20 total bytes)."
]);

process.on('uncaughtException', async function (err) {
    console.log('Whois Really Did It This Time.');
    delete lines;
    parseFile(path, progressCounter);
});

async function consumeCompanyHost(host, company) {
    console.log(`Parsed hostname: ${host} and company name: ${company}`);
    const mappedCompanyID = await db.selectHostsCompany(host);
    if(mappedCompanyID != -1) {
        console.log(`host already mapped. Company ID = ${mappedCompanyID}`);
        return;
    }
    if(company.replace(" ", "") == "") {
        console.log("Empty Company Parsed.")
        company = 'Unknown';
    }
    // if(duds.has(company)) {
    //     console.log('Dud company name was found.')
    //     console.log('Querying WhoIs.');
    //     const companyID = await mapper.mapHostNameToCompany(host);
    //     if(companyID == -1) {
    //         console.log("Still unable to find company, defaulting to Unknown");
    //         await db.insertCompanyHostPair(host, "Unknown");
    //         return;
    //     }
    // }
    await db.insertCompanyHostPair(host, company);
    return;
}

async function parseFile(path, startPos = 0) {
    if(fs.existsSync(path)) {
        lines = [];
        lines = fs.readFileSync(path, 'utf8').split('\n');
        for (let i = startPos; i < lines.length; i++) {
            const line = lines[i];
            progressCounter += 1;
            const parts = line.split(',');
            if(parts.length == 3 ) {
                await consumeCompanyHost(parts[1], parts[2]);
            }
        }
    }
}

async function main() {
    path = process.argv[2];
    await parseFile(path);
}

main();
