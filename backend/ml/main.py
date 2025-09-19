from speciesnet import DEFAULT_MODEL
from .predictions import split_video_fun, detectAllAnimals, predictEachAnimal, extractTimestamps, createEventSummary
import tempfile
from rq import get_current_job
import os

def analyze(video_file):
    job = get_current_job()

    with tempfile.TemporaryDirectory() as unique_temp_dir:

        job.meta['status'] = 'Splitting video...'
        job.meta['progress'] = 10
        job.save_meta()

        split_video_fun(video_file, unique_temp_dir)

        job.meta['status'] = 'Detecting animals...'
        job.meta['progress'] = 30
        job.save_meta()

        detections_dict = detectAllAnimals(unique_temp_dir, DEFAULT_MODEL)

        job.meta['status'] = 'Classifying each animal...'
        job.meta['progress'] = 60
        job.save_meta()

        predictions_dict = predictEachAnimal(detections_dict, DEFAULT_MODEL)

        job.meta['status'] = 'Generating final summary...'
        job.meta['progress'] = 90
        job.save_meta()

        frame_data  = extractTimestamps(predictions_dict)
        final_summary = createEventSummary(frame_data)

        return final_summary



