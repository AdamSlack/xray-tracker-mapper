
const cheerio = require("cheerio");
const request = require('async-request');
const geoip = require('geoip-lite');

class CrunchBaseScraper {

    async requestPage(url) {
        return await request(url);
    }

    loadPage(page) {
        return cheerio.load(page.body);
    }

    scrapeClassHrefs($, classString) {
        // want all hrefs for elements with given class string (cb-link ng-star-inserted)
        return $(classString).map((index, value) => $(value).attr('href'));
    }

    findCategoryHrefs($) {
        return $("a[href*='/search/organizations/field/organizations/categories/']")
            .map((index, value) => $(value).attr('title'));
    }

    findLocationHrefs($) {
        return $("a[href*='/search/organizations/field/organizations/location_identifiers/']")
        .map((index, value) => $(value).attr('title'));
    }

    filterHRefs(hrefArray, regex) {
        // probs gonna filter where href starts with '/search/organizations/field/organizations/categories/'
        return hrefArray.filter((href) => regex.test(href))
    }

    trimHrefs(hrefArray, regex) {
        return hrefArray.map((href) => href.replace(regex, ''));
    }

    findHRefs($) {
        return this.scrapeClassHrefs($, '.cb-link.ng-star-inserted');
    }

    findCategories($) {
        let hrefs = this.filterHRefs($);

        let hrefRegex = new RegExp("^/search/organizations/field/organizations/categories/")
        let categoryHrefs = this.filterHRefs(hrefs.toArray(), hrefRegex);
        let categories = this.trimHrefs(categoryHrefs, hrefRegex);

        return categories;
    }

    findLocations($) {
        let hrefs = this.findHRefs($);

        let hrefRegex = new RegExp("^/search/organizations/field/organizations/location_identifiers/");
        let hrefObjects = hrefs.map((obj) => hrefRegex.test($(obj).att('href')));
        return hrefObjects.map((obj) => $(obj).attr('title')).toArray();
    }

    async scrapePage(url) {
        let page = await this.requestPage(url);

        let $ = await this.loadPage(page);

        return this.findCategoryHrefs($).toArray();
    }
}



module.exports = CrunchBaseScraper