# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from database import upload_file_and_create_record, fetch_file_from_gridfs, save_processed_chunks
from processor import process_document_pipeline

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "KMRL Document Management API is running."}

@app.post("/upload")
async def upload_and_process_file(file: UploadFile):
    """
    This endpoint handles the file upload and the entire processing pipeline.
    """
    try:
        # Step 1: Upload the raw file to GridFS and create a metadata record
        file_data = await file.read()
        metadata_doc_id = upload_file_and_create_record(file.filename, file_data)

        # Step 2: Fetch the file back from GridFS for processing
        raw_file_obj = fetch_file_from_gridfs(metadata_doc_id)

        # Step 3: Run the full processing pipeline
        documents_to_insert = process_document_pipeline(metadata_doc_id, raw_file_obj)

        # Step 4: Save the final, enriched chunks to the 'documents' collection
        save_processed_chunks(metadata_doc_id, documents_to_insert)

        return {
            "message": "File processed and ingested successfully.",
            "doc_id": str(metadata_doc_id),
            "chunks_created": len(documents_to_insert)
        }
    except Exception as e:
        # Basic error handling
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")