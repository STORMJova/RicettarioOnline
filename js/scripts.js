document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lista-ricette-container');

    function mostraRicette(lista, idPreferiti = []) {
        if (!container) return;
        container.innerHTML = "";
        lista.forEach(ricetta => {
            
            const isPreferito = idPreferiti.includes(ricetta.id);
            const cuoreEmoji = isPreferito ? "❤️" : "🤍";

            const percorsoFoto = ricetta.immagine ? `images/${ricetta.immagine}` : `images/ricetta${ricetta.id}.jpg`;

            const card = document.createElement('div'); 
            card.classList.add('ricetta'); 
            card.innerHTML = `
                <div class="preferiti-container">
                    <button class="btn-preferito" onclick="togglePreferito(this, ${ricetta.id})">
                        <span class="cuore">${cuoreEmoji}</span>
                    </button>
                </div>
                <img src="${percorsoFoto}" alt="${ricetta.nome}">
                <h3 class="titolo-sezione" style="margin-top: 10px;">${ricetta.nome}</h3>
                <p>Ingredienti: ${ricetta.ingredienti}</p>
                <a href="dettaglio.html?id=${ricetta.id}">Guarda la ricetta</a>
            `;
            container.appendChild(card);
        });
    }

    function caricaRicette() {
        const token = localStorage.getItem('token');

        fetch('/api/ricette')
            .then(response => response.json())
            .then(tutteLeRicette => {
                
                if (token) {
                    fetch('/api/le-mie-ricette', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    .then(res => res.json())
                    .then(preferiti => {
                        const idPreferiti = preferiti.map(p => p.id);
                        mostraRicette(tutteLeRicette, idPreferiti);
                    })
                    .catch(err => {
                        console.error("Errore nel recupero dei preferiti:", err);
                        mostraRicette(tutteLeRicette); 
                    });
                } else {
                    mostraRicette(tutteLeRicette);
                }
            })
            .catch(error => console.error("Errore:", error));
    }

    if (container) {
        caricaRicette(); 
    }

    const dettaglioContainer = document.getElementById('dettaglio-ricetta');

    if (dettaglioContainer) {
        const parametri = new URLSearchParams(window.location.search);
        const idRicetta = parametri.get('id');

        if (idRicetta) {
            fetch(`/api/ricette/${idRicetta}`)
                .then(res => res.json())
                .then(ricetta => {
                    const percorsoFoto = ricetta.immagine ? `images/${ricetta.immagine}` : `images/ricetta${ricetta.id}.jpg`;
                    
                    document.getElementById('titolo-ricetta').innerText = ricetta.nome;
                    
                    let pAutore = document.getElementById('nome-autore-dettaglio');
                    if (!pAutore) {
                        pAutore = document.createElement('p');
                        pAutore.id = 'nome-autore-dettaglio';
                        pAutore.style.textAlign = "center"; 
                        pAutore.style.color = "#666"; 
                        pAutore.style.marginTop = "-10px"; 
                        
                        document.getElementById('titolo-ricetta').after(pAutore);
                    }
                    pAutore.innerHTML = `Ricetta di: <strong>${ricetta.username || 'Chef del Ricettario'}</strong>`;

                    document.getElementById('img-ricetta').src = percorsoFoto; 
                    document.getElementById('ingredienti-ricetta').innerText = ricetta.ingredienti;
                    document.getElementById('preparazione-ricetta').innerText = ricetta.preparazione;
            })
            .catch(err => console.error("Errore dettaglio:", err));
                }
        }

    const token = localStorage.getItem('token'); 
    let nomeUtenteReale = localStorage.getItem('username') || "Utente";

    if(token) {
        fetch('/api/check-auth', {
            headers: { 'Authorization': `Bearer ${token}` } 
        })
        .then(response => response.json())
        .then(data => {
            console.log("Dati ricevuti dal server:", data);

            if (data.loggato) {
                const userMenu = document.querySelector('.user-menu');
                
                if (userMenu) {
                    userMenu.innerHTML = `
                        <a href="profilo.html" class="user-icon" title="Area Personale">
                            <img src="images/login.jpg" alt="Profilo">
                        </a>
                    `;
                }
            } else {
                localStorage.removeItem('token');
            }
        })
        .catch(err => console.error("Errore nel controllo JWT:", err));
    }


    const linkRegistrati = document.getElementById('link-registrati');
    const linkLogin = document.getElementById('link-login');
    const formLoginDiv = document.getElementById('form-login');
    const formRegisterDiv = document.getElementById('form-register');
    const titoloCard = document.getElementById('titolo-card');
    const sottotitoloCard = document.getElementById('sottotitolo-card');

    if (linkRegistrati) {
        linkRegistrati.addEventListener('click', (event) => {
            event.preventDefault();
            formLoginDiv.classList.add('nascosto');
            formRegisterDiv.classList.remove('nascosto');
            titoloCard.innerText = 'Nuovo Utente';
            sottotitoloCard.innerText = 'Unisciti a noi e crea il tuo ricettario';
        });
    }

    if (linkLogin) {
        linkLogin.addEventListener('click', (event) => {
            event.preventDefault();
            formRegisterDiv.classList.add('nascosto');
            formLoginDiv.classList.remove('nascosto');
            titoloCard.innerText = 'Bentornato!';
            sottotitoloCard.innerText = 'Accedi per salvare le tue ricette preferite';
        });
    }

    const formLogin = document.getElementById('form-login');
    const divErrore = document.getElementById('messaggio-errore');

    if (formLogin) {
        formLogin.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const dati = {
                username: formLogin.username.value,
                password: formLogin.password.value
            };

            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dati)
            })
            .then(response => response.json())
            .then(risposta => {
                if (risposta.success) {
                    localStorage.setItem('token', risposta.token); 
                    localStorage.setItem('username', formLogin.username.value);
                    window.location.href = 'home.html';
                } else if (risposta.errore) {
                    divErrore.innerText = risposta.errore;
                    divErrore.style.display = 'block'; 
                }
            })
            .catch(err => console.error("Errore di connessione:", err));
        });
    }

    const formRegister = document.getElementById('form-register');

    if (formRegister) {
        formRegister.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const dati = {
                username: formRegister.username.value,
                email: formRegister.email.value,
                password: formRegister.password.value
            };

            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dati)
            })
            .then(response => response.json())
            .then(risposta => {
            if (risposta.success) {
                divErrore.style.backgroundColor = '#e8f5e9'; 
                divErrore.style.color = '#2e7d32';         
                divErrore.innerText = "Registrazione completata! Ora puoi fare il login.";
                divErrore.style.display = 'block';
                
                formRegister.reset();

                formRegister.classList.add('nascosto');
                formLogin.classList.remove('nascosto');
                document.getElementById('titolo-card').innerText = 'Bentornato!';
                document.getElementById('sottotitolo-card').innerText = 'Accedi per salvare le tue ricette preferite';

            } else if (risposta.errore) {
                    divErrore.style.backgroundColor = '#ffebee'; 
                    divErrore.style.color = '#d32f2f';
                    divErrore.innerText = risposta.errore;
                    divErrore.style.display = 'block';
                }
            })
            .catch(err => console.error("Errore di connessione:", err));
        });
    }

    console.log("Il DOM è pronto e gli script sono attivi!"); 

    const preferitiContainer = document.getElementById('lista-preferiti-container');

    if (preferitiContainer) {
        const token = localStorage.getItem('token');

        fetch('/api/le-mie-ricette', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(listaPreferiti => {
            preferitiContainer.innerHTML = "";

            if (listaPreferiti.length === 0) {
                preferitiContainer.innerHTML = `
                    <p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #555;">
                        Non hai ancora salvato nessuna ricetta. Esplora il sito e clicca sul ❤️ per aggiungerle qui!
                    </p>
                `;
                return;
            }

            listaPreferiti.forEach(ricetta => {
                const percorsoFoto = ricetta.immagine ? `images/${ricetta.immagine}` : `images/ricetta${ricetta.id}.jpg`;

                const card = document.createElement('div'); 
                card.classList.add('ricetta'); 
                card.innerHTML = `
                    <div class="preferiti-container">
                        <button class="btn-preferito" onclick="togglePreferito(this, ${ricetta.id})">
                            <span class="cuore">❤️</span>
                        </button>
                    </div>
                    <img src="${percorsoFoto}" alt="${ricetta.nome}">
                    <h3>${ricetta.nome}</h3>
                    <p>Ingredienti: ${ricetta.ingredienti}</p>
                    <a href="dettaglio.html?id=${ricetta.id}">Guarda la ricetta</a>
                `;
                preferitiContainer.appendChild(card);
            });
        })
        .catch(err => console.error("Errore nel caricamento dei preferiti:", err));
    }

    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('aperto'); 
        });
    }

    const formAggiungi = document.getElementById('form-aggiungi-ricetta');
    const msgAggiungi = document.getElementById('messaggio-aggiungi');

    if (formAggiungi) {
        formAggiungi.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const token = localStorage.getItem('token');
            if (!token) {
                msgAggiungi.style.color = '#d32f2f';
                msgAggiungi.innerText = "Errore: Devi effettuare il login.";
                return;
            }

            const formData = new FormData(formAggiungi);

            fetch('/api/nuova-ricetta', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                },
                body: formData
            })
            .then(response => response.json())
            .then(risposta => {
                if (risposta.success) {
                    msgAggiungi.style.display = 'none'; 
                    formAggiungi.reset(); 
                    mostraModalSuccessoAggiunta();
                } else if (risposta.errore) {
                    msgAggiungi.style.color = '#d32f2f';
                    msgAggiungi.innerText = risposta.errore;
                }
            })
            .catch(err => console.error("Errore di connessione:", err));
        });
    }
    
});

