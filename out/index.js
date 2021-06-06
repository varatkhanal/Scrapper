"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require('puppeteer');
const fs = require('fs');
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer.launch();
    const page = yield browser.newPage();
    const url = 'https://en.wikipedia.org/wiki/Lists_of_airports';
    yield page.goto(url);
    let airport_list = [];
    const visitLink = (index = 3) => __awaiter(void 0, void 0, void 0, function* () {
        yield page.waitForXPath('//*[@id="mw-content-text"]/div[1]/p[4]/a');
        const links = yield page.$x('//*[@id="mw-content-text"]/div[1]/p[4]/a');
        // going through each 
        if (links[index]) {
            ////clicking A  Z letters
            yield links[index].click();
            //iterating through the table of eack link
            yield page.waitForXPath('/html/body/div[3]/div[3]/div[5]/div[1]/table/tbody/tr');
            const trows = yield page.$x('/html/body/div[3]/div[3]/div[5]/div[1]/table/tbody/tr');
            for (let tr of trows) {
                const value = yield tr.$$eval('td', (tds) => tds.map((td) => {
                    // replace whitespaces and commas with ‘_’ (underscore).
                    let str_value = td.innerText.replace(/[, ]/g, '_');
                    //substituting numbers with string ‘DAPI’.
                    str_value = str_value.replace(/\d+/g, "dapi");
                    return str_value;
                }));
                //converting to json object
                const json_airport_data = {
                    "iata": value[0],
                    "icao": value[1],
                    "airportName": value[2] ? value[2].toLowerCase() : null,
                    "locationServed": value[3] ? value[3].toLowerCase() : null
                };
                if (value[0] != null) {
                    //pusing each json object to an array
                    airport_list.push(json_airport_data);
                }
            }
            const currentPage = yield page.title();
            // go back and visit next link
            yield page.goBack({ waitUntil: 'networkidle2' });
            return visitLink(index + 1);
        }
        //writing array of jason object to a json file
        let data = JSON.stringify(airport_list);
        fs.writeFileSync('airport_list.json', data);
    });
    yield visitLink();
    yield browser.close();
}))();
