// Simple script to clear invoices collection
// Run with: node clear-invoices.js

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'orbix';

async function clearInvoices() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);
        const result = await db.collection('invoices').deleteMany({});
        
        console.log(`Deleted ${result.deletedCount} invoices`);
        console.log('Invoice collection cleared successfully!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

clearInvoices();
