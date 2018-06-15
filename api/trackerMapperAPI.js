const DB = require("../db/db")
const db = new DB();

const Mapper = require("../mapper/mapper");
const mapper = new Mapper();

const express = require("express");
const port = process.env.API_PORT;
const app = express();

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get('/host/:hostName', async (req, res) => {
    let mapping = await mapper.processHostCompanyRequest(req.params.hostName);  
    res.send(mapping);
});

app.listen(port, () => console.log(`API is running and listening on port ${port}`));
