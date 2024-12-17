const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

// Serve i file statici dal front-end
app.use(express.static(path.join(__dirname, '../front-end/bomboclat/public')));

// Serve i file audio dalla cartella "songs"
app.use('/songs', express.static(path.join(__dirname, 'songs')));

// Endpoint per recuperare le canzoni con i dettagli
app.get('/api/songs', (req, res) => {
    const songsDirectory = path.join(__dirname, 'songs');
    const songsDataPath = path.join(__dirname, 'data.json');

    // Legge i file nella directory "songs" (file audio)
    fs.readdir(songsDirectory, (err, files) => {
        if (err) {
            console.error('Errore nel leggere la directory delle canzoni:', err);
            return res.status(500).send('Errore nel recupero delle canzoni.');
        }

        // Filtra solo i file con estensione .wav
        const songFiles = files.filter(file => file.endsWith('.wav'));

        // Leggi i dati dal file JSON
        fs.readFile(songsDataPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Errore nel leggere il file JSON:', err);
                return res.status(500).send('Errore nel recupero dei dettagli delle canzoni.');
            }

            const songsData = JSON.parse(data);

            // Associa i dettagli JSON solo ai file audio effettivamente esistenti
            const matchedSongs = songsData.map(song => {
                const audioFileName = song.title + '.wav'; // Associare il titolo nel JSON con il file audio

                // Se il file audio esiste, aggiungiamo il dettaglio audioFileName
                if (songFiles.includes(audioFileName)) {
                    return {
                        ...song,
                        audioFileName: audioFileName // Aggiungi il nome del file audio alla risposta
                    };
                }
                return null; // Se non esiste un file audio corrispondente, ritorna null
            }).filter(song => song !== null); // Filtra i risultati nulli

            res.json(matchedSongs);  // Restituisce i dettagli delle canzoni
        });
    });
});

// Endpoint principale per caricare il front-end
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front-end/bomboclat/public', 'index.html'));
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
