const cors = require('cors');

var express = require('express');
var app = express();
app.use(cors());
app.use(express.json());
const path = require('path');


//var sql = require("mssql");

const sql = require("mssql");

// config for your data]base
const config = {
    user: 'DreamKillers',
    password: 'essentialFavorable71',
    server: '185.157.245.175', 
    port: 1433,
    database: 'DreamKillersDB',
    trustServerCertificate: true,
};
// crea una nueva instancia de conexión a la base de datos
const dblClick = new sql.ConnectionPool(config);
let pool;
    let transaction;

// maneja los errores de conexión
dblClick.on('error', err => {
    console.log('Error de conexión:', err);
});

// Read
app.get('/api/Usuario/:id', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        sentencia = "select * from Usuario where id = " + req.params.id;
        console.log(sentencia);
        request.query(sentencia, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset[0]);
            
        });
    });
    
});

// Create
app.post('/api/Usuario', (req, res) => {
    sql.connect(config, err => {
        if (err) {
            console.log(err);
            res.status(500).send('No se puede connectar a la base de datos.');
        } else {
            const request = new sql.Request();
            console.log(req.body);
            const { username, password } = req.body;
            sentencia = `INSERT INTO Usuario (username, password) VALUES ( '${username}', '${password}')`;
            console.log(sentencia);
            request.query(sentencia, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('No se pudo crear el registro.');
            } else {
                res.status(201).send('Registro creado.');
            }
            });
        }
    });
});

app.get('/api/Usuario/:id', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        sentencia = "select * from usuario where username = '" + req.params.id + "'"; 
        console.log(sentencia);
        request.query(sentencia, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset[0]);
            
        });
    });
    
});



app.get('/api/validateUsers', (req, res) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        // Aquí puedes realizar una consulta a la base de datos para obtener los datos del usuario
        // Luego, envía los datos del usuario como respuesta
        res.status(200).json({ userId: userId, username: 'example_username', email: 'example@example.com' });
    } else {
        res.status(401).json({ error: 'Usuario no autenticado' });
    }
});


app.post('/api/validateUser', (req, res) => {
    // Extract username and password from the request body
    const { username, password } = req.body;

    // Connect to the SQL server
    sql.connect(config)
        .then(pool => {
            // If the connection is successful, execute the query
            return pool.request()
                .input('username', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .query('SELECT id, username FROM Usuario WHERE username = @username AND password = @password');
        })
        .then(result => {
            // If a user is found, send user data
            if (result.recordset.length > 0) {
                res.send({ success: true, userData: result.recordset[0] });
            } else {
                // If no user is found, send an error message
                res.send({ success: false, message: 'Usuario o contraseña incorrectos' });
            }
            sql.close();
        })
        .catch(err => {
            // Handle SQL connection or query errors
            console.error(err);
            res.status(500).send({ success: false, message: 'Error interno del servidor' });
            sql.close();
        });
});

/* app.get('/api/load-object/:id', (req, res) => {
    const idObjeto = req.params.id; // Obtiene el ID del objeto de los parámetros de la solicitud
    const sqlQuery = "SELECT objUrl, mtlUrl FROM Objeto WHERE id_objeto = @idObjeto";

    // Ejecuta la consulta SQL utilizando la instancia de conexión
    dblClick.connect().then(pool => {
        return pool.request()
            .input('idObjeto', sql.Int, idObjeto)
            .query(sqlQuery);
    }).then(result => {
        // Procesa el resultado de la consulta
        if (result.recordset.length > 0) {
            const urls = result.recordset.map(row => ({
                objUrl: row.objUrl,
                mtlUrl: row.mtlUrl
            }));
            res.status(200).json(urls); // Envía un arreglo de objetos JSON con las URLs recuperadas
        } else {
            res.status(404).json({ error: "No se encontró el objeto" }); // Envía un mensaje JSON si no se encontró el objeto
        }
    }).catch(err => {
        // Maneja los errores de consulta
        console.log('Error de consulta:', err);
        res.status(500).json({ error: "Error interno del servidor" }); // Envía un mensaje JSON de error interno del servidor
    });
}); */


app.get('/api/load-all-objects', (req, res) => {
    const sqlQuery = "SELECT id_objeto, titulo, imgUrl, objUrl, mtlUrl, Empresa FROM Objeto"; // Consulta SQL para obtener todos los objetos

    // Ejecuta la consulta SQL utilizando la instancia de conexión
    dblClick.connect().then(pool => {
        return pool.request().query(sqlQuery);
    }).then(result => {
        // Procesa el resultado de la consulta
        if (result.recordset.length > 0) {
            const urls = result.recordset.map(row => ({
                id_objeto:row.id_objeto,
                Titulo: row.titulo,
                objUrl: row.objUrl,
                mtlUrl: row.mtlUrl,
                imgUrl: row.imgUrl,
                Empresa: row.Empresa


            }));
            res.status(200).json(urls); // Envía un arreglo de objetos JSON con las URLs recuperadas
        } else {
            res.status(404).json({ error: "No se encontraron objetos" }); // Envía un mensaje JSON si no se encontraron objetos
        }
    }).catch(err => {
        // Maneja los errores de consulta
        console.log('Error de consulta:', err);
        res.status(500).json({ error: "Error interno del servidor" }); // Envía un mensaje JSON de error interno del servidor
    });
});


app.get('/api/load-object/:id', (req, res) => {
    const idObjeto = req.params.id; // Obtiene el ID del objeto de los parámetros de la solicitud
    const sqlQuery = "SELECT id_objeto, titulo, objUrl, mtlUrl, imgUrl, Empresa FROM Objeto WHERE id_objeto = @idObjeto";

    // Ejecuta la consulta SQL utilizando la instancia de conexión
    dblClick.connect().then(pool => {
        return pool.request()
            .input('idObjeto', sql.Int, idObjeto)
            .query(sqlQuery);
    }).then(result => {
        // Procesa el resultado de la consulta
        if (result.recordset.length > 0) {
            // Dado que esperamos un único objeto debido a la consulta por ID, devolvemos el primer elemento
            const objeto = result.recordset[0];
            res.status(200).json(objeto); // Envía el objeto JSON recuperado
        } else {
            res.status(404).json({ error: "No se encontró el objeto" }); // Envía un mensaje JSON si no se encontró el objeto
        }
    }).catch(err => {
        // Maneja los errores de consulta
        console.log('Error de consulta:', err);
        res.status(500).json({ error: "Error interno del servidor" }); // Envía un mensaje JSON de error interno del servidor
    });
});



app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;

    // Conexión al servidor SQL
    sql.connect(config).then(pool => {
        // Si la conexión es exitosa, ejecutamos la consulta
        return pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM Usuario WHERE id = @userId');
    }).then(result => {
        if (result.recordset.length > 0) {
            // Si encontramos el usuario, enviamos los datos del usuario
            res.send(result.recordset[0]);
        } else {
            // Si no encontramos el usuario, enviamos un mensaje de error
            res.status(404).send({ message: 'Usuario no encontrado' });
        }
        sql.close();
    }).catch(err => {
        // Manejo de errores de la conexión o consulta SQL
        console.error(err);
        res.status(500).send({ message: 'Error interno del servidor' });
        sql.close();
    });
});

