# 🏥 Med Share Chain
### Decentralized Electronic Health Record (EHR) Management System

A **full-stack decentralized application (DApp)** that puts patients in complete control of their medical data. Built on Ethereum (Solidity smart contracts), IPFS for decentralized file storage, a Node.js/Express backend, and a React frontend — Med Share Chain eliminates data silos and ensures every record access is permissioned, immutable, and auditable on the blockchain.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Smart Contract](#-smart-contract)
6. [API Reference](#-api-reference)
7. [Prerequisites](#-prerequisites)
8. [Full Setup Guide](#-full-setup-guide)
   - [Step 1 – Install Global Tools](#step-1--install-global-tools)
   - [Step 2 – Clone the Repository](#step-2--clone-the-repository)
   - [Step 3 – Set Up Ganache (Local Blockchain)](#step-3--set-up-ganache-local-blockchain)
   - [Step 4 – Set Up IPFS (Local Node)](#step-4--set-up-ipfs-local-node)
   - [Step 5 – Deploy the Smart Contract](#step-5--deploy-the-smart-contract)
   - [Step 6 – Configure the Backend](#step-6--configure-the-backend)
   - [Step 7 – Run the Backend](#step-7--run-the-backend)
   - [Step 8 – Configure the Frontend](#step-8--configure-the-frontend)
   - [Step 9 – Run the Frontend](#step-9--run-the-frontend)
9. [Configure MetaMask](#-configure-metamask)
10. [How to Use the Application](#-how-to-use-the-application)
11. [Environment Variables Reference](#-environment-variables-reference)
12. [Common Errors & Fixes](#-common-errors--fixes)
13. [Future Enhancements](#-future-enhancements)

---

## 🔍 Project Overview

### Problem Statement
Traditional, centralized EHR systems suffer from:
- **Data silos** – records locked inside a single hospital's system
- **No patient ownership** – patients cannot easily share or control their own records
- **Single point of failure** – centralized servers are vulnerable to breaches

### Solution
Med Share Chain uses a **hybrid blockchain + IPFS model**:
- Medical files are encrypted and uploaded to **IPFS** (decentralized storage), which returns a unique content hash (CID)
- The CID is stored **on the Ethereum blockchain** inside the smart contract, tied to the patient's wallet address
- The patient can **grant or revoke** a doctor's access to any specific record at any time — directly from their wallet, with no intermediary
- Every access event is recorded as an **immutable on-chain event**, creating a permanent audit trail

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        USER (Browser)                        │
│           React + Vite + TailwindCSS + Ethers.js             │
│              MetaMask Wallet (signs transactions)            │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP (Axios)          │ Web3/Ethers
                         ▼                       ▼
┌──────────────────────────────┐   ┌─────────────────────────────┐
│    Backend (Node.js/Express) │   │  Blockchain (Ganache Local)  │
│    Port: 8080                │   │  Port: 7545                  │
│                              │   │                              │
│  Routes:                     │   │  Smart Contract:             │
│  POST /api/auth/register     │   │  AccessControl.sol           │
│  GET  /api/auth/user/:addr   │◄──►  (Solidity 0.8.20)          │
│  POST /api/records/upload    │   │                              │
│  GET  /api/records/:hash     │   └─────────────────────────────┘
│                              │
│  Services:                   │   ┌─────────────────────────────┐
│  - IPFS (port 5001)          │◄──►  IPFS Node (local)          │
│  - Web3 (blockchain check)   │   │  Port: 5001 (API)           │
│  - MongoDB (user profiles)   │   │  Port: 8080 (Gateway)       │
└──────────────────────────────┘   └─────────────────────────────┘
                         │
                         ▼
              ┌───────────────────┐
              │ MongoDB (Database) │
              │ User Profiles      │
              │ (Atlas or Local)   │
              └───────────────────┘
```

### Workflow
```
Patient Registers  ──►  Blockchain (registerPatient tx)  +  MongoDB (profile)
Patient Uploads    ──►  File → IPFS → CID Hash → Blockchain (uploadRecord tx)
Patient Shares     ──►  Blockchain (grantAccess tx: patientAddr, providerAddr, hash)
Provider Views     ──►  Backend checks blockchain permission → serves file from IPFS
Patient Revokes    ──►  Blockchain (revokeAccess tx)
```

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Smart Contracts** | Solidity | 0.8.20 |
| **Contract Framework** | Truffle Suite | Latest |
| **Local Blockchain** | Ganache | Latest |
| **Decentralized Storage** | IPFS (local node) | Latest |
| **Backend** | Node.js + Express | v5 |
| **Database** | MongoDB (Mongoose) | v8 |
| **File Upload** | Multer | v2 |
| **IPFS Client** | ipfs-http-client | v60 |
| **Blockchain Client** | Web3.js | v4 |
| **Frontend** | React + Vite | React 19, Vite 7 |
| **Blockchain (Frontend)** | Ethers.js | v6 |
| **Styling** | Tailwind CSS | v4 |
| **Icons** | Lucide React | Latest |
| **Routing** | React Router DOM | v7 |
| **Wallet** | MetaMask | Browser Extension |

---

## 📁 Project Structure

```
med-share-chain/
│
├── blockchain/                      # Truffle project (Smart Contracts)
│   ├── contracts/
│   │   └── AccessControl.sol        # Main smart contract (EHR logic)
│   ├── migrations/
│   │   └── 1_deploy_contract.js     # Deployment script
│   ├── build/contracts/             # Auto-generated JSON ABI after compile
│   └── truffle-config.js            # Truffle network config (Ganache @ 7545)
│
├── backend/                         # Node.js / Express API server
│   ├── controllers/
│   │   ├── auth.controller.js       # User registration & lookup
│   │   └── record.controller.js     # IPFS upload & permissioned fetch
│   ├── models/
│   │   └── user.model.js            # Mongoose schema (wallet, name, role)
│   ├── routes/
│   │   ├── auth.routes.js           # /api/auth routes
│   │   └── record.routes.js         # /api/records routes
│   ├── services/
│   │   ├── blockchain.service.js    # Web3 + contract instance
│   │   ├── ipfs.service.js          # ipfs-http-client connection
│   │   └── AccessControl.json       # Contract ABI (copy from blockchain/build)
│   ├── lib/
│   │   └── db.js                    # MongoDB connection helper
│   ├── .env                         # Backend environment variables
│   ├── server.js                    # App entry point
│   └── package.json
│
├── client/                          # React + Vite frontend
│   ├── artifacts/
│   │   ├── AccessControl.json       # Contract ABI (copy from blockchain/build)
│   │   └── contractAddress.js       # Exported contract address constant
│   ├── components/
│   │   ├── NavBar.jsx
│   │   ├── WalletConnect.jsx
│   │   └── dashboards/
│   │       ├── PatientDashboard.jsx # Upload records, grant/revoke access
│   │       └── ProviderDashboard.jsx# View inbox + search patient records
│   ├── context/
│   │   └── AuthContext.jsx          # MetaMask wallet state (global)
│   ├── pages/
│   │   ├── HomePage.jsx             # Landing page
│   │   ├── RegisterPage.jsx         # On-chain + DB registration form
│   │   └── Dashboard.jsx            # Routes to Patient or Provider dashboard
│   ├── services/
│   │   └── api.js                   # Axios calls to backend
│   ├── .env                         # Frontend environment variables
│   ├── vite.config.js
│   └── package.json
│
├── setup.txt                        # Original dev notes
├── presentation_slides.txt          # Academic presentation outline
└── README.md                        # This file
```

---

## 📜 Smart Contract

**File:** `blockchain/contracts/AccessControl.sol`  
**Solidity Version:** `0.8.20`  
**Network:** Ganache (local) — `127.0.0.1:7545`

### Data Structures

```solidity
struct Patient {
    address owner;       // Wallet address (primary key)
    string name;
    bool isRegistered;
    string[] recordHashes; // Array of IPFS CID hashes
}

struct Provider {
    address owner;
    string name;
    string hospital;
    bool isRegistered;
}

struct SharedRecord {
    address patient;     // Who shared the record
    string recordHash;   // IPFS CID
    uint256 sharedAt;    // Block timestamp
}
```

### Key Functions

| Function | Access | Description |
|---|---|---|
| `registerPatient(string _name)` | Public | Registers the caller as a patient |
| `registerProvider(string _name, string _hospital)` | Public | Registers the caller as a healthcare provider |
| `uploadRecord(string _recordHash)` | Patient only | Adds an IPFS hash to the patient's profile |
| `grantAccess(address _provider, string _hash)` | Patient only | Grants a provider permission to view a specific record |
| `revokeAccess(address _provider, string _hash)` | Patient only | Revokes the provider's permission |
| `checkAccess(address _patient, address _provider, string _hash)` | View (free) | Returns `true` if access is permitted |
| `getMyRecords()` | Patient only | Returns all IPFS hashes for the calling patient |
| `getPatientRecords(address _patient)` | View (free) | Returns all hashes for any patient address |
| `getProviderSharedRecords(address _provider)` | View (free) | Returns all records shared with a provider |

### Events (Audit Trail)
```
PatientRegistered(address indexed patientAddress, string name)
ProviderRegistered(address indexed providerAddress, string name, string hospital)
RecordUploaded(address indexed patientAddress, string recordHash, uint256 timestamp)
AccessGranted(address indexed patientAddress, address indexed providerAddress, string recordHash, uint256 timestamp)
AccessRevoked(address indexed patientAddress, address indexed providerAddress, string recordHash, uint256 timestamp)
```

---

## 🔗 API Reference

**Base URL:** `http://localhost:8080/api`

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/auth/register` | `{ walletAddress, name, role, hospital? }` | Save user profile to MongoDB |
| `GET` | `/auth/user/:walletAddress` | — | Fetch user profile by wallet |

### Records

| Method | Endpoint | Params | Description |
|---|---|---|---|
| `POST` | `/records/upload` | `form-data: file` | Uploads file to IPFS, returns CID hash |
| `GET` | `/records/:hash` | `?patientAddress=0x...&providerAddress=0x...` | Checks blockchain permission, streams file from IPFS |

---

## ✅ Prerequisites

Make sure the following are installed on your machine before starting:

| Tool | Download | Notes |
|---|---|---|
| **Node.js** (v18+) | https://nodejs.org | Includes `npm` |
| **Git** | https://git-scm.com | For cloning the repo |
| **Ganache** (GUI) | https://trufflesuite.com/ganache | Local Ethereum blockchain |
| **IPFS Desktop** or **IPFS CLI** | https://docs.ipfs.tech/install | Local IPFS node |
| **MetaMask** | https://metamask.io | Browser extension (Chrome/Firefox) |
| **MongoDB** | Atlas (cloud) or https://www.mongodb.com/try/download/community | Database |
| **Truffle** | `npm install -g truffle` | Smart contract framework |

---

## 🚀 Full Setup Guide

### Step 1 – Install Global Tools

Open a terminal and install Truffle globally:

```bash
npm install -g truffle
```

Verify the installation:
```bash
truffle version
```

---

### Step 2 – Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/med-share-chain.git
cd med-share-chain
```

---

### Step 3 – Set Up Ganache (Local Blockchain)

Ganache provides a personal Ethereum blockchain running entirely on your machine with pre-funded test accounts.

**Option A: Ganache GUI (Recommended for beginners)**

1. Download and open **Ganache** from https://trufflesuite.com/ganache
2. Click **"Quickstart Ethereum"**
3. Ganache will start on **`http://127.0.0.1:7545`**
4. You will see **10 test accounts**, each pre-loaded with **100 ETH**
5. **Leave Ganache open** throughout development — never close it while the app is running

> **Important:** Note the **RPC Server** address shown in Ganache (should be `HTTP://127.0.0.1:7545`). You will need this in the `.env` file.

**Option B: Ganache CLI**

```bash
npm install -g ganache
ganache --port 7545
```

---

### Step 4 – Set Up IPFS (Local Node)

IPFS stores the actual medical files off-chain.

**Option A: IPFS Desktop (Recommended)**

1. Download **IPFS Desktop** from https://docs.ipfs.tech/install/ipfs-desktop/
2. Open IPFS Desktop — it will start the daemon automatically
3. The API runs on **`http://127.0.0.1:5001`** by default
4. **Enable CORS** for the backend to connect (open a terminal):
   ```bash
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
   ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
   ```
5. Restart IPFS Desktop after applying CORS settings

**Option B: IPFS CLI**

```bash
# Install
npm install -g ipfs

# Initialize (first time only)
ipfs init

# Configure CORS
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'

# Start the daemon
ipfs daemon
```

Verify IPFS is running:
```
API server listening on /ip4/127.0.0.1/tcp/5001
```

---

### Step 5 – Deploy the Smart Contract

> **Make sure Ganache is running before this step.**

```bash
# Navigate to the blockchain folder
cd blockchain

# Install dependencies (if any)
npm install

# Compile the Solidity contract
truffle compile
```

You should see output like:
```
Compiling your contracts...
> Compiling .\contracts\AccessControl.sol
> Artifacts written to .\build\contracts
```

Now **deploy** (migrate) the contract to Ganache:

```bash
truffle migrate
```

Expected output:
```
1_deploy_contract.js
====================
   Deploying 'AccessControl'
   -------------------------
   > transaction hash:    0x...
   > contract address:    0x6871BE57EE17d0e0464a1ff3c5d2f8e7110Ef140
   > account:             0x...
```

> **🔑 Copy the `contract address`** — you will need it for both the backend and frontend `.env` files.

**Copy the ABI to backend and frontend:**

After compiling, a file is generated at `blockchain/build/contracts/AccessControl.json`.
You need to copy this file to two locations:

```bash
# Windows (PowerShell)
Copy-Item "blockchain\build\contracts\AccessControl.json" "backend\services\AccessControl.json"
Copy-Item "blockchain\build\contracts\AccessControl.json" "client\artifacts\AccessControl.json"
```

```bash
# macOS / Linux
cp blockchain/build/contracts/AccessControl.json backend/services/AccessControl.json
cp blockchain/build/contracts/AccessControl.json client/artifacts/AccessControl.json
```

---

### Step 6 – Configure the Backend

Navigate to the backend folder and install dependencies:

```bash
cd ../backend
npm install
```

Create (or edit) the `.env` file in the `backend/` directory:

```
# backend/.env

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
PINATA_JWT=YOUR_PINATA_JWT_TOKEN_IF_USING_PINATA
PORT=8080
```

| Variable | Value | Description |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string or `mongodb://localhost:27017/medshare` | Database connection |
| `GANACHE_URL` | `http://127.0.0.1:7545` | Local Ganache RPC endpoint |
| `CONTRACT_ADDRESS` | Address from Step 5 | Your deployed smart contract |
| `PINATA_JWT` | From https://app.pinata.cloud | Optional — only if using Pinata instead of local IPFS |
| `PORT` | `8080` | Backend server port |

---

### Step 7 – Run the Backend

```bash
# From the /backend directory
npm run dev
```

You should see:
```
IPFS Service Initialized
Blockchain service initialized, Connected to contract at: 0x6871...
Connected to MongoDB
Server is running on port http://localhost:8080
```

Test that the backend is running:
```
http://localhost:8080
```
Expected response: `Health-E-Chain Backend is running`

---

### Step 8 – Configure the Frontend

Open a **new terminal**, navigate to the client folder, and install dependencies:

```bash
cd client
npm install
```

Create (or edit) the `.env` file in the `client/` directory:

```
# client/.env

VITE_API_URL=http://localhost:8080
VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

Also update the contract address constant file:

**`client/artifacts/contractAddress.js`**
```js
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

> **Note:** Replace `0xYOUR_DEPLOYED_CONTRACT_ADDRESS` with the address you copied in Step 5. This must match the address in the backend `.env` file exactly.

---

### Step 9 – Run the Frontend

```bash
# From the /client directory
npm run dev
```

Expected output:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser at **`http://localhost:5173`**

---

## 🦊 Configure MetaMask

MetaMask is the browser wallet used to sign blockchain transactions.

### 1. Install MetaMask
Install from https://metamask.io and create a wallet if you don't have one.

### 2. Add Ganache as a Custom Network

1. Open MetaMask → click the **network dropdown** at the top
2. Click **"Add a network"** → **"Add a network manually"**
3. Fill in the fields:

| Field | Value |
|---|---|
| **Network Name** | Ganache Local |
| **New RPC URL** | `http://127.0.0.1:7545` |
| **Chain ID** | `1337` |
| **Currency Symbol** | `ETH` |

4. Click **Save**
5. Switch to the **Ganache Local** network

### 3. Import a Ganache Test Account

1. Open Ganache GUI → click the **key icon** 🔑 next to any account
2. Copy the **Private Key**
3. In MetaMask → click your account icon → **"Import Account"**
4. Paste the private key → **Import**

You now have a test account with 100 ETH on your local blockchain.

> ⚠️ **Never use these test private keys on a real/mainnet network. They are for local development only.**

---

## 👤 How to Use the Application

### As a Patient

1. Open `http://localhost:5173`
2. Click **"Connect Wallet"** → approve MetaMask connection
3. If this is your first time, you'll be redirected to the **Register** page
4. Select **"Patient"**, enter your name, and click **"Complete Registration"**
   - MetaMask will pop up → confirm the transaction (uses test ETH)
   - Wait for blockchain confirmation (~few seconds)
5. You'll land on the **Patient Dashboard**
6. **Upload a record:** Select a file → click **"Upload to Blockchain"**
   - File → IPFS → CID hash is stored on blockchain
7. **Grant access:** Go to **"Share & Permissions"** tab → enter doctor's wallet address + IPFS hash → click **"Grant Access"**
8. **Revoke access:** Same tab → click **"Revoke Access"** to remove permissions

### As a Healthcare Provider (Doctor)

1. Connect a **different** MetaMask account (import another Ganache account)
2. Register as **"Doctor"** with your name and hospital name
3. You'll land on the **Provider Dashboard**
4. **Incoming Records (Inbox):** Shows all records patients have explicitly shared with you
5. **Global Search:** Enter a patient's wallet address to see their records — but you can only **open** files you have been granted access to

---

## 🔐 Environment Variables Reference

### `backend/.env`
```env
MONGO_URI=           # MongoDB connection string
GANACHE_URL=         # http://127.0.0.1:7545
CONTRACT_ADDRESS=    # Deployed contract address (from truffle migrate)
PINATA_JWT=          # Pinata API JWT (optional, only if using Pinata for IPFS)
PORT=8080            # Backend port (default: 8080)
```

### `client/.env`
```env
VITE_API_URL=              # http://localhost:8080
VITE_CONTRACT_ADDRESS=     # Same contract address as backend
```

---

## ⚠️ Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `Missing environment variables` on backend start | `.env` file is incomplete | Ensure `GANACHE_URL` and `CONTRACT_ADDRESS` are set in `backend/.env` |
| `Could not connect to IPFS` | IPFS daemon not running | Start IPFS Desktop or run `ipfs daemon` in a terminal |
| `MetaMask: Wrong Network` | MetaMask is on mainnet/testnet | Switch to **Ganache Local** network in MetaMask settings |
| `Transaction reverted: Patient already registered` | Wallet is already registered | Use a fresh Ganache account, or the app will redirect you to the dashboard |
| `Error: Cannot find module AccessControl.json` | ABI file not copied after compile | Copy `blockchain/build/contracts/AccessControl.json` to both `backend/services/` and `client/artifacts/` |
| `Unauthorized: You do not have permission` | Provider tries to view a record without access | Patient must first grant access from the Patient Dashboard |
| `truffle migrate` fails | Ganache not running | Open Ganache and ensure it's running on port `7545` |
| `CORS error` on IPFS | IPFS API headers not configured | Run the `ipfs config` CORS commands in Step 4 and restart IPFS |
| `Contract address mismatch` | Re-deployed contract but forgot to update `.env` | Re-run `truffle migrate --reset` and update the address in both `.env` files and `contractAddress.js` |

---

## 🔁 Quick Start Checklist (Everyday Dev Flow)

Every time you work on the project, start services in this order:

- [ ] Start **Ganache** (GUI or CLI)
- [ ] Start **IPFS** (`ipfs daemon` or IPFS Desktop)
- [ ] Run **Backend**: `cd backend && npm run dev`
- [ ] Run **Frontend**: `cd client && npm run dev`
- [ ] Open browser at `http://localhost:5173`
- [ ] Ensure MetaMask is connected to **Ganache Local** network

---

## 🚀 Future Enhancements

- [ ] Integration with real-world hospital systems via **HL7/FHIR** standards
- [ ] **Mobile app** with React Native + Expo and biometric authentication
- [ ] **Zero-Knowledge Proofs (ZKPs)** for privacy-preserving selective disclosure
- [ ] **IPFS Pinning** via Pinata for long-term data persistence (partially integrated via `PINATA_JWT`)
- [ ] **File encryption** at rest using patient's public key before IPFS upload
- [ ] Deploy to an Ethereum **testnet** (Sepolia) for wider testing

---

## 📚 References

- [Ethereum Developer Docs](https://ethereum.org/en/developers/docs/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Truffle Suite Docs](https://trufflesuite.com/docs/)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Web3.js Docs](https://web3js.readthedocs.io/)
- Nakamoto, S. *"Bitcoin: A Peer-to-Peer Electronic Cash System."* 2008.
- Benet, J. *"IPFS - Content Addressed, Versioned, P2P File System."* 2014.
- Azaria, A., et al. *"MedRec: Using Blockchain for Medical Data Access and Permission Management."* 2016.

---

> **Department of Computer Science & Engineering**  
> *Med Share Chain — Decentralized EHR Management*
