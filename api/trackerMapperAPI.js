const DB = require("../db/db")
const db = new DB('koala');

const Mapper = require("../mapper/mapper");
const mapper = new Mapper();

const express = require("express");
const config = require("../config/config.json");

const app = express();

app.get('/', (req, res) => {
    res.send("X-Ray Tracker Mapper.");
});

app.get('/host/:hostName', async (req, res) => {
    let headersSent = false;
    process.on('uncaughtException', function (err) {
        if(!headersSent){
            res.send({"UNCAUGHT_ERROR":err});
            headersSent = true;
        }
    });
    try{
        let mapping = await mapper.processHostCompanyRequest(req.params.hostName);  
        if(!headersSent){
            if(mapping.companyID != undefined
            && mapping.companyName != undefined
            && mapping.hostID != undefined
            && mapping.hostName != undefined) {
                res.send(mapping);

            }
            else {
                res.send({"details":"unknown"});
            }
            headersSent = true;
        }
    }
    catch(err){
        if(!headersSent) {
            res.send({"ERROR":err});
        }
    }
});

app.listen(config.api.port, function() {
    console.log(`listening on port ${config.api.port}`)
});

