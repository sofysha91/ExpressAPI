const express = require("express");
const fs = require("fs");
const fsPromise = require("fs/promises");

const app = express();

//Middlewares
app.use(express.json());

app.get("/", (request, response) => {
    response.write("Welcome :)");
    response.end();
});

app.get("/callback-file", (request, response) => {
    fs.readFile("text1.txt", "utf-8", (err, data) => {
        if(err){
            response.write("Error", err);
            response.end();
        }
        response.write(data);
        response.end();
    });
});

app.get("/promises-file", (request, response) => {
   fsPromise.readFile("text1.txt", "utf-8")
    .then((data) => {
        response.write(data);
        response.end();
    })
    .catch((err) => {
        response.write("Error", err);
        response.end();
    });
});

app.get("/async-file", async (request, response) => {
    
    try {
        const file = await fsPromise.readFile("text1.txt", "utf-8");
        response.write(file);
        response.end();
     } catch (err) {
         response.write("Error", err);
          response.end();
     }
 });

 /**
  * Endpoints Koders
  * recurso -> koders
  */

/**
 * Parametros en las rutas
 * 1. PATH PARAM ->  identificadores, modifican la ruta del lado de back
 * /recurso/identificador  eg: /koders/:id
 * 2. QUERY PARAM -> no cambian la ruta
 * ?ciudad=Gdl&municipio=Zapopan 
 */

 app.get("/koders", async (request, response) => {
    const { query } = request;

    try {
        const db = await fsPromise.readFile("koders.json", "utf-8");
        const parsedDB = JSON.parse(db);
        let foundKoder = parsedDB.koders ?? [];
        //filtramos koders
        if(Object.keys(query).length){
            foundKoder = foundKoder.filter((koder) => {
                return Object.keys(query).every((key) =>{
                   //console.log(koder[key], query[key], koder[key] === query[key]);
                   return koder[key].toString() === query[key];
                }); 
            });            
        }
        response.json(foundKoder);

    } catch (err) {
        response.write("Error", err);
        response.end();
    }
});

//Recibir un koder especifico por id
app.get("/koders/:id", async (request, response) => {
    const { params } = request;

    try {
        const db = await fsPromise.readFile("koders.json", "utf-8");
        const parsedDB = JSON.parse(db);
        //filtramos koder
        const foundKoder = parsedDB.koders.filter((koder) => koder.id === parseInt(params.id));
        response.json(foundKoder[0]);
       
    } catch (err) {
        response.write("Error", err);
        response.end();
    }
});

/**
 * Post koders
 */
 app.post("/koders", async (request, response) => {
    const { body } = request;
    
    const db = await fsPromise.readFile("koders.json", "utf-8");
    const parsedDB = JSON.parse(db);

    const newKoder = {
        id: parsedDB.koders.length + 1,
        ...body
    }
    parsedDB.koders.push(newKoder);

    await fsPromise.writeFile("koders.json", JSON.stringify(parsedDB, "\n", 2) ,"utf-8")
    
    response.status(201);
    response.json(newKoder);
});

// Ejercicio
// PUT -> me van a reemplazar el koder
// PATH PARAM -> id
// BODY -> data que tienen que reeemplazar
// REFLEJAr -> en su bd -> koders.json
// findIndex

app.put("/koders/:id", async (request, response) => {
    const { body } = request;
    const { params } = request;

    const db = await fsPromise.readFile("koders.json", "utf-8");
    const parsedDB = JSON.parse(db);
    
    let koder = parsedDB.koders.findIndex((koder) => koder.id === parseInt(params.id));
    
    if(koder = -1){
        throw new Error("Koder no existe");         
    }

    //update koder
    koder = body;
    koder.id = params.id;

    parsedDB.koders[params.id - 1] = koder;

    console.log(parsedDB.koders)    

    await fsPromise.writeFile("koders.json", JSON.stringify(parsedDB, "\n", 2) ,"utf-8")
    
    //response.status(201);
    response.json(koder);
});

app.listen(8080, () => {
    console.log("Server is listening...");
});