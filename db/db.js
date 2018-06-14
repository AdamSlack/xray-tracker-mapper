"use strict";
const config = require('../config/config.json');
const pg = require('pg');

class DB {
    constructor(module) {
        const db_config = config.database;
        db_config.user = config[module].db.user;
        db_config.password = config[module].db.password;
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

    async insertCompanyName(companyName) {
        console.log(`Inserting Company Name: ${companyName}`);
        try {
            const checkRows = await this.query('select * from companies where company_name=$1', [companyName]);
            if (checkRows.rowCount != 0) {
                console.log(`${companyName} already exists in the table`);
                return;
            }
        
            console.log(`${companyName} not found in table, inserting it now.`);
            await this.query('insert into host_names (host_name) values($1)', [companyName]);
        }
        catch(err) {
            console.log(`Error inserting Company Name: ${companyName} - Error: ${err}`);
        }
    }

    async selectCompanyID(companyName) {
        console.log(`Selecting ID for Company Name: ${companyName}`);
        try{
            const companyRows = await ("select id from companies where company_name = $1", [companyName]);
            if(companyRows.rowCount == 0) {
                return -1;
            }
            return companyRows[0].id;
        }   
        catch(err) {
            console.log(`Error selecing ID for Company Name: ${companyName}`);
            throw err;
        }
    }

    async selectHostNameID(hostName) {
        console.log(`Selecting ID for Host Name: ${hostName}`);
        try{
            const hostRows = await ("select id from host_names where host_name = $1", [hostName]);
            if(hostRows.rowCount == 0) {
                return -1;
            }
            return hostRows[0].id;
        }   
        catch(err) {
            console.log(`Error selecing ID for Host Name: ${hostName}`);
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

            let companyID = await this.selectCompanyID(companyID);
            if (companyID == -1) {
                await this.insertCompanyName(companyName);
                companyID = await this.selectCompanyID(companyName)
            }
        }
        catch(err) {
            
        }
    }
}