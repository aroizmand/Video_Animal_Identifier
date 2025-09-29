import os
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from . import q, b2_api 
from .models import db, Analysis
from .ml.main import analyze

main_bp = Blueprint('main', __name__)

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'mp4', 'webm', 'avi', 'mov', 'wb'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@main_bp.route('/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        try:
            bucket = b2_api.get_bucket_by_id(os.environ.get('B2_BUCKET_ID'))
            file_info = bucket.upload_bytes(file.read(), file_name=filename)
            download_url = b2_api.get_download_url_for_fileid(file_info.id_)
            
            job = q.enqueue_call(
                func=analyze, 
                args=(download_url, current_user.id), 
                timeout=1800 
            )

            new_analysis = Analysis(
                job_id=job.id,
                user_id=current_user.id,
                original_filename=filename
            )
            db.session.add(new_analysis)
            db.session.commit()

            return jsonify({'job_id': job.id})
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({'error': 'Failed to process file.'}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

@main_bp.route("/results/<job_id>", methods=['GET'])
@login_required
def get_results(job_id):
    analysis = Analysis.query.filter_by(job_id=job_id, user_id=current_user.id).first_or_404()
    
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
        if analysis.status == 'finished':
             response_object = {
                'status': 'finished',
                'result': analysis.result,
                'progress': 100,
                'progress_status': 'Complete'
            }
             return jsonify(response_object)
        
        return jsonify({'error': 'Job not found or has expired'}), 404

@main_bp.route('/analyses', methods=['GET'])
@login_required
def get_analyses_history():
    analyses = Analysis.query.filter_by(user_id=current_user.id).order_by(Analysis.created_at.desc()).all()
    results = [
        {
            "id": an.id,
            "job_id": an.job_id,
            "status": an.status,
            "filename": an.original_filename,
            "created_at": an.created_at.isoformat()
        } for an in analyses
    ]
    return jsonify(results)
