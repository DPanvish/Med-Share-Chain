import { create } from 'ipfs-http-client'

// IPFS stands for InterPlanetary File System
// ipfs is used to store the files on IPFS
// It is a decentralized storage network
const ipfs = create({
    host: "127.0.0.1",
    port: 5001,
    protocol: 'http'
})

console.log("IPFS Service Initialized");

export default ipfs;
