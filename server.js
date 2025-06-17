const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const openpgp = require('openpgp');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ensure upload directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate PGP keys
app.get('/generate-keys', async (req, res) => {
    try {
        const { privateKey, publicKey } = await openpgp.generateKey({
            type: 'ecc',
            curve: 'curve25519',
            userIDs: [{ name: 'File Crypto User', email: 'user@example.com' }],
            passphrase: '',
            format: 'armored'
        });

        res.json({
            publicKey,
            privateKey
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Key generation failed');
    }
});

// Encrypt file with PGP public key
app.post('/encrypt', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        if (!req.body.publicKey) {
            return res.status(400).send('No public key provided');
        }

        const filePath = req.file.path;
        const publicKey = req.body.publicKey;
        const originalName = req.file.originalname;

        // Read the public key
        const publicKeys = await openpgp.readKeys({ armoredKeys: publicKey });

        // Read the file to encrypt
        const fileData = await fs.promises.readFile(filePath);

        // Encrypt the file
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ binary: fileData }),
            encryptionKeys: publicKeys,
            format: 'binary'
        });

        // Create output filename with .gpg extension
        const outputFileName = `${originalName}.gpg`;
        const outputPath = path.join(__dirname, 'uploads', outputFileName);
        await fs.promises.writeFile(outputPath, encrypted);

        res.download(outputPath, outputFileName, (err) => {
            if (err) {
                console.error(err);
            }
            // Clean up files
            fs.unlinkSync(filePath);
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Encryption failed');
    }
});

// Decrypt file with PGP private key
app.post('/decrypt', upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'privateKeyFile', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files['file'] || !req.files['privateKeyFile']) {
            return res.status(400).send('Both encrypted file and private key file are required');
        }

        const encryptedFilePath = req.files['file'][0].path;
        const privateKeyFilePath = req.files['privateKeyFile'][0].path;
        const passphrase = req.body.passphrase || '';
        const originalName = req.files['file'][0].originalname;

        // Read the encrypted file
        const encryptedData = await fs.promises.readFile(encryptedFilePath);

        // Read the private key
        const privateKeyArmored = await fs.promises.readFile(privateKeyFilePath, 'utf8');
        const privateKey = await openpgp.readPrivateKey({ 
            armoredKey: privateKeyArmored 
        });

        // Decrypt the file
        const message = await openpgp.readMessage({
            binaryMessage: encryptedData
        });

        const { data: decryptedData } = await openpgp.decrypt({
            message,
            decryptionKeys: privateKey,
            format: 'binary'
        });

        // Remove ONLY the .gpg extension
        let outputFileName = originalName;
        if (outputFileName.endsWith('.gpg')) {
            outputFileName = outputFileName.slice(0, -4);
        }

        // Create a download link
        const outputPath = path.join(__dirname, 'uploads', outputFileName);
        await fs.promises.writeFile(outputPath, decryptedData);

        res.download(outputPath, outputFileName, (err) => {
            if (err) {
                console.error(err);
            }
            // Clean up files
            fs.unlinkSync(encryptedFilePath);
            fs.unlinkSync(privateKeyFilePath);
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Decryption failed. Check your private key and passphrase.');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});