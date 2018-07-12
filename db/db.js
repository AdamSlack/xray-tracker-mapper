"use strict";
const config = require('../config/config.json');
const pg = require('pg');


class DB {
    constructor(module) {
        const db_config = config.db;
        db_config.user = config[module].user;
        db_config.password = config[module].password;
        db_config.max = 10;
        db_config.idleTimeoutMillis;

        this.pool = new pg.Pool(db_config);
        this.pool.on('error', (err) => {
            console.log("Client Error:", err.message, err.stack);
        });
    }

    // export the query method for passing queries to the pool
    query(text, values) {
        try {
            if (values){
                console.log('query:', text, values);
            }
            else {
                console.log('query:', text, values);
            }
            return this.pool.query(text, values);
        } catch (err) {
            console.log('Error With Postgres Query');
            throw err;
        }
    }

    async connect() {
        try {
            logger.debug('connecting to db pool');
            const ret = await this.pool.connect();
            ret.lquery = (text, values) => {
                if (values) {
                    logger.debug('lquery:', text, values);
                }
                else {
                    logger.debug('lquery:', text);
                }
                return ret.query(text, values);
            };
            return ret;
        } catch (err) {
            console.log('Failed To Connect To Pool', err);
            throw err;
        }
    }

    async insertHostName(hostName) {
        console.log(`Inserting Host Name: ${hostName}`);
        try {
            const checkRows = await this.query('select * from host_names where host_name=$1', [hostName]);
            if (checkRows.rowCount != 0) {
                console.log(`${hostName} already exists in the table`);
                return;
            }
        
            console.log(`${hostName} not found in table, inserting it now.`);
            await this.query('insert into host_names (host_name) values($1)', [hostName]);
        }
        catch(err) {
            console.log(`Error inserting Host Name: ${hostName} - Error: ${err}`);
        }
    }

    async insertCompany(companyName, location) {
        console.log(`Inserting Company Details Company: ${companyName}, Location: ${location}}`)
        try {
            const checkRows = await this.query('select * from companies where company_name=$1', [companyName]);
            if (checkRows.rowCount != 0) {
                console.log(`${companyName} already exists in the table`);
                return;
            }
    
            console.log(`${companyName} not found in table, inserting it now.`);
            await this.query('insert into companies (company_name, locale_iso_6391) values($1, $2)', [companyName, location]);
        }
        catch(err) {
            console.log(`Error inserting Company Name: ${companyName} and Location: ${location}- Error: ${err}`);
        }
    
    }

    async insertCompanyName(companyName) {
        console.log(`Inserting Company Name: ${companyName}`);
        try {
            const checkRows = await this.query('select * from companies where company_name=$1', [companyName]);
            if (checkRows.rowCount != 0) {
                console.log(`${companyName} already exists in the table`);
                return;
            }
        
            console.log(`${companyName} not found in table, inserting it now.`);
            await this.query('insert into companies (company_name) values($1)', [companyName]);
        }
        catch(err) {
            console.log(`Error inserting Company Name: ${companyName} - Error: ${err}`);
        }
    }

    async selectCompanyID(companyName) {
        console.log(`Selecting ID for Company Name: ${companyName}`);
        try{
            const companyRows = await this.query("select * from companies where company_name = $1", [companyName]);
            if(companyRows.rowCount == 0) {
                return -1;
            }
            return companyRows.rows[0].id;
        }   
        catch(err) {
            console.log(`Error selecing ID for Company Name: ${companyName}`);
            throw err;
        }
    }
    
    async selectCompanyName(companyID) {
        console.log(`Selecting Name for Company ID: ${companyID}`);
        try{
            const companyRows = await this.query("select company_name from companies where id = $1", [companyID]);
            if(companyRows.rowCount == 0) {
                return -1;
            }
            return companyRows.rows[0].company_name;
        }   
        catch(err) {
            console.log(`Error selecing NAme for Company ID: ${companyID}`);
            throw err;
        }
    }

    async selectHostNameID(hostName) {
        console.log(`Selecting ID for Host Name: ${hostName}`);
        try{
            const hostRows = await this.query("select id from host_names where host_name = $1", [hostName]);
            if(hostRows.rowCount == 0) {
                return -1;
            }
            return hostRows.rows[0].id;
        }
        catch(err) {
            console.log(`Error selecting ID for Host Name: ${hostName}`);
            throw err;
        }
    }

