let express = require('express');
let sqlite3 = require('sqlite3');
let fs = require('fs');
let path = require('path');
let cors = require('cors');

let port = 8000;
let public_dir = path.join(__dirname, 'public');

let app = express();

app.use(express.static(public_dir));
app.use(express.json());
app.use(cors());


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

app.listen(port, '0.0.0.0');