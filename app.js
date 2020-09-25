const { response } = require('express');
const express = require('express');
const app = express();

//help me with error messages
const morgan = require('morgan');
app.use(morgan('short'));

//create my connection here
const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "saskfunddb"
  });
  con.connect(err =>{
    if (err) throw err;
});//ends my connet.

app.use(express.static('./public'));
app.use(express.static('./views'));

//Helps me get information from my server.
app.get('/', (req, res)=> {

    res.redirect('index.html');
});

app.get('/client', function(req, res) {
    res.redirect('client.html');
});

app.get('/eligibility', function(req, res) {
    res.redirect('eligibility.html');
});

//view all client in browser
app.get('/api/client', (req, res) => {
    let dQuery = "SELECT * FROM client_full_information  ORDER BY CLIENT_ID LIMIT 5";
        
        con.query(dQuery, (err, result, fields) => {
        if (err){
            console.log('Error: Failed to select the data, check select query');
            res.sendStatus(500);
            return;
        } 
        clients = result;
        res.json(clients);
        });
    
});

//search client by ID or Name
app.get('/api/client/:id', (req, res) => {
    dReq = req.params.id;
    dQuery = '';
    dMsg = '';
    if(isNaN(dReq)){
        dQuery = `SELECT Name, Client_ID, Gender, Age, City, Gold_Membership FROM client_full_information WHERE NAME LIKE '${dReq}%' ORDER BY CLIENT_ID`;
        dMsg = `The Client with the name <b>${dReq}</b> does not exist in our system`;
    }
    else{
        dQuery = `SELECT Name, Client_ID, Gender, Age, City, Gold_Membership FROM client_full_information WHERE Client_ID=${dReq}`;
        dMsg = `The Client_ID <b>${dReq}</b> does not exist in out system`;
     }
     
        con.query(dQuery, (err, result, fields) => {
        if (err){
            console.log('Error: Failed to select the data, check select query');
            res.sendStatus(500);
            return;
        } 
        clients = result;
        //if not found send a status 404 
        if(clients.length==0)
        {
            res.status(404).send(`<div style="color:red; font-size:24">${dMsg}</div>`);
            return;
        }
            
        res.json(clients);
        //res.send(JSON.stringify(clients));
        });

});

//Search for eligible clients here
app.get('/api/eligibility/:id', (req, res) => {
    dReq = req.params.id;
    dQuery = '';
 
    //Please check if it's client id, else show an error message.
    if(isNaN(dReq)){
        
       res.send(`<div style="color:red; font-size:24">${dReq} is not an ID, Please type a Client ID</div>`);
    }
    else
    {
        dQuery = `SELECT * FROM ( SELECT Name, Client_ID, Monthly_Repayment, IF((cfi.Length_at_Residence <6) AND 
        (cfi.Monthly_Repayment < 40_45Percent_Income) AND 
        (cfi.House_Value = 0) AND 
        (cfi.Age > 24) OR ((cfi.Age > 21 AND cfi.Education > 3)), 'Yes','No' ) Eligible_Status 
        FROM client_full_information cfi) q WHERE  Client_ID=${dReq}`;

        con.query(dQuery, (err, result, fields) => {
                    if (err){
                        console.log('Error: Failed to select the data, check select query');
                        res.sendStatus(500);
                        return;
                    } 
                    clients = result;
                    //if not found send a status 404 
                    if(clients.length==0)
                    {
                        res.status(404).send(`<div style="color:red; font-size:24">The Client_ID: ${dReq} is not  valid</div>`);
                        return;
                    }
                    
                   
                   res.json(clients);
                    //res.send(JSON.stringify(clients));
            });
    }
    
});

//using environment variable - helping for deployment purposes.
const myPort = process.env.PORT || 3001;
app.listen(myPort, () => console.log(`Listening on port ${myPort}...`));


