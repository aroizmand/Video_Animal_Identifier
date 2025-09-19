import os
from flask import Flask, flash, jsonify, request, redirect, send_from_directory
from werkzeug.utils import secure_filename
from ml.main import analyze
from redis import Redis
from rq import Queue

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'webm', 'avi', 'mov', 'wb'}

app = Flask(__name__)

app.secret_key = os.environ.get('SECRET_KEY', 'a-default-secret-key-for-local-dev')

app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']

        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            flash('passed')
            filename = secure_filename(file.filename)
            saved_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(saved_file_path)
            path_for_worker = saved_file_path.replace('\\', '/')

            job = q.enqueue_call(
                func=analyze, 
                args=(path_for_worker,), 
                timeout=600
            )

            return jsonify({'job_id': job.id})

    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''


@app.route('/uploads/<name>')
def download_file(name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], name)

app.add_url_rule(
    "/uploads/<name>", endpoint="download_file", build_only=True
)

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
        return "Job not found", 404


