
const DB = require("../db/db");
const db = new DB('koala');

const Mapper = require('./mapper');
const mapper = new Mapper();

const fs = require('fs');

const duds = new Set(
    ["Unknown"
    ,"what does 's' represent in 'https'?"
    ,"start_time:'"
    ,"boolean) on PopupWindow. Using the public version."
    ,"boolean) on PopupWindow. Using the public version."
    ,"and a minor (20 total bytes)."
]);

process.on('uncaughtException', function (err) {
    console.log('Whois Really Did It This Time.');
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
    if(duds.has(company)) {
        console.log('Dud company name was found.')
        console.log('Querying WhoIs.');
        const companyID = await mapper.mapHostNameToCompany(host);
        if(companyID == -1) {
            console.log("Still unable to find company, defaulting to Uknown");
            await db.insertCompanyHostPair(host, "Uknown");
            return;
        }
    }
    await db.insertCompanyHostPair(company, host);
    return;
}

async function main() {
    let path = process.argv[2];
    if(fs.existsSync(path)) {
        lines = fs.readFileSync(path, 'utf8').split('\n');
        for (let line of lines){
            parts = line.split(',');
            if(parts.length == 3 ) {
                await consumeCompanyHost(parts[1], parts[2])
            }
        }

    }
}

main();
