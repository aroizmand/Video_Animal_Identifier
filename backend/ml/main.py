from speciesnet import DEFAULT_MODEL
from .predictions import split_video_fun, detectAllAnimals, predictEachAnimal, extractTimestamps, createEventSummary
import tempfile
from rq import get_current_job
import os

def analyze(video_file):
    job = get_current_job()
    print(f"DEBUG: Starting analysis for job {job.id} on video: {video_file}")

    with tempfile.TemporaryDirectory() as unique_temp_dir:

        # --- Stage 1: Splitting Video ---
        job.meta['status'] = 'Splitting video...'
        job.meta['progress'] = 10
        job.save_meta()
        split_video_fun(video_file, unique_temp_dir)
        num_frames = len(os.listdir(unique_temp_dir))
        print(f"DEBUG: Video split into {num_frames} frames.")
        
        # Check if any frames were created before proceeding
        if num_frames == 0:
            print("DEBUG: No frames were extracted. Ending analysis.")
            return []

        # --- Stage 2: Detecting Animals ---
        job.meta['status'] = 'Detecting animals...'
        job.meta['progress'] = 30
        job.save_meta()
        detections_dict = detectAllAnimals(unique_temp_dir, DEFAULT_MODEL)
        total_detections = sum(len(p.get('detections', [])) for p in detections_dict.get('predictions', []))
        print(f"DEBUG: Detector found a total of {total_detections} potential animals.")

        # --- Stage 3: Classifying Each Animal ---
        job.meta['status'] = 'Classifying each animal...'
        job.meta['progress'] = 60
        job.save_meta()
        predictions_dict = predictEachAnimal(detections_dict, DEFAULT_MODEL)
        print(f"DEBUG: Classifier generated {len(predictions_dict)} individual predictions.")

        # --- Stage 4: Grouping by Frame ---
        job.meta['status'] = 'Generating final summary...'
        job.meta['progress'] = 90
        job.save_meta()
        frame_data  = extractTimestamps(predictions_dict)
        print(f"DEBUG: Grouped data into {len(frame_data)} frames with classifications.")
        
        # --- Stage 5: Creating Final Summary ---
        final_summary = createEventSummary(frame_data)
        print(f"DEBUG: Final summary contains {len(final_summary)} events.")
        print(f"DEBUG: Final result: {final_summary}")

        return final_summary



