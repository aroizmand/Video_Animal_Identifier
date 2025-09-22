import os
from flask import Flask, jsonify, request, redirect
from werkzeug.utils import secure_filename
from ml.main import analyze
from redis import Redis
from rq import Queue
# B2-specific imports
from b2sdk.v2 import B2Api, InMemoryAccountInfo
# Import for CORS
from flask_cors import CORS
# Import for local environment variables
from dotenv import load_dotenv

# Load environment variables from a .env file for local development
load_dotenv()

# --- B2 Cloud Storage Configuration ---
# Initialize B2 API info from environment variables
info = InMemoryAccountInfo()
b2_api = B2Api(info)
key_id = os.environ.get('B2_KEY_ID')
application_key = os.environ.get('B2_APPLICATION_KEY')
bucket_name = os.environ.get('B2_BUCKET_NAME')
b2_api.authorize_account("production", key_id, application_key)
bucket = b2_api.get_bucket_by_name(bucket_name)

# --- Flask App Configuration ---
ALLOWED_EXTENSIONS = {'mp4', 'webm', 'avi', 'mov', 'wb'}
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'a-default-secret-key-for-local-dev')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000

# Enable CORS to allow your frontend to make requests
CORS(app)

# --- Redis/RQ Configuration ---
redis_url = os.environ.get('REDIS_URL')
redis_conn = Redis.from_url(redis_url or 'redis://localhost:6379')
q = Queue(connection=redis_conn)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            # --- UPLOAD TO B2 LOGIC ---
            try:
                print(f"Uploading {filename} to B2 bucket: {bucket_name}...")
                file_info = bucket.upload_bytes(
                    file.read(),
                    file_name=filename
                )
                print("Upload to B2 successful.")
                
                download_url = b2_api.get_download_url_for_fileid(file_info.id_)
                print(f"Enqueuing job for URL: {download_url}")
                
                job = q.enqueue_call(
                    func=analyze, 
                    args=(download_url,), 
                    timeout=1800 # Increased timeout to 30 minutes for long videos
                )
                return jsonify({'job_id': job.id})
            except Exception as e:
                print(f"An error occurred during B2 upload or job enqueuing: {e}")
                return jsonify({'error': 'Failed to process file.'}), 500

    # The GET request serves the HTML form for simple testing
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <p>This is a simple test form. Use the real frontend for progress updates.</p>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

@app.route("/results/<job_id>", methods=['GET'])
def get_results(job_id):
    job = q.fetch_job(job_id)
    if job:
        response_object = {
            'status': job.get_status(),
            'result': job.result,
            'progress': job.meta.get('progress', 0),
            'progress_status': job.meta.get('status', 'Waiting...')
        }
        return jsonify(response_object)
    else:
        return jsonify({'error': 'Job not found'}), 404

