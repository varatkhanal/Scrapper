import { JSONArray, JSONObject } from "puppeteer";

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = 'https://en.wikipedia.org/wiki/Lists_of_airports';
    await page.goto(url);

    let airport_list: any = [];

    const visitLink: any = async (index = 3) => {

        await page.waitForXPath('//*[@id="mw-content-text"]/div[1]/p[4]/a');

        const links = await page.$x('//*[@id="mw-content-text"]/div[1]/p[4]/a');


        // going through each 
        if (links[index]) {

            ////clicking A  Z letters
            await links[index].click();

            //iterating through the table of eack link
            await page.waitForXPath('/html/body/div[3]/div[3]/div[5]/div[1]/table/tbody/tr');

            const trows = await page.$x('/html/body/div[3]/div[3]/div[5]/div[1]/table/tbody/tr');

            for (let tr of trows) {
                const value = await tr.$$eval('td', (tds: any) => tds.map((td: any) => {
                    // replace whitespaces and commas with ‘_’ (underscore).
                    let str_value = td.innerText.replace(/[, ]/g, '_');

                    //substituting numbers with string ‘DAPI’.
                    str_value = str_value.replace(/\d+/g, "dapi")
                    return str_value
                }));

                //converting to json object
                const json_airport_data: JSONObject = {
                    "iata": value[0],
                    "icao": value[1],
                    "airportName": value[2] ? value[2].toLowerCase() : null,
                    "locationServed": value[3] ? value[3].toLowerCase() : null
                }

                if (value[0] != null) {
                    //pusing each json object to an array
                    airport_list.push(json_airport_data);
                }
            }

            const currentPage = await page.title();

            // go back and visit next link
            await page.goBack({ waitUntil: 'networkidle2' });

            return visitLink(index + 1);
        }
        //writing array of jason object to a json file
        let data = JSON.stringify(airport_list);
        fs.writeFileSync('airport_list.json', data);
    };

    await visitLink();

    await browser.close();
})();
