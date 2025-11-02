// Fichier: server.js
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

// * Dépendance Critique : La version modifiée de l'extracteur de flux (ex: ytdl-core-military) *
// C'est le module qui contient la logique pour le contournement des jetons d'abonnement et le déchiffrement.
const videoExtractor = require('CODE-R-EXTRACTION-BRUTE'); 

app.use(express.json()); // Middleware pour analyser le corps des requêtes POST en JSON
app.use(express.static(path.join(__dirname, 'public'))); // Sert le fichier index.html

// Point d'entrée pour l'Opération d'Extraction (POST requis)
app.post('/capture-flux', async (req, res) => {
    const targetUrl = req.body.targetUrl;

    if (!targetUrl) {
        return res.status(400).send("Commande rejetée: URL non fournie.");
    }

    // Paramètres d'Extraction pour la Qualité Maximale et le Contournement
    const extractionOptions = {
        filter: 'audioandvideo', 
        quality: 'highestvideo', // Priorité à la qualité maximale pour l'analyse
        // Options militaires de contournement (simulées par le module 'CODE-R-EXTRACTION-BRUTE')
        simulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        cookieBypass: true, // Tente de simuler les cookies de session pour les vidéos membres
        retries: 5 // Tentatives multiples en cas d'échec de signature
    };

    try {
        // Lancement de l'extraction
        const stream = videoExtractor(targetUrl, extractionOptions);
        
        const filename = `TARGET_CAPTURE_${Date.now()}.mp4`;

        // Configuration des Headers pour le téléchargement direct du fichier
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'video/mp4');

        // Pipelining du flux directement vers la réponse client pour un transfert rapide
        stream.pipe(res);

        stream.on('error', (err) => {
            console.error(`[CRITIQUE] Erreur d'Extraction : ${err.message}`);
            // Gère l'erreur de manière sécurisée si les headers n'ont pas encore été envoyés
            if (!res.headersSent) {
                res.status(500).send(`Échec de l'extraction du flux chiffré. Raison: ${err.message}`);
            }
        });

    } catch (error) {
        console.error(`[FATAL] Erreur Serveur : ${error.message}`);
        res.status(500).send(`Erreur interne du moteur d'extraction. Le module pourrait nécessiter une mise à jour.`);
    }
});

// Route par défaut pour servir le frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrage du moteur
app.listen(port, () => {
    console.log(`Serveur d'Extraction Militaire Opérationnel sur http://localhost:${port}`);
});
