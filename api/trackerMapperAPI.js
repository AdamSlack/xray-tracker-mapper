const DB = require("../db/db")
const db = new DB('koala');

const Mapper = require("../mapper/mapper");
const mapper = new Mapper();

const express = require("express");
const config = require("../config/config.json");

const app = express();

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get('/host/:hostName', async (req, res) => {
    let headersSent = false;
    process.on('uncaughtException', function (err) {
        res.send({"UNCAUGHT_ERROR":err});
        headersSent = true;
    });
    try{
        let mapping = await mapper.processHostCompanyRequest(req.params.hostName);  
        res.send(mapping);
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

