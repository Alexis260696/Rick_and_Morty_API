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

const express = require('express')
const axios = require('axios');
const fs = require('fs')
const app = express()
const port = 3000
const apiLink = "https://rickandmortyapi.com/api/character"

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.get('/character/:id', (req, res) => {
    const characterId = parseInt(req.params.id);
    const character = req.characters.find(char => char.id === characterId);
    if (character) {
        res.send(character);
    } else {
        res.status(404).send('Character not found');
    }
});


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
                            return;
                        }
                    });
                    console.log(db);
                }
            })
            .catch((error) => {
                console.error(error);
                return;
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


app.post('/character/add', (req, res) => {
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
                return;
            }
        });
        res.send('OK');
    });
});


app.patch('/character/:id/update', (req, res) => {
    const characterId = parseInt(req.params.id);
    const updatedData = req.body;

    fs.readFile("./db.json", "utf8", (error, data) => {
        if (error) {
            console.log(error);
            return;
        }

        let characters = JSON.parse(data);
        const characterIndex = characters.findIndex(character => character.id === characterId);

        if (characterIndex === -1) {
            return res.status(404).send('Character not found');
        }

        characters[characterIndex] = { ...characters[characterIndex], ...updatedData };

        fs.writeFile('db.json', JSON.stringify(characters), (error) => {
            if (error) {
                console.error(error);
                return;
            }

            return res.send('Character updated successfully');
        });
    });
});


app.delete('/character/:id/delete', (req, res) => {
    const characterId = parseInt(req.params.id);

    fs.readFile("./db.json", "utf8", (error, data) => {
        if (error) {
            console.log(error);
            return;
        }

        let characters = JSON.parse(data);
        const characterIndex = characters.findIndex(character => character.id === characterId);

        if (characterIndex === -1) {
            return;
        }

        // Eliminar el personaje del array
        characters.splice(characterIndex, 1);

        fs.writeFile('db.json', JSON.stringify(characters), (error) => {
            if (error) {
                console.error(error);
                return;
            }

            res.send('Character deleted successfully');
        });
    });
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
