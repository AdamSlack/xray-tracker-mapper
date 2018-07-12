const CrunchBaseScraper = require('./CrunchBaseScraper');
const scraper = new CrunchBaseScraper()
const DB = require("../db/db");
const db = new DB('koala');

async function main() {

    try{
        let company_records = await db.selectCompanies();

        for(let record of company_records) {
            let url_name = record.company_name.toLowerCase().replace(' ', '-');
            let url = "https://www.crunchbase.com/organization/" + url_name;
            let information = await scraper.scrapePage(url);
            information.name = url_name
            console.log(information);
            // await db.insertCompanyCategories(record.id, categories);
            // await db.insertCategories(categories);
        }
    }
    catch(err) {
        console.log(err);
    }
}

main();