const fs = require('fs');
const DB = require("../db/db");
const db = new DB('koala');

async function main() {

    fs.readFile('../data/companycategories.csv',(err, buf) => {
        if(err) {
            console.log(`Error Reading File: ${err}`);
        }
        let companyCategories = buf.toString().split('\n').slice(0,-1).map((line) => {
            let eles = line.split(',', 3);
            let elesString = eles.join(',');
            let endString = line.slice(elesString.length + 1);
            eles.push(endString);

            console.log(eles);
            let company_name = eles[1];
            let parsed_categories = eles[3].replace('"{', '').replace('}"', '').split(',');
            return {company: company_name, categories: parsed_categories};
        });

        companyCategories.forEach(async (company) => {
            let id = await db.selectCompanyID(company.company);
            if(id == -1) {
                return;
            }
            await db.insertCompanyCategories(id, company.categories);
        })
        console.log(companyCategories);
    });
}

main()