# Walrus Disk

Welcome to the Walrus Disk, a decentralized storage application that uses the Walrus protocol to store encrypted files. Walrus focuses on providing a robust but affordable solution for storing unstructured content on decentralized storage nodes while ensuring high availability and reliability even in the presence of Byzantine faults.

Walrus Disk uses javascript running within your web browser to encrypt and decrypt files client-side, in-browser. This App makes no network connections during this process, to ensure that your keys never leave the web browser during the process.

All client-side cryptography is implemented using the Web Crypto API. Files are encrypted using AES-CBC 256-bit symmetric encryption. The encryption key is derived from the password and a random salt using PBKDF2 derivation with 10000 iterations of SHA256 hashing.

The encryption used by this App is compatible with openssl.

Files encrypted using this App can be decrypted using openssl using the following command:

```shell
openssl aes-256-cbc -d -salt -pbkdf2 -iter 10000 -in encryptedfilename -out plaintextfilename
```

Files encrypted using the following openssl command can be decrypted using this page:

```shell
openssl aes-256-cbc -e -salt -pbkdf2 -iter 10000 -in plaintextfilename -out encryptedfilename
```

The encryption keys for all files are stored locally. If you change computers, use the import/export function to migrate your keys to the new computer. If you don't do this, all your keys will be lost. Even the developer cannot recover your files.

The Walrus system provides an interface that can be used for public testing. For your convenience, walrus provide these at the following hosts:

* Aggregator: https://aggregator-devnet.walrus.space
* Publisher: https://publisher-devnet.walrus.space

Walrus publisher is currently limiting requests to 10 MiB. If you want to upload larger files, you need to run your own publisher.

Note that the publisher consumes (Testnet) Sui on the service side, and a Mainnet deployment would likely not be able to provide uncontrolled public access to publishing without requiring some authentication and compensation for the Sui used.
 
[Walrus docs](https://docs.walrus.site/)

[Walrus Sites](https://walrus.site/)

[Sui docs](https://docs.sui.io/)

Email: bc443995@gmail.com

Donate to Sui Wallet Address: 0x6f25929f026483a440f5f16e03661087eb41604528050b989f48624b049c4b78