    async insertCompanyHostPair(hostName, companyName) {
        console.log(`Inserting Company Host Pair - Company Name: ${companyName}, Host Name: ${hostName}`);
        try {
            let hostID = await this.selectHostNameID(hostName);
            if(hostID == -1) {
                await this.insertHostName(hostName);
                hostID = await this.selectHostNameID(hostName);
            }

            let companyID = await this.selectCompanyID(companyName);
            if (companyID == -1) {
                await this.insertCompanyName(companyName);
                companyID = await this.selectCompanyID(companyName)
            }

            let hostCompany = await this.selectHostsCompany(hostName);
            if (hostCompany != -1) {
                console.log(`${hostName} is already associated with a company (ID=${hostCompany}`);
                return;
            }

            await this.query("insert into host_company_mappings(host_name_id, company_id) values($1, $2)", [hostID, companyID]);
        }
        catch(err) {
            console.log(`Error inserting Host (${hostName}) and Company (${companyName}) Pair. Error: ${err}`)
        }
    }


    shortenDomain(domain) {
        return domain.substring(domain.indexOf('.') + 1);
    }

    async selectHostsCompany(hostName) {
        console.log(`Selecting the Company ID associated with the Host Name: ${hostName}`);
        try {

            // Check if we have that host name
                // if so check if we have a company for it
                    // return company if we do
            // shorten hostname and then repeat.
            do {
                let hostID = await this.selectHostNameID(hostName);
                if (hostID != -1) {
                    console.log(`Hostname (${hostName}) found.`);
                    const companyIDs = await this.query("select company_id from host_company_mappings where host_name_id = $1", [hostID]);
                    if (companyIDs.rowCount != 0) {
                        return companyIDs.rows[0].company_id;
                    }
                }
                hostName = this.shortenDomain(hostName);
            }
            while(hostName.split('.').length > 1)

            return -1;
        }
        catch(err) {
            console.log(`Error Selecting Company ID associated with Host Name: ${hostName}`);
        }
    }

    async selectHostnames(){
        console.log("selecting a list of company names");
        try {
            let res = await this.query('select * from host_names', []);
            return res.rows;
        }
        catch(err) {
            console.log(`Error selecting host names: ${err}`);
        }
    }

    async selectCompanies() {
        console.log("selecting a list of company names");
        try {
            let res = await this.query('select * from companies', []);
            return res.rows;
        }
        catch(err) {
            console.log(`Error selecting company names: ${err}`);
        }
    }

    async insertCompanyCategories(id, categories) {
        console.log(`inserting Categories for company with ID ${id}. Categories: ${categories}`);
        if(categories.length == 0) {
            console.log(`No Categories provided for company ${id}`);
            return;
        }
        try {
            let res = await this.query('select * from company_categories where company_id = $1', [id]);
            if(res.rowCount != 0) {
                console.log(`Company ${id} already has category information logged.`);
                return;
            }
            await this.query('insert into company_categories(company_id, categories) values ($1,$2)', [id, categories]);
        }
        catch(err) {
            console.log(`Error inserting company category info. ${err}`);
        }
    }

    async insertCategories(categories) {
        console.log(`inserting Categories: ${categories}`);
        if(categories.length == 0) {
            console.log(`No Categories provided.`);
            return;
        }
        categories.forEach( async (cat) => {
            try {
                let res = await this.query('select * from categories where category = $1', [cat]);
                if(res.rowCount != 0) {
                    console.log(`the category, ${cat}, is already logged.`);
                    return;
                }
                await this.query('insert into categories(category) values ($1)', [cat]);
            }
            catch(err) {
                console.log(`Error inserting category, ${cat}. ${err}`);
            }
        });
    }

    async selectLocaleByID(companyID) {
        console.log(`Selecting Locale for ${companyID}`);
        try{
            let ret = await this.query('select * from companies where id = $1', [companyID]);
            if(ret.rowCount != 0) {
                return ret.rows[0].locale_iso_6391;
            }
            else {
                return "";
            }

        }
        catch(err) {
            console.log(`Unable to Select locale for ${companyID}, Error: ${err}`);
        }
    }

    async updateCompanyLocation(companyName, locale_iso_6391) {
        console.log(`Updating ${companyName} locale to ${locale_iso_6391}`);
        try{
            await this.query('update companies set locale_iso_6391 = $1 where lower(company_name) = $2', [locale_iso_6391, companyName.toLowerCase()])
        }
        catch(err) {
            console.log(`Unable to update ${companyName} with Locale of ${locale_iso_6391}. Erro: ${err}`);
        }
    }

    async selectCompanyCategories(companyID) {
        console.log(`selecting company categories for ${companyID}`);
        try {
            let res = await this.query('select * from company_categories where company_id = $1', [companyID]);
            return res.rows[0].categories;
        }
        catch(err) {
            console.log(`Error selecting company categories for ${companyID}`)
        }
    }



}

module.exports = DB;