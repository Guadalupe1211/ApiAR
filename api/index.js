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
/*
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
*/
app.get('/api/load-all-objects', function (req, res)  {
    sql.connect(config, function (err) {
        if (err) console.log(err);
        var request = new sql.Request();
        sentencia = "SELECT id_objeto, titulo, imgUrl, objUrl, mtlUrl, Empresa FROM Objeto";
        console.log(sentencia);
        request.query(sentencia, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset);
            
        });
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

    let pool = null;
    try {
        pool = await sql.connect(config);

        // Query to fetch all scenes with projects for the given user
        const projectsQuery = `
            SELECT Objeto.id_objeto, Objeto.Titulo, Objeto.objUrl, Objeto.mtlUrl, Objeto.imgUrl, Objeto.Empresa,
                   EscenaObjeto.id_escenaObjeto, EscenaObjeto.id_usuario, EscenaObjeto.id_escena
            FROM EscenaObjeto
            JOIN Objeto ON EscenaObjeto.id_objeto = Objeto.id_objeto
            JOIN Escena ON Escena.id_escena = EscenaObjeto.id_escena
            WHERE Escena.id_usuario = @userId;
        `;

        const projectsResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query(projectsQuery);

        if (projectsResult.recordset.length === 0) {
            return res.status(404).json({ message: 'No projects found for the user' });
        }

        res.json({
            projects: projectsResult.recordset
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (pool) {
            pool.close();
        }
    }
});



/*
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
*/
app.get('/api/EscenaObjeto', function (req, res) {
    const { id_escena } = req.query; // Get id_escena from query parameters

    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error connecting to the database.');
            return;
        }

        var request = new sql.Request();
        let query = `SELECT eo.id_escenaObjeto, eo.escala, eo.posicion, o.objUrl, o.mtlUrl, o.titulo
                     FROM EscenaObjeto eo
                     JOIN Objeto o ON eo.id_objeto = o.id_objeto`;
        if (id_escena) {
            query += ` WHERE eo.id_escena = @idEscena`; // Filter by id_escena
            request.input('idEscena', sql.Int, id_escena);
        }

        request.query(query, function (err, result) {
            if (err) {
                console.log(err);
                res.status(500).send('Failed to retrieve data.');
                return;
            }
            res.send(result.recordset);
        });
    });
});

/*
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
*/

app.put('/api/EscenaObjeto/:id_escenaObjeto', function (req, res) {
    // Connect to your database
    sql.connect(config).then(pool => {
        // Extract data from request body
        const { escala, posicion, id_objeto, id_escena } = req.body;
        const id_escenaObjeto = req.params.id_escenaObjeto;

        // Build the update statement using parameters
        return pool.request()
            .input('escala', sql.VarChar, escala)
            .input('posicion', sql.VarChar, posicion)
            .input('id_objeto', sql.Int, id_objeto)
            .input('id_escena', sql.Int, id_escena)
            .input('id_escenaObjeto', sql.Int, id_escenaObjeto)
            .query(`UPDATE EscenaObjeto SET 
                escala = @escala, 
                posicion = @posicion, 
                id_objeto = @id_objeto,
                id_escena = @id_escena
                WHERE id_escenaObjeto = @id_escenaObjeto`);
    }).then(result => {
        // Check if any rows were affected
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('EscenaObjeto updated successfully.');
        } else {
            res.status(404).send('EscenaObjeto not found.');
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send('Failed to update EscenaObjeto.');
    });
});



app.post('/api/EscenaObjeto', function (req, res) {
    // Connect to your database
    sql.connect(config).then(pool => {
        // Extract data from request body
        const { escala, posicion, id_objeto, id_escena, id_usuario } = req.body;

        // Ensure all required fields are provided
        if (id_objeto == null || id_escena == null || id_usuario == null) {
            return res.status(400).send('Missing required fields: id_objeto, id_escena, or id_usuario');
        }

        // Build the INSERT statement using parameters
        return pool.request()
            .input('escala', sql.VarChar, escala)
            .input('posicion', sql.VarChar, posicion)
            .input('id_objeto', sql.Int, id_objeto)
            .input('id_escena', sql.Int, id_escena)
            .input('id_usuario', sql.Int, id_usuario)
            .query(`INSERT INTO EscenaObjeto (escala, posicion, id_objeto, id_escena, id_usuario) 
                    VALUES (@escala, @posicion, @id_objeto, @id_escena, @id_usuario)`);
    }).then(result => {
        // Check if the insert was successful
        if (result.rowsAffected[0] > 0) {
            res.status(201).send('EscenaObjeto created successfully.');
        } else {
            res.status(400).send('Failed to create EscenaObjeto.');
        }
    }).catch(err => {
        console.error("SQL Error: ", err);
        if (err.originalError && err.originalError.info) {
            res.status(500).send(`SQL Error: ${err.originalError.info.message}`);
        } else {
            res.status(500).send('Failed to insert EscenaObjeto into the database.');
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


app.get('/api/notas/:id_escena', (req, res) => {
    const { id_escena } = req.params;
    const sentencia = `SELECT * FROM Notas WHERE id_escena = '${id_escena}'`;

    sql.connect(config, err => {
        if (err) {
            console.log(err);
            res.status(500).send('No se puede conectar a la base de datos.');
        } else {
            const request = new sql.Request();
            request.query(sentencia, (err, recordset) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error al obtener las notas.');
                } else {
                    res.status(200).json(recordset.recordset);
                }
            });
        }
    });
});
app.get('/api/Escena/:id_usuario', function (req, res) {
    sql.connect(config, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error connecting to the database');
        }

        var request = new sql.Request();
        const sentencia = "SELECT * FROM Escena WHERE id_usuario = @id_usuario";
        request.input('id_usuario', sql.Int, req.params.id_usuario);
        
        request.query(sentencia, function (err, recordset) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error executing query');
            }
            res.send(recordset.recordset);
        });
    });
});

