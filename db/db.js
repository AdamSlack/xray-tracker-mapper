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

    async insertHostName(hostname) {
        console.log(`Inserting Hostname: ${hostname}`);
        try {
            const checkRows = await this.query('select * from host_names where host_name=$1', [hostname]);
            if (checkRows.rowCount != 0) {
                console.log(`${hostname} already exists in the table`);
                return;
            }
        
            console.log(`${hostname} not found in table, inserting it now.`);
            await this.query('insert into host_names (host_name) values($1)', [hostname]);
        }
        catch(err) {
            console.log(`Error inserting Hostname: ${hostname} - Error: ${err}`);
        }
    }
}