function togglePreferito(bottone, idRicetta) {
    const cuore = bottone.querySelector('.cuore');
    const token = localStorage.getItem('token'); 

    fetch('/api/preferiti/toggle', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ id_ricetta: idRicetta })
    })
    .then(res => {
        if (res.status === 401) {
            mostraModalLogin();
            throw new Error("Non loggato");
        }
        return res.json();
    })
    .then(data => {
        const paginaPreferiti = document.getElementById('lista-preferiti-container');

        if (paginaPreferiti && !data.salvato) {
            const card = bottone.closest('.ricetta');
            card.remove(); 

            if (paginaPreferiti.children.length === 0) {
                paginaPreferiti.innerHTML = `
                    <p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #555;">
                        Non hai ancora salvato nessuna ricetta. Esplora il sito e clicca sul ❤️ per aggiungerle qui!
                    </p>
                `;
            }
        } else {
            cuore.innerText = data.salvato ? "❤️" : "🤍";
        }
    })
    .catch(err => console.error("Errore preferiti:", err));
}

function mostraModalLogin() {
    let modal = document.getElementById('modal-login-richiesto');
    
    if (!modal) {
        const modalHtml = `
            <div id="modal-login-richiesto" class="modal-overlay">
                <div class="modal-content">
                    <h3>Ops! 🧑‍🍳</h3>
                    <p>Devi aver effettuato l'accesso per poter salvare le tue ricette preferite e ritrovarle quando vuoi.</p>
                    <div class="modal-buttons">
                        <button class="btn-chiudi-modal" onclick="chiudiModalLogin()">Annulla</button>
                        <a href="login.html" class="btn-vai-login">Vai al Login</a>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('modal-login-richiesto');
    }
    
    modal.style.display = 'flex';
}

function chiudiModalLogin() {
    const modal = document.getElementById('modal-login-richiesto');
    if (modal) {
        modal.style.display = 'none';
    }
}

const mieRicetteContainer = document.getElementById('mie-ricette-container');

if (mieRicetteContainer) {
    const salutoUtente = document.getElementById('saluto-utente');
    if (salutoUtente) {
        const nome = localStorage.getItem('username') || "Chef";
        salutoUtente.innerText = `Ciao, ${nome}! 👨‍🍳`;
    }

    const btnLogoutProfilo = document.getElementById('btn-logout-profilo');
    if (btnLogoutProfilo) {
        btnLogoutProfilo.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token'); 
            localStorage.removeItem('username'); // Puliamo anche il nome!
            window.location.href = 'home.html'; 
        });
    }

    const token = localStorage.getItem('token');

    fetch('/api/mie-ricette', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(mieRicette => {
        mieRicetteContainer.innerHTML = "";

        if (mieRicette.length === 0) {
            mieRicetteContainer.innerHTML = `
                <p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #555;">
                    Non hai ancora pubblicato nessuna ricetta. Condividi il tuo primo piatto!
                </p>
            `;
            return;
        }

        mieRicette.forEach(ricetta => {
            const percorsoFoto = ricetta.immagine ? `images/${ricetta.immagine}` : `images/ricetta${ricetta.id}.jpg`;

            const card = document.createElement('div'); 
            card.classList.add('ricetta'); 
            card.id = `card-ricetta-${ricetta.id}`;
            
            card.innerHTML = `
                <img src="${percorsoFoto}" alt="${ricetta.nome}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                <h3 style="margin-top: 10px;">${ricetta.nome}</h3>
                <p>Ingredienti: ${ricetta.ingredienti}</p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <a href="dettaglio.html?id=${ricetta.id}">Guarda la ricetta</a>
                    
                    <!-- BOTTONE ELIMINA -->
                    <button onclick="eliminaRicetta(${ricetta.id})" style="background-color: #d32f2f; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        🗑️ Elimina
                    </button>
                </div>
            `;
            mieRicetteContainer.appendChild(card);
        });
    })
    .catch(err => console.error("Errore nel caricamento delle tue ricette:", err));
}

window.eliminaRicetta = function(idRicetta) {
    if (!confirm("Sei sicuro di voler eliminare questa ricetta? L'azione è irreversibile!")) {
        return;
    }

    const token = localStorage.getItem('token');
    
    fetch(`/api/ricette/${idRicetta}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const cardDaRimuovere = document.getElementById(`card-ricetta-${idRicetta}`);
            if (cardDaRimuovere) {
                cardDaRimuovere.remove();
            }
            
            if (mieRicetteContainer.children.length === 0) {
                 mieRicetteContainer.innerHTML = `
                    <p style="text-align: center; grid-column: 1/-1; font-size: 1.2rem; color: #555;">
                        Non hai ancora pubblicato nessuna ricetta. Condividi il tuo primo piatto!
                    </p>
                `;
            }
        } else {
            alert("Errore: " + data.errore);
        }
    })
    .catch(err => console.error("Errore durante l'eliminazione:", err));
};

function mostraModalSuccessoAggiunta() {
    let modal = document.getElementById('modal-successo-aggiunta');
    
    if (!modal) {
        const modalHtml = `
            <div id="modal-successo-aggiunta" class="modal-overlay">
                <div class="modal-content" style="text-align: center;">
                    <h3 style="color: #2e7d32; font-size: 1.8rem;">Bravissimo Chef! 👨‍🍳</h3>
                    <p style="font-size: 1.1rem; margin-top: 10px;">La tua ricetta è stata pubblicata con successo!</p>
                    <div class="modal-buttons" style="justify-content: center; margin-top: 25px;">
                        <a href="profilo.html" style="background-color: #2e7d32; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Vedi nel Profilo</a>
                        <button onclick="document.getElementById('modal-successo-aggiunta').style.display='none'" style="background-color: #ddd; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-left: 10px;">Aggiungine un'altra</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('modal-successo-aggiunta');
    }
    
    modal.style.display = 'flex';
}