const express = require('express') //enables us to use express
const app = express() //stores for ease of use
const MongoClient = require('mongodb').MongoClient //Sets up connection to mongo DB
const PORT = 8001 //Setting up the port
require('dotenv').config() //npm which help us import environmental variables


let db,
    dbConnectionStr = process.env.DB_STRING, //taking the string which is all the names of the collections in the to do list database loads environment variables
    dbName = 'New-Medication-App', //declares todo as the db name
    collection
                    //dbConnection string is client name?
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }) //connecting database through strings if true then
    .then(client => {
        console.log(`Connected to ${dbName} Database`) //console logs the database name
        db = client.db(dbName)// connects the client to their own database
        collection = db.collection('Medications')
    })
    
app.set('view engine', 'ejs') //enable ejs to be used
app.use(express.static('public')) //able to use public folder 
app.use(express.urlencoded({ extended: true })) //looks at incoming request recognize url then uses parsing to be to use the code
app.use(express.json()) //uses express us to use json


app.get('/',async (request, response)=>{//goes to root and uses async 
    const medsToTake = await db.collection('Medications').find().toArray() //declares a variable that atkes in losts and stores them in an array. allows us to make a promise using the array
    const medsLeft = await db.collection('Medications').countDocuments({completed: false}) //. after you find the items and count to items in the to do list and the not to do list (you're constantly allowing it the code to that counts the documents and return what you asked for)
    response.render('index.ejs', { Meds: medsToTake, left: medsLeft }) //renders the index.ejs
   
})

app.post('/addmed', (req, response) => {
    const medName = req.body.Medication
    db.collection('Medications').insertOne(
        { 
        Medication: req.body.Medication,
        Strength: req.body.Strength,
        Quantity: req.body.Quantity,
        Type: req.body.Type,
        Time: req.body.Time, 
        completed: false
    })//insert object into todos collection (completed false)
    .then(result => { //if ok - then do next line
        console.log(`${medName} Added`) // console log string
        response.redirect('/') //reload page back to root
    })
    .catch(error => console.error(error)) //catch error
})

app.put('/markComplete', (request, response) => {//update markcomplete 
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //update todos collection using request from the body object. process fetch request and grab item from body
        $set: {
            completed: true //marking complete setting to true checks
          }
    },{
        sort: {_id: -1},//sort by id in reverse order
        upsert: false //upsert is an option that is used for update operation/ By default, the value of the upsert option is false.
    })
    .then(result => {
        console.log('Marked Complete') //console log string 
        response.json('Marked Complete') //respond with json 
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => { //update markUncomplete 
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //using the info from 
        $set: {
            completed: false //set to false so that it unchecks
          }
    },{
        sort: {_id: -1}, //sort in reverse
        upsert: false 
    })
    .then(result => {
        console.log('Marked UnComplete') //console log string
        response.json('Marked UnComplete') //respond client-side with json newly rendered list
    })
    .catch(error => console.error(error)) //catch error

})

app.delete('/deleteItem', (request, response) => {
    db.collection('Medications').deleteOne({thing: request.body.itemFromJS}) //delete an object from the todos collection
    .then(result => { //if ok then do next line
        console.log('Todo Deleted') //console log string
        response.json('Todo Deleted') // respond to client-side with json newly rendered list
    })
    .catch(error => console.error(error)) //catch error

})

//edit page

app
    .route("/edit/:id")
    .get(async (req, res) => {
        
        const id = req.params.id
        console.log(id)
        const medsToTake = await db.collection('Medications').find().toArray()
            res.render('edit.ejs', { Meds: medsToTake, idMed: id})
        })
    .post((req,res) => {
        const id = req.params.id
        const medsToTake = await db.collection('Medications').findByIdAndUpdate(
            id, 
            {
            Medication: req.body.Medication,
            Strength: req.body.Strength,
            Quantity: req.body.Quantity,
            Type: req.body.Type,
            Time: req.body.Time
        })
        
    })




//app.get('/edit/:id', async (req,res) => { 
        
    //console.log(req) 
    //const id = req.params.id
    //console.log(`this is the id ${id}`)
    //const medsToTake = await db.collection('Medications').find().toArray() //retreive collection from db again "medicatioToAdd" is db and "Medications" is the collection
    //res.render('edit.ejs', {Meds: medsToTake, idMed: id }) //"Meds" = list of all meds and "idMed" = specific med to edit by id
       
    //})

//app.post('/edit/:id', (req,res) => {
    //const id = req.params.id
    //console.log(id)
    //db.collection('Medications').updateOne( //requires id and structure to update (similar to original get post)
            
    //id, 
       //{
           //Medication: req.body.Medication,
           //Strength: req.body.Strength,
           //Quantity: req.body.Quantity,
           //Type: req.body.Type,
           //Time: req.body.Time
       //})
    //res.json('Medication Updated')
    //res.redirect('/')
//})

app.listen(process.env.PORT || PORT, ()=>{ //listen for a certain port: local and the ports generated by heroku 
    console.log(`Server running on port ${PORT}`) //console log the port number
})