app.get('/api/userAndProjects/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Query to fetch user data
        const userDataQuery = `
            SELECT * FROM Usuario WHERE id = @userId
        `;
//wdwd

        // Execute the query to fetch user data
        const userDataResult = await sql.connect(config)
            .then(pool => {
                return pool.request()
                    .input('userId', sql.Int, userId)
                    .query(userDataQuery);
            });

        // Check if user data is found
        if (userDataResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Query to fetch user-specific projects based on scenes connected to the user ID
        const projectsQuery = `
            SELECT Objeto.id_objeto, Objeto.Titulo, Objeto.objUrl, Objeto.mtlUrl, Objeto.imgUrl, Objeto.Empresa
            FROM Usuario 
            INNER JOIN EscenaObjeto ON Usuario.id = EscenaObjeto.id_usuario 
            INNER JOIN Objeto ON EscenaObjeto.id_objeto = Objeto.id_objeto
            WHERE Usuario.id = @userId
        `;

        // Execute the query to fetch projects
        const projectsResult = await sql.connect(config)
            .then(pool => {
                return pool.request()
                    .input('userId', sql.Int, userId)
                    .query(projectsQuery);
            });

        // Extract projects from the query result
        const projects = projectsResult.recordset;

        // Send the user data and projects as a JSON response
        res.json({
            userData: userDataResult.recordset[0],
            projects: projects
        });
    } catch (error) {
        console.error('Error fetching user data and projects:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});





app.get('/api/escena-objeto', async (req, res) => {
    try {
        const sqlQuery = `
            SELECT * FROM EscenaObjeto
        `;

        const result = await sql.connect(config)
            .then(pool => {
                return pool.request()
                    .query(sqlQuery);
            });

        const escenaObjetos = result.recordset;
        res.status(200).json(escenaObjetos);
    } catch (error) {
        console.error('Error fetching EscenaObjeto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});






// Create
app.post('/api/EscenaObjeto', (req, res) => {
    sql.connect(config, err => {
        if (err) {
            console.log(err);
            res.status(500).send('No se puede connectar a la base de datos.');
        } else {
            const request = new sql.Request();
            console.log(req.body);
            const { id_usuario, id_objeto } = req.body;
            sentencia = `INSERT INTO EscenaObjeto (id_usuario, id_objeto) VALUES ( '${id_usuario}', '${id_objeto}')`;
            console.log(sentencia);
            request.query(sentencia, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('No se pudo crear el registro.');
            } else {
                res.status(201).send('Registro creado.');
            }
            });
        }
    });
});



app.delete('/api/EscenaObjeto', (req, res) => {
    sql.connect(config, err => {
        if (err) {
            console.log(err);
            res.status(500).send('No se puede conectar a la base de datos.');
        } else {
            const request = new sql.Request();
            const { id_usuario, id_objeto } = req.body;
            console.log(id_usuario, id_objeto)
            const sentencia = `DELETE FROM EscenaObjeto WHERE id_usuario = '${id_usuario}' AND id_objeto = '${id_objeto}'`;

            console.log(sentencia);
            request.query(sentencia, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('No se pudo eliminar el registro.');
                } else {
                    if (result.rowsAffected[0] > 0) {
                        res.status(200).send('Registro eliminado.');
                    } else {
                        res.status(404).send('Registro no encontrado.');
                    }
                }
            });
        }
    });
});

app.get("*", (req, res) => {
    res.status(404).json({error: "Route not found"})
});


app.listen(2023, () => console.log("Listening on port 2023"));
