# Polyecho

Polyecho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors.

**LIVE DEMO**: <https://polyecho.xyz>

---

## Contracts

This application is run on the Polygon Mainnet network.  All contracts are deployed at the follwing addresses:

| Contract      | Address |
| ----------- | ----------- |
| PolyechoNFT | 0x6F6f53296049149a02373E3458fb105171481268 |
| StemQueue | 0x16480B6d607952090fa4948EC75395659cC7D32A |
| Verifier20 | 0x7810D24738405b6B38ee8a6150E438Bc57595029 |
| PoseidonT3 | 0xe48fe3C863EDaD6c33EE9e4b51fcaFf5d48Ca9D3 |
| IncrementalMerkleTree | 0x559975Ff0024FBfF2fb9c9E8553c7263F691515d |

---

## Local Development - Getting Started

First, clone this repository to your local machine:

```bash
git clone https://github.com/polyecho/polyecho.git
```

There is some local setup that needs to happen to fully run this client application locally.

Dependencies:

- npm or yarn
- Node.js
- MongoDB

### 1. Install dependencies

You can download the latest version of Node.js [here](https://nodejs.org/en/download/).  You can check that you are running NPM and Node with the following commands:

```bash
node -v
# v16.14.0

npm -v
# 8.3.1
```

Install the client dependencies with the following command:

```bash
yarn install
# or
npm install
```

### 2. Environment Variables

Next, set up local environment variables by copying over the values from `.env` to a `.env.local` file. Run the following command:

```bash
# Unix
cp .env .env.local
# windows
xcopy .env .env.local
```

**NOTE:** Please reach out to the core team for a set of values to fill in your local env file.

### 3. Run the Application

Finally, you can run the development server using the following command:

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Setting Up A Local Database (MongoDB)

This client application is using the built-in Next.js API routes that read and write to a local Mongo database. Here are our recommended steps for getting up and running with a local MongoDB environemnt:

### 1. Install a MongoDB Host

We recommend using [MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/), because it is free and has all the necessary features.

This will set up a host to run in the background on the machine. You can then connect to it via a number of methods when it is up.

- For Mac users, you can follow the steps listed [here](https://medium.com/macoclock/setup-mongodb-on-macos-94e0c687c649).
- For Windows users, you can follow the steps listed [here](https://medium.com/stackfame/run-mongodb-as-a-service-in-windows-b0acd3a4b712).

### 2. Install a MongoDB Client

There are many ways to interact with a MongoDB host. My recommendation is to use a GUI, as it makes for viewing the data easily, and MongoDB Compass is free and easy to use. Install it using the documentation [here](https://docs.mongodb.com/compass/current/install/).

### 3. Create a Connection

Once MongoDB Compass is installed and you have a MongoDB host running in the background, you can now connect the client to the host and set up this new connection. Open up Compass and click "New Connection" in the top left of the GUI, or in the menubar. Paste in the local connection string; it should look similar to this on Mac:

```txt
mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false
```

### 4. Create a Database and Link It

Create a new database for polyecho. Title it `polyecho` or whatever suits your fancy. It may prompt you to add a collection to it as well.  Please add a `users` collection.

The important bit is to **update your local environment variables** in the client app. Update the following in `.env.local` to your new connection string:

```txt
MONGODB_URI=mongodb://localhost/polyecho
```

This will now allow the client app to work with the local MongoDB instance, and you can now interact with it through Compass as a GUI.

**NOTE:** You can always shut down the background `mongo` daemon that's running after using it. For Mac and Homebrew users, you can check that it's running with `brew services list`, and then you can shut it down with `brew services stop mongodb-community`. For Windows users, it would be `net stop MongoDB`, which is the default service name from the installer.

---

## Issues

We encourage the open-source atmosphere. If you find any bugs or issues with this repository, don't hesitate to [file an issue](https://github.com/polyecho/polyecho/issues/new) for it. We will work to continually engage with these issues and encourage you to contribute.
