const host_data = require("../data/company_data_list_9_4_2018.json");
const DB = require("../db/db");
const db = new DB('koala');


async function main() {
    for(let ele of host_data.data) {
        for(let dom of ele.doms) {
            await db.insertHostName(dom);
            await db.insertCompany(ele.owner_name, ele.country);
            await db.insertCompanyHostPair(dom, ele.owner_name)
        }
    }
}

main();
