const DB = require("../db/db");
const db = new DB('koala');

const whois = require("whois-json");


class Mapper {
    constructor() {

    }
    
    async processHostCompanyRequest(hostName) {
        let hostID = await db.selectHostNameID(hostName);
        if(hostID == -1) {
            // Host not found in DB.
            await db.insertHostName(hostName);
            hostID = await db.selectHostNameID(hostName);
        }

        let mappedCompanyID = await this.mapHostNameToCompany(hostName);
        if(mappedCompanyID == -1) {
            return {
                "Error":"Unable to map host name to a company."
            }
        } 
        
        let companyName = await db.selectCompanyName(mappedCompanyID);
        return {
            "hostName":hostName,
            "hostID":hostID,
            "companyName":companyName,
            "companyID":mappedCompanyID
        };
    }

    shortenDomain(domain) {
        return domain.substring(domain.indexOf('.') + 1);
    }

    async mapHostNameToCompany(hostName) {
        let companyId = await db.selectHostsCompany(hostName);
        if(companyId != -1) {
            // Mapping found
            return companyId;
        }
        
        //let companyName = await whoIsLookUpName(hostName);
        let whoIsResult = await whois(hostName);
        let whoIsCompany = whoIsResult.registrantOrganization;

        let shortenedHostName = this.shortenDomain(hostName);    
        while(whoIsCompany == undefined && shortenedHostName.split('.').length > 1) {
            console.log(`Searching for company that might match the shortend version of hostname: ${hostName}, Shortened HostName: ${shortenedHostName}`);
            whoIsResult = await whois(shortenedHostName);
            whoIsCompany = whoIsResult.registrantOrganization;
            shortenedHostName = this.shortenDomain(shortenedHostName);
        }
        
        if(whoIsCompany == undefined) {
            return -1;
        }

        companyId = await db.selectCompanyID(whoIsCompany);
        console.log(companyId);
        if(companyId == -1) {
            await db.insertCompanyName(whoIsCompany);
            companyId = await db.selectCompanyID(whoIsCompany);
        }

        await db.insertCompanyHostPair(whoIsCompany, hostName);
        return companyId;
    }
}

module.exports = Mapper;