# hostTrackerMapper
Service for the mapping of host names to company names

## Project Structure

### API

The API folder contains the Tracker Mapper API (`trackerMapper.js`). This is the script that is run using node js to start the API.


### Mapper

The Mapper folder contains `mapper.js`, which is essenctially the business logic for API. When a request is made for a host name's associated company, it is methods in the Mapper that carry that out.

### DB

There are two key elements in this directory, `init_db.sql` which can be used to initialise the relations in a postgresDB, and `db.js` which essentially acts as a repository layer set of DB methods used to insert, select and update host and company info stored in the database.

### Config

`example_config.json` shows you the structure that should be used in your own `config.json` which should be placed along side the example config. Your own `config.json` should contain the actual information necessary to connect to your PostgreSQL database, including the name you gave to the DB, the port number, as well as account details necessary to connect.

### Data

At the moment is not used, but is intended to be a store for Top-Level-Domain information, as well as any predefined company to host information.

## How to setup.

1. From a Linux environment, clone the repository.
2. initialise a PostgreSQL Database using `init_db.sql` found in `path_to_repo/db/init_db.sql`
3. make a copy of `example_config.json` and rename it to `config.json`
4. update the details of `config.json` so it accurately reflects your DB setup.
5. use `node js` to run the `trackerMapperAPI.js` file.
6. from a web browser, navigate to `localhost:8080` or `localhost:<<whatever port>>` if you changed the port number in `config.json`