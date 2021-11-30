const express = require('express');
let sqlite3 = require('sqlite3');
let fs = require('fs');
let path = require('path');
let cors = require('cors');
const e = require('express');


let port = 8000;
let public_dir = path.join(__dirname, 'public');

let app = express();

app.use(express.static(public_dir));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


let db = new sqlite3.Database(path.join(public_dir, 'stpaul_crime.sqlite3'), sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log('Connected to database');
    }
});

app.get('/codes', (req, res) => {
    let code = false;
    if(req.query.code == undefined || req.query.code + "" == "true") {
        code = req.query.code + "";
    }

    //if no parameters
    if(code == "true" || code == "undefined") {
        db.all('SELECT * FROM Codes', (err, rows) => {
            res.status(200).type('json').send(rows);
        });
    } else {
        //there are parameters
        let codeArray = req.query.code.split(",");
        //console.log(codeArray);

        let returnJson = "[";
        let i = 0;
        db.all('SELECT * FROM Codes', (err, rows) => {
            //console.log(rows);

            let found = false;
            let i;
            for(i = 0; i < codeArray.length; i++) {
                let j;
                for(j = 0; j < rows.length; j++) {
                    if(codeArray[i] == rows[j].code) {
                        found = true;
                        //console.log("success");
                        //console.log(rows[j]);
                        returnJson += JSON.stringify(rows[j]);
                        returnJson += ",";
                    }
                }
                if(found == false) {
                    res.status(404).send('Error: code ' + codeArray[i] + " not found.");
                    return 0;
                }
                found = false;
            }
            returnJson = returnJson.substring(0, returnJson.length - 1);
            returnJson +="]";
            //console.log(returnJson);
            res.status(200).type('json').send(returnJson);
        });
        
    }
    
});

app.get('/neighborhoods', (req, res) => {
    let neighborhood = false;
    if(req.query.id == undefined || req.query.id + "" == "true") {
        neighborhood = req.query.id + "";
    }

    //if no parameters
    if(neighborhood == "true" || neighborhood == "undefined") {
        db.all('SELECT * FROM Neighborhoods', (err, rows) => {
            res.status(200).type('json').send(rows);
        });
    } else {
        //there are parameters
        let neighborhoodArray = req.query.id.split(",");
        //console.log(neighborhoodArray);

        let returnJson = "[";
        let i = 0;
        db.all('SELECT * FROM Neighborhoods', (err, rows) => {
            //console.log(rows);

            let found = false;
            let i;
            for(i = 0; i < neighborhoodArray.length; i++) {
                let j;
                for(j = 0; j < rows.length; j++) {
                    if(neighborhoodArray[i] == rows[j].neighborhood_number) {
                        found = true;
                        //console.log("success");
                        //console.log(rows[j]);
                        returnJson += JSON.stringify(rows[j]);
                        returnJson += ",";
                    }
                }
                if(found == false) {
                    res.status(404).send('Error: neighborhood ' + neighborhoodArray[i] + " not found.");
                    return 0;
                }
                found = false;
            }
            returnJson = returnJson.substring(0, returnJson.length - 1);
            returnJson +="]";
            //console.log(returnJson);
            res.status(200).type('json').send(returnJson);
        });
        
    }
    
});

