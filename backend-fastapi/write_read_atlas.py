import pymongo
from gridfs import GridFS
from bson.objectid import ObjectId
import os
import datetime
from dotenv import load_dotenv

CONNECTION_STRING = os.getenv("CONNECTION_STRING")

load_dotenv()
print("🚀 Starting GridFS test script...")

# --- 1. SETUP (Improved) ---
try:
    MONGO_URI = os.getenv("CONNECTION_STRING")
    if not MONGO_URI:
        raise ValueError("MONGO_URI not found in .env file.")
        
    client = pymongo.MongoClient(MONGO_URI)
    db = client.kmrl_db
    fs = GridFS(db)
    documents_collection = db.documents
    print("✅ Successfully connected to MongoDB Atlas.")
except Exception as e:
    print(f"❌ Could not connect to MongoDB. Error: {e}")
    exit()

# --- 2. FUNCTIONS (No changes needed here) ---
def upload_file_and_create_record(filepath: str):
    # ... (function is perfect as is)
    print(f"\n--- UPLOADING: '{os.path.basename(filepath)}' ---")
    try:
        with open(filepath, "rb") as file_data:
            file_id = fs.put(file_data, filename=os.path.basename(filepath))
        print(f"📄 File saved to GridFS with ID: {file_id}")

        metadata_doc = {
            "filename": os.path.basename(filepath),
            "status": "uploaded_for_test",
            "gridfs_id": file_id, # The crucial pointer
            "upload_date": datetime.datetime.now(datetime.UTC)
        }
        result = documents_collection.insert_one(metadata_doc)
        print(f"📄 Created metadata record with ID: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print(f"❌ Upload failed. Error: {e}")
        return None

def fetch_file_from_gridfs(doc_id: str):
    # ... (function is perfect as is)
    print(f"\n--- FETCHING record with ID: {doc_id} ---")
    try:
        metadata_doc = documents_collection.find_one({"_id": ObjectId(doc_id)})
        if not metadata_doc:
            print("❌ No document found with that ID.")
            return None
        
        gridfs_id = metadata_doc.get("gridfs_id")
        if not gridfs_id:
            print("❌ Document has no GridFS pointer.")
            return None
        
        file_obj = fs.get(gridfs_id)
        print(f"✅ Successfully retrieved '{file_obj.filename}' from GridFS.")
        return file_obj
    except Exception as e:
        print(f"❌ Could not retrieve file from GridFS. Error: {e}")
        return None

# --- 3. RUN THE TEST (Improved) ---
if __name__ == "__main__":
    # Ensure the 'documents' directory exists
    os.makedirs("documents", exist_ok=True) 
    
    # Use os.path.join for a cross-platform safe path
    test_filename = "documents\malayalam_test_doc.pdf"
    
    new_doc_id = upload_file_and_create_record(test_filename)
    
    if new_doc_id:
        retrieved_file = fetch_file_from_gridfs(new_doc_id)
        if retrieved_file:
            print("\n🎉 TEST SUCCESSFUL! Both upload and fetch are working.")
            os.remove(test_filename)
        else:
            print("\n🔥 TEST FAILED on the fetch step.")
    else:
        print("\n🔥 TEST FAILED on the upload step.")
    
    # It's good practice to close the connection when the script is done
    client.close()