from pymongo import MongoClient
from bson import ObjectId
from gridfs import GridFS

def fetch_file_from_gridfs(doc_id: str):
    """Fetches a file from GridFS using the ID from the main collection."""
    
    # 1. Find the metadata document
    metadata_doc = documents_collection.find_one({"_id": ObjectId(doc_id)})
    if not metadata_doc:
        print("No document found with that ID.")
        return None
        
    gridfs_id = metadata_doc.get("gridfs_id")
    if not gridfs_id:
        print("Document has no GridFS pointer.")
        return None
        
    # 2. Get the file from GridFS using the pointer
    try:
        file_obj = fs.get(gridfs_id)
        print(f"Successfully retrieved '{file_obj.filename}' from GridFS.")
        return file_obj
    except Exception as e:
        print(f"Could not retrieve file from GridFS. Error: {e}")
        return None

# You would then pass the returned 'file_obj' to your text extraction function