app.get('/incidents', (req, res) => {
    
    let start_date = req.query.start_date + "";
    let end_date = req.query.end_date + "";
    let code = req.query.code + "";
    let grid = req.query.grid + "";
    let neighborhood = req.query.neighborhood + "";
    let limit;

    if(start_date == "undefined" || start_date == "true") {
        start_date = "0000-01-01";
    } else {
        if(isNaN(parseInt(start_date.split("-")[0])) || isNaN(parseInt(start_date.split("-")[1])) || isNaN(parseInt(start_date.split("-")[2]))) {
            res.status(500).send("Error: start date is not a number.");
            return 0;
        } else {
            if(parseInt(start_date.split("-")[1]) < 1 || parseInt(start_date.split("-")[1]) > 12) {
                res.status(500).send("Error: start date month is not a valid month.");
                return 0;
            }
            if(parseInt(start_date.split("-")[2]) < 1) {
                res.status(500).send("Error: start date day is not a valid day.");
                return 0;
            }
            let isLeapYear;
            if(parseInt(start_date.split("-")[0]) % 4 == 0) {
                if(parseInt(start_date.split("-")[0]) % 100 == 0) {
                    if(parseInt(start_date.split("-")[0]) % 400 == 0) {
                        isLeapYear = true;
                    } else {
                        isLeapYear = false;
                    }
                } else {
                    isLeapYear = true;
                }
            } else {
                isLeapYear = false;
            }

            if(parseInt(start_date.split("-")[1]) == 2 && isLeapYear == true) {
                if(parseInt(start_date.split("-")[2]) > 29) {
                    res.status(500).send("Error: start date day is not a valid day.");
                    return 0;
                }
            } else if(parseInt(start_date.split("-")[1]) == 2 && isLeapYear == false) {
                if(parseInt(start_date.split("-")[2]) > 28) {
                    res.status(500).send("Error: start date day is not a valid day.");
                    return 0;
                }
            } else if((parseInt(start_date.split("-")[1]) == 1 || parseInt(start_date.split("-")[1]) == 3 || parseInt(start_date.split("-")[1]) == 5 || parseInt(start_date.split("-")[1]) == 7 || parseInt(start_date.split("-")[1]) == 8 || parseInt(start_date.split("-")[1]) == 10 || parseInt(start_date.split("-")[1]) == 12) && parseInt(start_date.split("-")[2]) > 31) {
                res.status(500).send("Error: start date day is not a valid day.");
                return 0;
            } else if((parseInt(start_date.split("-")[1]) == 4 || parseInt(start_date.split("-")[1]) == 6 || parseInt(start_date.split("-")[1]) == 9 || parseInt(start_date.split("-")[1]) == 11) && parseInt(start_date.split("-")[2]) > 30) {
                res.status(500).send("Error: start date day is not a valid day.");
                return 0;
            }
        }
        //console.log(parseInt(start_date.split("-")[0]));
    }
    if(end_date == "undefined" || end_date == "true") {
        end_date = "3001-12-31";
    } else {
        if(isNaN(parseInt(end_date.split("-")[0])) || isNaN(parseInt(end_date.split("-")[1])) || isNaN(parseInt(end_date.split("-")[2]))) {
            res.status(500).send("Error: end date is not a number.");
            return 0;
        } else {
            if(parseInt(end_date.split("-")[1]) < 1 || parseInt(end_date.split("-")[1]) > 12) {
                res.status(500).send("Error: end date month is not a valid month.");
                return 0;
            }
            if(parseInt(end_date.split("-")[2]) < 1) {
                res.status(500).send("Error: end date day is not a valid day.");
                return 0;
            }
            let isLeapYear;
            if(parseInt(end_date.split("-")[0]) % 4 == 0) {
                if(parseInt(end_date.split("-")[0]) % 100 == 0) {
                    if(parseInt(end_date.split("-")[0]) % 400 == 0) {
                        isLeapYear = true;
                    } else {
                        isLeapYear = false;
                    }
                } else {
                    isLeapYear = true;
                }
            } else {
                isLeapYear = false;
            }

            if(parseInt(end_date.split("-")[1]) == 2 && isLeapYear == true) {
                if(parseInt(end_date.split("-")[2]) > 29) {
                    res.status(500).send("Error: end date day is not a valid day.");
                    return 0;
                }
            } else if(parseInt(end_date.split("-")[1]) == 2 && isLeapYear == false) {
                if(parseInt(end_date.split("-")[2]) > 28) {
                    res.status(500).send("Error: end date day is not a valid day.");
                    return 0;
                }
            } else if((parseInt(end_date.split("-")[1]) == 1 || parseInt(end_date.split("-")[1]) == 3 || parseInt(end_date.split("-")[1]) == 5 || parseInt(end_date.split("-")[1]) == 7 || parseInt(end_date.split("-")[1]) == 8 || parseInt(end_date.split("-")[1]) == 10 || parseInt(end_date.split("-")[1]) == 12) && parseInt(end_date.split("-")[2]) > 31) {
                res.status(500).send("Error: end date day is not a valid day.");
                return 0;
            } else if((parseInt(end_date.split("-")[1]) == 4 || parseInt(end_date.split("-")[1]) == 6 || parseInt(end_date.split("-")[1]) == 9 || parseInt(end_date.split("-")[1]) == 11) && parseInt(end_date.split("-")[2]) > 30) {
                res.status(500).send("Error: end date day is not a valid day.");
                return 0;
            }
        }
        //console.log(parseInt(end_date.split("-")[0]));
    }
    //console.log(start_date.split("-")[0]);
    let start_year = parseInt(start_date.split("-")[0]);
    let start_month = parseInt(start_date.split("-")[1]);
    let start_day = parseInt(start_date.split("-")[2]);

    let end_year = parseInt(end_date.split("-")[0]);
    let end_month = parseInt(end_date.split("-")[1]);
    let end_day = parseInt(end_date.split("-")[2]);
    //console.log(end_date.split("-")[0]);
    //console.log(end_year + "/" + end_month + "/" + end_day);

    let codeArray;
    if(code != "undefined" && code != "true") {
        codeArray = req.query.code.split(",");
    }

    let gridArray;
    if(grid != "undefined" && grid != "true") {
        gridArray = req.query.grid.split(",");
    }

    let neighborhoodArray;
    if(neighborhood != "undefined" && neighborhood != "true") {
        neighborhoodArray = req.query.neighborhood.split(",");
    }

    if(req.query.limit == undefined || req.query.limit + "" == "true") {
        limit = 1000;
    } else {
        limit = req.query.limit;
    }

    //console.log(start_date + "\n" + end_date + "\n" + code + "\n" + grid + "\n" + neighborhood + "\n" + limit + "\n");
    // AND date_time < ? 
    db.all('SELECT * FROM Incidents ORDER BY date_time', (err, rows) => {
        let incidentArray = JSON.stringify(rows).split("},{");
        //console.log(rows);
        if(incidentArray.length <= limit) {
            limit = incidentArray.length;
        }
        if(codeArray != undefined) {
            for(let j = 0; j < codeArray.length; j++) {//make sure all inputted codes are valid
                let exists = false;
                for(let i = 0; i < incidentArray.length; i++) {
                    let temp = incidentArray[i].split("code\":");
                    temp = temp[1].split(",\"incident\"")[0];
                    //console.log(temp);
                    if(temp == codeArray[j]) {
                        exists = true;
                    }
                }
                if(exists == false) {
                    res.status(500).send("Error: code " + codeArray[j] + " is not a valid code.");
                    return 0;
                }
                exists = false;
            }
        }
        if(gridArray != undefined) {
            for(let j = 0; j < gridArray.length; j++) {//make sure all inputted grids are valid
                let exists = false;
                for(let i = 0; i < incidentArray.length; i++) {
                    let temp = incidentArray[i].split("police_grid\":");
                    temp = temp[1].split(",\"neighborhood_number\"")[0];
                    //console.log(temp);
                    if(temp == gridArray[j]) {
                        exists = true;
                    }
                }
                if(exists == false) {
                    res.status(500).send("Error: grid " + gridArray[j] + " is not a valid grid.");
                    return 0;
                }
                exists = false;
            }
        }
        if(neighborhoodArray != undefined) {
            for(let j = 0; j < neighborhoodArray.length; j++) {//make sure all inputted neighborhoods are valid
                let exists = false;
                for(let i = 0; i < incidentArray.length; i++) {
                    let temp = incidentArray[i].split("neighborhood_number\":");
                    temp = temp[1].split(",\"block\"")[0];
                    //console.log(temp);
                    if(temp == neighborhoodArray[j]) {
                        exists = true;
                    }
                }
                if(exists == false) {
                    res.status(500).send("Error: neighborhood " + neighborhoodArray[j] + " is not a valid neighborhood.");
                    return 0;
                }
                exists = false;
            }
        }
        for(let i = 0; i < incidentArray.length; i++) {
            
            



            //grab the date and time
            
            let temp = incidentArray[i].split("date_time\":\"");
            temp = temp[1].split("\",\"code\"");
            let date_timeString = temp[0];
            //console.log(date_timeString);

            let dateString = date_timeString.split("T")[0];
            let timeString = date_timeString.split("T")[1];

            temp = incidentArray[i].split("date_time\":\"");
            let finalString = "";
            if(i != 0) {
                if(i == incidentArray.length - limit) {
                    finalString += "[";
                }
                finalString += "{";
            }
            finalString += temp[0];
            finalString += "date\":\"";
            //new split up date and time
            finalString += dateString;
            finalString += "\",\"time\":\""
            finalString += timeString;

            finalString += "\",\"code\""
            temp = temp[1].split("\",\"code\"");
            finalString += temp[1];

            if(i != incidentArray.length - 1) {
                finalString += "},";
            } else {
                finalString += "}";
            }

            incidentArray[i] = finalString;
        }
        let jsonString = "";
        //loop through array backwards
        let count = 0;
        for(let i = incidentArray.length - 1; i >= 0; i--) {
            let temp = incidentArray[i].split("date\":\"");
            //console.log(temp);
            temp = temp[1].split("\",\"time\"");
            //console.log(temp);
            temp = temp[0]
            //temp now equals the date
            let year = parseInt(temp.split("-")[0]);
            let month = parseInt(temp.split("-")[1]);
            let day = parseInt(temp.split("-")[2]);

            //console.log(start_year + "/" + start_month + "/" + start_day);
            if(year >= start_year && year <= end_year) {//if it is in the correct year range
                if((year == start_year && month >= start_month) || (year == end_year && month <= end_month) || (year != start_year && year != end_year)) {//if it is the start year, make sure it's after the start month, and vice versa for the end year
                    if((year == start_year && month == start_month && day < start_day) || (year == end_year && month == end_month && day > end_day)) {//if it is the start year and month, make sure it's after the start day, and vice versa for the end date
                        //do nothing
                    } else {
                        //console.log("test");
                        if(count < limit) {
                            if(codeArray != undefined) {
                                let code = incidentArray[i].split("\"code\":")[1];
                                code = parseInt(code.split(",\"incident\":\"")[0]);
                                for(let j = 0; j < codeArray.length; j++) {
                                    if(parseInt(codeArray[j]) == code) {
                                        if(gridArray != undefined) {
                                            let grid = incidentArray[i].split("\"police_grid\":")[1];
                                            grid = parseInt(grid.split(",\"neighborhood_number\":\"")[0]);
                                            for(let m = 0; m < gridArray.length; m++) {
                                                if(parseInt(gridArray[m]) == grid) {
                                                    if(neighborhoodArray != undefined) {
                                                        let neighborhood = incidentArray[i].split("\"neighborhood_number\":")[1];
                                                        neighborhood = parseInt(neighborhood.split(",\"block\":\"")[0]);
                                                        for(let n = 0; n < neighborhoodArray.length; mn++) {
                                                            if(parseInt(neighborhoodArray[n]) == neighborhood) {
                                                                jsonString += incidentArray[i];
                                                                count++;
                                                            }
                                                        }
                                                    } else {
                                                        jsonString += incidentArray[i];
                                                        count++;
                                                    }
                                                }
                                            }
                                        } else {
                                            if(neighborhoodArray != undefined) {
                                                let neighborhood = incidentArray[i].split("\"neighborhood_number\":")[1];
                                                neighborhood = parseInt(neighborhood.split(",\"block\":\"")[0]);
                                                for(let n = 0; n < neighborhoodArray.length; n++) {
                                                    if(parseInt(neighborhoodArray[n]) == neighborhood) {
                                                        jsonString += incidentArray[i];
                                                        count++;
                                                    }
                                                }
                                            } else {
                                                jsonString += incidentArray[i];
                                                count++;
                                            }
                                        }
                                    }
                                }
                            } else {
                                if(gridArray != undefined) {
                                    let grid = incidentArray[i].split("\"police_grid\":")[1];
                                    grid = parseInt(grid.split(",\"neighborhood_number\":\"")[0]);
                                    for(let m = 0; m < gridArray.length; m++) {
                                        if(parseInt(gridArray[m]) == grid) {
                                            if(neighborhoodArray != undefined) {
                                                let neighborhood = incidentArray[i].split("\"neighborhood_number\":")[1];
                                                neighborhood = parseInt(neighborhood.split(",\"block\":\"")[0]);
                                                for(let n = 0; n < neighborhoodArray.length; n++) {
                                                    if(parseInt(neighborhoodArray[n]) == neighborhood) {
                                                        jsonString += incidentArray[i];
                                                        count++;
                                                    }
                                                }
                                            } else {
                                                jsonString += incidentArray[i];
                                                count++;
                                            }
                                        }
                                    }
                                } else {
                                    if(neighborhoodArray != undefined) {
                                        let neighborhood = incidentArray[i].split("\"neighborhood_number\":")[1];
                                        neighborhood = parseInt(neighborhood.split(",\"block\":\"")[0]);
                                        for(let n = 0; n < neighborhoodArray.length; n++) {
                                            if(parseInt(neighborhoodArray[n]) == neighborhood) {
                                                jsonString += incidentArray[i];
                                                count++;
                                            }
                                        }
                                    } else {
                                        jsonString += incidentArray[i];
                                        count++;
                                    }
                                }
                            }
                            
                            
                        }
                        
                    }
                }
            }


            //jsonString += incidentArray[i];
        }
        jsonString = jsonString.substring(0, jsonString.length - 1);
        
        //console.log(jsonString);
        res.status(200).type('json').send(jsonString);
    });
    
});

app.delete('/remove-incident', (req, res)  => {

    let case_number = JSON.stringify(req.body);
    //case_number = JSON.stringify(case_number.case_number);
    case_number = case_number.split("case_number:")[1];
    case_number = case_number.split("}\"")[0];
    //console.log(case_number);
    //case_number = case_number.substring(1,case_number.length);
    //console.log(case_number);
    //console.log(req + "---");

    let exists = false;
    db.all('SELECT case_number FROM Incidents', (err, rows) => {
        //console.log("test");
        if(rows == undefined) {
            
            res.status(500).send("case " + case_number + " not found in database.");
            return 0;
        }
        
        for(let i = 0; i < rows.length; i++) {
            if(rows[i].case_number == case_number) {
                exists = true;
            }
        }
        if(exists == true) {
            
            db.all('DELETE FROM Incidents WHERE case_number=?', [case_number], (err) => {
                //console.log("test2");
                res.status(200).send("deleted successfully");
                return 0;
            });
        } else {
            res.status(500).send("case " + case_number + " not found in database.");
        }
        
    });

    

 

});

app.listen(port, '0.0.0.0');
