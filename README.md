# PGP File Encryption Tool 🔐

A web-based PGP file encryption/decryption tool similar to Kleopatra, working with .asc files.

![Demo Screenshot](./assets/demo.gif)

## Features ✨

- 🔑 Generate PGP key pairs (public/private keys)
- 📤 Encrypt files with public keys (.asc)
- 📥 Decrypt files with private keys (.asc)
- 🔒 Support for passphrase-protected private keys
- 🖥️ Simple web interface
- 📁 File upload/download functionality

## Installation ⚙️

1. Clone the repository:
   ```bash
   git clone https://github.com/cybertron10/pgp-file-tool.git
   cd pgp-file-tool
2. Install dependencies:
   ```bash
   npm install
3. Start the server:
   ```bash
   node server.js
4. Access the tool in your browser at:
   ```text
   http://localhost:3000

## Usage 🚀
### Generating Keys
1. Click "Generate Keys" button
2. Copy or download your public and private keys
3. Save your private key securely!

## Encrypting Files
1. Paste or upload a public key (.asc)
2. Select the file to encrypt
3. Click "Encrypt File"
4. Download the encrypted .asc file

## Decrypting Files
1. Upload your private key (.asc)
2. Enter passphrase if required
3. Upload the encrypted .asc file
4. Click "Decrypt File"
5. Download the decrypted file



## Security Considerations 🔒
- Always protect your private keys
- Use strong passphrases for important keys
- This tool runs locally - your files never leave your computer
- For maximum security, consider running in an isolated environment

## Contributing 🤝
Contributions are welcome! Please open an issue or pull request for any improvements.

## License 📄
This project is licensed under the MIT License - see the LICENSE file for details.

Made with ❤️ by Suraj Bhosale
