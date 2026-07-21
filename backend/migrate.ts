import mongoose from 'mongoose';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/shopease';
// Changing ecommerce to shopease so the database name matches your local setup
const REMOTE_URI = 'mongodb+srv://Srinathon003:Srinathon1234@cluster0.ecummvq.mongodb.net/shopease?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
    console.log('Connecting to databases...');
    
    // Connect to local
    const localConnection = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('Connected to local database');
    
    // Connect to remote
    const remoteConnection = await mongoose.createConnection(REMOTE_URI).asPromise();
    console.log('Connected to remote database');

    const localDb = localConnection.db;
    const remoteDb = remoteConnection.db;

    if (!localDb || !remoteDb) {
        console.error('Failed to get database references');
        process.exit(1);
    }

    try {
        // Get all collections from local DB
        const collections = await localDb.listCollections().toArray();
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`\nMigrating collection: ${collectionName}...`);
            
            const localCollection = localDb.collection(collectionName);
            const remoteCollection = remoteDb.collection(collectionName);
            
            // Get all documents from local collection
            const documents = await localCollection.find({}).toArray();
            console.log(`Found ${documents.length} documents in local ${collectionName}`);
            
            if (documents.length > 0) {
                // Clear remote collection first (optional, but good for a fresh start)
                await remoteCollection.deleteMany({});
                
                // Insert documents into remote collection
                await remoteCollection.insertMany(documents);
                console.log(`Successfully inserted ${documents.length} documents into remote ${collectionName}`);
            } else {
                console.log(`No documents to insert for ${collectionName}`);
            }
        }
        
        console.log('\nMigration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await localConnection.close();
        await remoteConnection.close();
        process.exit(0);
    }
}

migrate();