/*
app.get('/api/Escena/:id_escena', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        sentencia = "select * from Escena where id_escena = " + req.params.id_escena;
        console.log(sentencia);
        request.query(sentencia, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset[0]);
            
        });
    });
    
});
*/
app.post('/api/Escena', (req, res) => {
    sql.connect(config, err => {
        if (err) {
            console.log(err);
            res.status(500).send('No se puede connectar a la base de datos.');
        } else {
            const request = new sql.Request();
            console.log(req.body);
            const { id_usuario} = req.body;
            sentencia = `INSERT INTO Escena (id_escena, id_usuario) VALUES (((SELECT max(id_escena) as ultimo FROM Escena)+1), '${id_usuario}')`;
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


app.post('/api/notas', async (req, res) => {
    try {
        const { id_escena, contenido } = req.body;
        await sql.connect(config);

        const userDataQuery = 'SELECT id_usuario FROM EscenaObjeto WHERE id_escena = @id_escena';
        const request = new sql.Request();
        request.input('id_escena', sql.Int, id_escena);
        const userDataResult = await request.query(userDataQuery);

        if (userDataResult.recordset.length === 0) {
            return res.status(404).json({ error: "No user ID found for the given scene ID." });
        }
        
        const id_usuario = userDataResult.recordset[0].id_usuario;

        request.input('id_usuario', sql.Int, id_usuario);
        request.input('contenido', sql.VarChar, contenido);
        const insertQuery = 'INSERT INTO Notas (id_escena, id_usuario, contenido) VALUES (@id_escena, @id_usuario, @contenido)';
        const result = await request.query(insertQuery);

        if (result.rowsAffected[0] === 1) {
            res.status(201).json({ message: 'Note created successfully.' });
        } else {
            throw new Error('Failed to create note.');
        }
    } catch (error) {
        console.error('Error creating note:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message  // Providing the actual error message which might help in debugging.
        });
    }
});

app.put('/api/notas/:id_nota', (req, res) => {
    const { id_nota } = req.params;
    const { contenido } = req.body;
    const sentencia = `UPDATE Notas SET contenido = '${contenido}' WHERE id_nota = '${id_nota}'`;

    sql.connect(config, err => {
        if (err) {
            console.log(err);
            res.status(500).send('No se puede conectar a la base de datos.');
        } else {
            const request = new sql.Request();
            request.query(sentencia, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error al actualizar la nota.');
                } else {
                    if (result.rowsAffected[0] > 0) {
                        res.status(200).send('Nota actualizada.');
                    } else {
                        res.status(404).send('Nota no encontrada.');
                    }
                }
            });
        }
    });
});

app.delete('/api/notas/:id_nota', (req, res) => {
    const { id_nota } = req.params;
    const sentencia = `DELETE FROM Notas WHERE id_nota = '${id_nota}'`;

    sql.connect(config, err => {
        if (err) {
            console.log(err);
            res.status(500).send('No se puede conectar a la base de datos.');
        } else {
            const request = new sql.Request();
            request.query(sentencia, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('No se pudo eliminar la nota.');
                } else {
                    if (result.rowsAffected[0] > 0) {
                        res.status(200).send('Nota eliminada.');
                    } else {
                        res.status(404).send('Nota no encontrada.');
                    }
                }
            });
        }
    });
});


app.get('/api/userAndProjects2/:id_escena', async (req, res) => {
    try {
      const { id_escena } = req.params;
  
      // Query to fetch user ID based on the scene ID from EscenaObjeto
      const userDataQuery = `
        SELECT id_escena FROM EscenaObjeto WHERE id_escena = @id_escena
      `;
      const userDataResult = await sql.connect(config)
        .then(pool => {
          return pool.request()
            .input('id_escena', sql.Int, id_escena)
            .query(userDataQuery);
        });
  
      if (userDataResult.recordset.length === 0) {
        throw new Error("No user found for the scene ID.");
      }
  
      // Send the user ID in the response
      res.status(200).json({ userId: userDataResult.recordset[0].id_escena });
    } catch (error) {
      console.error('Error fetching user id:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });





  app.get('/api/Objeto/:id_objeto', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        sentencia = "select * from Objeto where id_objeto = " + req.params.id_objeto;
        console.log(sentencia);
        request.query(sentencia, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset[0]);
            
        });
    });
    
});

app.get("*", (req, res) => {
    res.status(404).json({error: "Route not found"})
});


app.listen(2023, () => console.log("Listening on port 2023"));
