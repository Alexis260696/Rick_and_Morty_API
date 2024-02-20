/* 
Requisitos:
Usar de preferencia Javascript o typescript
- Peticionar a API de Rick & Morty
- Implementa almacenamiento local para guardar los registros de la API. (Personajes)
- Implementa funciones básica a la lista de personajes. Crear una API con los siguientes métodos:
    - [ ] GET (Obtener todos los registros)
    - [ ] POST (Añadir nuevo registro, mandando los datos en el body)
    - [ ] PATCH (Modificar registro, con base al body)
    - [ ] DELETE (Borrar registro en base a un id)
    - [ ] GET (Resetear registros locales peticionando a la API de Rick & Morty)
- Usar Postman o similar.
- Mostrar en consola los resultados.

Puntos extra:
- Hacer el typado de los datos.
- Usar manejo de errores
- Formatear los datos antes del envío, para presentarlos de diferente manera a la dada por la API de Rick & Morty.
*/

const apiLink = "https://rickandmortyapi.com/api/character"
console.log("hola mundo")

const express = require('express')
const app = express()
const port = 3000
const axios = require('axios');
const fs = require('fs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/resetLocal', (req, res) => {
    let getPage = (url, getNextPage, db = []) => {
        axios.get(url)
            .then((response) => {
                let nextPageURL = response.data.info.next
                console.log(nextPageURL);
                db.push(...response.data.results);
                if (nextPageURL !== null) {
                    getNextPage(nextPageURL, getNextPage, db);
                }
                else {
                    fs.writeFile('db.json', JSON.stringify(db), (error) => {
                        if (error) {
                            console.error(error);
                        }
                    });
                    console.log(db);
                }
            })
            .catch((error) => {
                console.error(error);
            })
    }
    getPage(apiLink, getPage)
    res.send('OK')
})

app.get('/characters', (req, res) => {
    fs.readFile("./db.json", "utf8", (error, data) => {
        if (error) {
            console.log(error);
            return;
        }
        let aux = JSON.parse(data)
        console.log(aux);
        res.send(aux)
    });
})

app.post('/addCharacter', (req, res) => {
    console.log(req.body);
    fs.readFile("./db.json", "utf8", (error, data) => {
        if (error) {
            console.log(error);
            return;
        }
        let aux = JSON.parse(data)
        let index = aux.length - 1;
        let newID = aux[index].id + 1;
        let newRegister = req.body;
        newRegister.id = newID;
        aux.push(newRegister);
        fs.writeFile('db.json', JSON.stringify(aux), (error) => {
            if (error) {
                console.error(error);
            }
        });
        res.send('OK');
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})