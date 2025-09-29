# database.py
import pymongo
from gridfs import GridFS
from bson.objectid import ObjectId
import datetime
from config import MONGO_URI, DB_NAME, DOCUMENTS_COLLECTION_NAME

# --- Initialize Database Connection ---
try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DB_NAME]
    fs = GridFS(db)
    documents_collection = db[DOCUMENTS_COLLECTION_NAME]
    print("✅ Successfully connected to MongoDB Atlas.")
except Exception as e:
    print(f"❌ Could not connect to MongoDB. Error: {e}")
    exit()

def upload_file_and_create_record(filename: str, file_data):
    """Saves file data to GridFS and creates a metadata record."""
    print(f"--- UPLOADING: '{filename}' ---")
    file_id = fs.put(file_data, filename=filename)
    print(f"📄 File saved to GridFS with ID: {file_id}")

    metadata_doc = {
        "filename": filename,
        "status": "uploaded",
        "gridfs_id": file_id,
        "upload_date": datetime.datetime.now(datetime.UTC)
    }
    result = documents_collection.insert_one(metadata_doc)
    print(f"📄 Created metadata record with ID: {result.inserted_id}")
    return result.inserted_id

def fetch_file_from_gridfs(doc_id: ObjectId):
    """Fetches a file from GridFS using the ID from the main collection."""
    print(f"--- FETCHING record with ID: {doc_id} ---")
    metadata_doc = documents_collection.find_one({"_id": doc_id})
    gridfs_id = metadata_doc.get("gridfs_id")
    file_obj = fs.get(gridfs_id)
    print(f"✅ Successfully retrieved '{file_obj.filename}' from GridFS.")
    return file_obj

def save_processed_chunks(metadata_doc_id: ObjectId, documents_to_insert: list):
    """Deletes the placeholder and saves the final processed chunks."""
    print("\n--- SAVING TO ATLAS ---")
    # First, delete the placeholder metadata document
    documents_collection.delete_one({"_id": metadata_doc_id})
    # Now, insert all the new, detailed chunk documents
    if documents_to_insert:
        documents_collection.insert_many(documents_to_insert)
        print(f"✅ Ingested {len(documents_to_insert)} chunks into the '{DOCUMENTS_COLLECTION_NAME}' collection.")
    else:
        print("⚠️ No chunks were generated to save.")