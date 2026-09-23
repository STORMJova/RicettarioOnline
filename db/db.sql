CREATE DATABASE IF NOT EXISTS ricettario_db;
USE ricettario_db;

CREATE TABLE IF NOT EXISTS ricette (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ingredienti TEXT NOT NULL,
    preparazione TEXT NOT NULL,
    immagine VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS utenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    data_iscrizione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS preferiti (
    id_utente INT,
    id_ricetta INT,
    PRIMARY KEY (id_utente, id_ricetta),
    FOREIGN KEY (id_utente) REFERENCES utenti(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ricetta) REFERENCES ricette(id) ON DELETE CASCADE
);

INSERT INTO ricette (nome, ingredienti, preparazione, immagine) VALUES  
('Carbonara', 'Pasta, uova, guanciale, pecorino romano, pepe nero', 'Rosola il guanciale in padella. In una ciotola, sbatti i tuorli con il pecorino e tanto pepe. Cuoci la pasta, scolala al dente e saltala con il guanciale. Togli dal fuoco e unisci la crema di uova, mescolando velocemente per evitare l''effetto frittata.', 'ricetta1.jpg'),
('Risotto ai Funghi', 'Riso Arborio, funghi porcini, brodo vegetale, cipolla, burro, parmigiano', 'In una padella, soffriggi la cipolla nel burro. Aggiungi i funghi e cuoci per qualche minuto. Unisci il riso e tostalo. Aggiungi il brodo poco alla volta, mescolando continuamente fino a cottura ultimata. Manteca con parmigiano.', 'ricetta2.jpg'),
('Tiramisù Classico', 'Savoiardi, mascarpone, uova, zucchero, caffè, cacao in polvere', 'Prepara il caffè e intingi i biscotti. Prepara la crema con mascarpone, uova e zucchero. Alterna strati di biscotti e crema in una pirofila. Spolvera con cacao e lascia riposare in frigo.', 'ricetta3.jpg'),
('Polpette al Sugo della Nonna', 'Carne macinata, pane raffermo, latte, uova, parmigiano, prezzemolo, salsa di pomodoro', 'Ammolla il pane nel latte. Mescola la carne con il pane strizzato, uova, parmigiano e prezzemolo. Forma delle polpette e friggile. Prepara il sugo di pomodoro e cuoci le polpette al suo interno per 30 minuti.', 'ricetta4.jpg'),
('Insalata Greca Scomposta', 'Pomodori, cetrioli, cipolla rossa, olive kalamata, feta, origano, olio d''oliva', 'Taglia i pomodori, cetrioli e cipolla a pezzi. Aggiungi le olive e la feta sbriciolata. Condisci con olio d''oliva e origano. Mescola bene e servi fresca.', 'ricetta5.jpg'),
('Penne all''Arrabbiata Vegane', 'Penne, pomodori pelati, aglio, peperoncino, olio d''oliva, prezzemolo', 'In una padella, soffriggi l''aglio e il peperoncino nell''olio. Aggiungi i pomodori pelati e cuoci per 15 minuti. Cuoci le penne al dente e saltale nel sugo. Guarnisci con prezzemolo fresco.', 'ricetta6.jpg'),
('Zuppa di Ceci e Rosmarino', 'Ceci, brodo vegetale, cipolla, aglio, rosmarino, olio d''oliva', 'Soffriggi cipolla e aglio nell''olio. Aggiungi i ceci e il brodo vegetale. Cuoci per 30 minuti. Aggiungi il rosmarino e frulla una parte della zuppa per renderla cremosa.', 'ricetta7.jpg'),
('Costine in Salsa Barbecue Affumicata', 'Costine di maiale, salsa barbecue, paprika affumicata, aglio in polvere, zucchero di canna', 'Marina le costine con salsa barbecue, paprika, aglio in polvere e zucchero di canna per almeno 2 ore. Cuoci in forno a bassa temperatura per 3 ore, spennellando con altra salsa durante la cottura.', 'ricetta8.jpg'),
('Crostata di Marmellata di Fichi', 'Farina, burro, zucchero, uova, marmellata di fichi', 'Prepara la pasta frolla mescolando farina, burro, zucchero e uova. Stendi la frolla in una teglia e riempi con marmellata di fichi. Decora con strisce di frolla e cuoci in forno a 180°C per 30 minuti.', 'ricetta9.jpg'),
('Tacos di Pollo Marinato all''Lime', 'Tortillas, petto di pollo, lime, cumino, paprika, cipolla rossa, coriandolo', 'Marina il pollo con succo di lime, cumino e paprika per almeno 1 ora. Cuoci il pollo in padella e taglialo a strisce. Riscalda le tortillas e farciscile con pollo, cipolla rossa e coriandolo fresco.', 'ricetta10.jpg'),
('Gnocchi di Patate al Pesto Fresco', 'Patate, farina, uova, basilico, pinoli, aglio, olio d''oliva, parmigiano', 'Lessare le patate e schiacciarle. Mescolare con farina e uova per formare gli gnocchi. Preparare il pesto frullando basilico, pinoli, aglio, olio e parmigiano. Cuocere gli gnocchi in acqua bollente e condirli con il pesto.', 'ricetta11.jpg'),
('Tortino al Cioccolato Fondente Cuore Caldo', 'Cioccolato fondente, burro, zucchero, uova, farina', 'Sciogliere il cioccolato con il burro. In una ciotola, sbattere le uova con lo zucchero, poi aggiungere la farina e il cioccolato fuso. Versare negli stampini imburrati e cuocere in forno a 200°C per 10-12 minuti.', 'ricetta12.jpg'),
('Paella di Mare e Terra', 'Riso, gamberi, calamari, cozze, pollo, peperoni, piselli, zafferano, brodo di pesce', 'In una paella o padella larga, soffriggere il pollo e i peperoni. Aggiungere il riso e tostare. Unire il brodo con lo zafferano e cuocere a fuoco medio. A metà cottura, aggiungere i frutti di mare e i piselli. Cuocere fino a quando il riso è al dente.', 'ricetta13.jpg'),
('Hummus di Ceci con Pita Fresca', 'Ceci, tahina, succo di limone, aglio, olio d''oliva, paprika, pane pita', 'Frullare i ceci con tahina, succo di limone, aglio e olio d''oliva fino a ottenere una crema liscia. Servire con un filo d''olio e una spolverata di paprika, accompagnato da pane pita caldo.', 'ricetta14.jpg'),
('Spiedini di Tofu Marinato', 'Tofu, salsa di soia, zenzero, aglio, olio di sesamo, verdure miste', 'Tagliare il tofu a cubetti e marinarlo in una miscela di salsa di soia, zenzero, aglio e olio di sesamo per almeno 1 ora. Infilzare il tofu e le verdure su spiedini e grigliare fino a doratura.', 'ricetta15.jpg');