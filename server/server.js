const express = require('express');
const db = require('../db/db.js');  
const bcrypt = require('bcrypt'); 
const app = express();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET; 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = 3000;
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'images'));
    },
    filename: function (req, file, cb) {
        const nomeUnivoco = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, nomeUnivoco + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'home.html'));
});

app.get('/api/ricette', (req, res) => {
    const sql = `
        SELECT ricette.*, utenti.username 
        FROM ricette 
        LEFT JOIN utenti ON ricette.id_autore = utenti.id
    `; 
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Errore query:", err);
            return res.status(500).json({ error: "Errore del database" });
        }
        res.json(results); 
    });
});

app.get('/api/ricette/:id', (req, res) => {
    const id = req.params.id; 
    const sql = `SELECT ricette.*, utenti.username FROM ricette LEFT JOIN utenti ON ricette.id_autore = utenti.id WHERE ricette.id = ?`; 
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Errore query dettaglio:", err);
            return res.status(500).json({ error: "Errore del database" });
        }
        res.json(results[0]); 
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM utenti WHERE username = ?';

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Errore DB:", err);
            return res.status(500).json({ errore: "Errore del server" });
        }

        if (results.length === 0) {
            return res.status(401).json({ errore: "Username o password errati!" });
        }

        const utente = results[0];

        bcrypt.compare(password, utente.password, (err, corrispondono) => {
            if (err) {
                console.error("Errore bcrypt:", err);
                return res.status(500).json({ errore: "Errore del server" });
            }

            if (corrispondono) {
                const token = jwt.sign(
                    { id: utente.id, username: utente.username }, 
                    SECRET_KEY, 
                    { expiresIn: '2h' }
                );
                console.log("Utente loggato:", utente.username);
                res.json({ success: true, token: token });
            } else {
                res.status(401).json({ errore: "Username o password errati!" });
            }
        });
    });
});

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error("Errore bcrypt:", err);
            return res.status(500).json({ errore: "Errore del server" });
        }

        const query = 'INSERT INTO utenti (username, email, password) VALUES (?, ?, ?)';

        db.query(query, [username, email, hash], (err, result) => {
            if (err) {
                console.error("Errore nel DB:", err);
                return res.status(500).json({ errore: "Errore: Username o Email già in uso!" });
            }
            
            console.log("Nuovo utente registrato:", username);
            res.json({ success: true });
        });
    });
});

app.get('/api/check-auth', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.json({ loggato: false });
    }

    jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
        if (err) {
            return res.json({ loggato: false });
        }
        res.json({ loggato: true, username: decodedUser.username, id: decodedUser.id });
    });
});

app.post('/api/preferiti/toggle', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ errore: "Devi fare il login!" });

    jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
        if (err) return res.status(401).json({ errore: "Token scaduto o non valido!" });

        const id_utente = decodedUser.id;
        const { id_ricetta } = req.body;

        const queryCheck = 'SELECT * FROM preferiti WHERE id_utente = ? AND id_ricetta = ?';
        
        db.query(queryCheck, [id_utente, id_ricetta], (err, results) => {
            if (err) return res.status(500).json({ errore: "Errore DB" });

            if (results.length > 0) {
                const queryDelete = 'DELETE FROM preferiti WHERE id_utente = ? AND id_ricetta = ?';
                db.query(queryDelete, [id_utente, id_ricetta], () => {
                    res.json({ salvato: false });
                });
            } else {
                const queryInsert = 'INSERT INTO preferiti (id_utente, id_ricetta) VALUES (?, ?)';
                db.query(queryInsert, [id_utente, id_ricetta], () => {
                    res.json({ salvato: true });
                });
            }
        });
    });
});

app.get('/api/le-mie-ricette', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ errore: "Token mancante!" });

    jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
        if (err) return res.status(401).json({ errore: "Token scaduto o non valido!" });

        const sql = `
            SELECT ricette.*, utenti.username 
            FROM preferiti
            JOIN ricette ON preferiti.id_ricetta = ricette.id
            LEFT JOIN utenti ON ricette.id_autore = utenti.id
            WHERE preferiti.id_utente = ?
        `;

        db.query(sql, [decodedUser.id], (err, results) => {
            if (err) {
                console.error("Errore query preferiti:", err);
                return res.status(500).send("Errore del server");
            }
            res.json(results); 
        });
    });
});

app.post('/api/nuova-ricetta', upload.single('immagine'), (req, res) => {
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ errore: "Devi fare il login per pubblicare!" });

    jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
        if (err) return res.status(401).json({ errore: "Token scaduto o non valido!" });

        const { nome, ingredienti, preparazione } = req.body;
        const nomeImmagine = req.file ? req.file.filename : null; 
        const id_autore = decodedUser.id; 

        const query = 'INSERT INTO ricette (nome, ingredienti, preparazione, id_autore, immagine) VALUES (?, ?, ?, ?, ?)';
        
        db.query(query, [nome, ingredienti, preparazione, id_autore, nomeImmagine], (err, result) => {
            if (err) {
                console.error("Errore DB:", err);
                return res.status(500).json({ errore: "Errore durante il salvataggio" });
            }
            res.json({ success: true, messaggio: "Ricetta pubblicata con successo! 🧑‍🍳" });
        });
    });
});

app.get('/api/mie-ricette', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ errore: "Non autorizzato" });

    jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
        if (err) return res.status(401).json({ errore: "Token non valido" });

        const sql = `
            SELECT ricette.*, utenti.username 
            FROM ricette 
            LEFT JOIN utenti ON ricette.id_autore = utenti.id 
            WHERE ricette.id_autore = ?
        `;
        db.query(sql, [decodedUser.id], (err, results) => {
            if (err) {
                console.error("Errore DB:", err);
                return res.status(500).json({ errore: "Errore durante la ricerca delle ricette" });
            }
            res.json(results);
        });
    });
});

app.delete('/api/ricette/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ errore: "Non autorizzato" });

    jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
        if (err) return res.status(401).json({ errore: "Token non valido" });

        const idRicettaDaEliminare = req.params.id;

        const query = 'DELETE FROM ricette WHERE id = ? AND id_autore = ?';
        db.query(query, [idRicettaDaEliminare, decodedUser.id], (err, result) => {
            if (err) {
                console.error("Errore DB:", err);
                return res.status(500).json({ errore: "Errore durante l'eliminazione" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(403).json({ errore: "Operazione negata. La ricetta non esiste o non è tua." });
            }
            
            res.json({ success: true, messaggio: "Ricetta eliminata con successo!" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});