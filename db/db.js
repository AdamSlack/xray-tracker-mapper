"use strict";
const pg = require('pg');

class DB {
    constructor() {
        let config = {
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            max: 20,
            connectionTimeoutMillis: 1000
        }
        this.pool = new pg.Pool(config);
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
            const companyRows = await this.query("select id from companies where company_name = $1", [companyName]);
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

    async insertCompanyHostPair(companyName, hostName) {
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

    async selectHostsCompany(hostName) {
        console.log(`Selecting the Company ID associated with the Host Name: ${hostName}`);
        try {

            const hostID = await this.selectHostNameID(hostName);
            if (hostID == -1) {
                console.log(`Hostname (${hostName}) Not found.`);
                return -1;
            }

            const companyIDs = await this.query("select company_id from host_company_mappings where host_name_id = $1", [hostID]);
            if (companyIDs.rowCount == 0) {
                return -1;
            }

            return companyIDs.rows[0].company_id;
        }
        catch(err) {
            console.log(`Error Selecting Company ID associated with Host Name: ${hostName}`);
        }
    }
}

module.exports = DB;