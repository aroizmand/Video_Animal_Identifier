from speciesnet import SpeciesNetDetector, SpeciesNetClassifier, load_rgb_image
import os
import numpy as np
from types import SimpleNamespace
from PIL import Image
import cv2
from .models import DETECTOR, CLASSIFIER


DETECTOR_INPUT_SIZE = (640, 640)
CLASSIFIER_INPUT_SIZE = (480, 480)


def split_video_fun(video_path, img_directory):
    """
    Splits a video into frames, saving one frame per second.
    """
    print(f"DEBUG: split_video_fun received path: {video_path}")
    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        print(f"DEBUG: ERROR - cv2.VideoCapture could not open the video at {video_path}.")
        return

    print("DEBUG: Video opened successfully. Proceeding to extract frames.")
    
    fps = video.get(cv2.CAP_PROP_FPS)
    frame_interval = round(fps) if fps > 0 else 1

    currentFrame = 0
    savedFrameCount = 0
    while True:
        success, frame = video.read()
        if not success:
            break
        
        if currentFrame % frame_interval == 0:
            file_name = f"{savedFrameCount}.jpg"
            cv2.imwrite(os.path.join(img_directory, file_name), frame)
            savedFrameCount += 1

        currentFrame += 1

    print(f"DEBUG: Finished splitting. Total frames saved: {savedFrameCount}")
    video.release()
    cv2.destroyAllWindows()


def get_all_full_image_paths_from(img_directory):
    """
    Gets a list of full paths for all .jpg files in a directory.
    This is a critical fix to ensure only images are processed.
    """
    full_paths = []
    try:
        image_filenames = os.listdir(img_directory)
        for filename in image_filenames:
            if filename.lower().endswith('.jpg'): # Only process image files
                full_path = os.path.join(img_directory, filename)
                full_paths.append(full_path)
    except FileNotFoundError:
        print(f"DEBUG: ERROR - Directory not found: {img_directory}")
    return full_paths


def structure_the_results(detection_list):
    """Wraps a list of detections in the standard dictionary format."""
    detections_dict = {'predictions': []}
    if detection_list:
        detections_dict['predictions'] = detection_list
    return detections_dict


def detectAllAnimals(img_directory):
    """Runs the object detector on all images in a directory."""
    full_image_paths = get_all_full_image_paths_from(img_directory)
    if not full_image_paths:
        return {'predictions': []}

    all_results = []
    model = DETECTOR


    for image_path in full_image_paths:
        try:
            image_object = load_rgb_image(image_path) 
            resized_image = image_object.resize(DETECTOR_INPUT_SIZE)
            image_array = np.array(resized_image)
            
            image_wrapper = SimpleNamespace()
            image_wrapper.arr = image_array
            image_wrapper.orig_width = image_object.width
            image_wrapper.orig_height = image_object.height
            
            single_result = model.predict(img=image_wrapper, filepath=image_path) 
            all_results.append(single_result)
        except Exception as e:
            print(f"DEBUG: ERROR - Failed to detect animals in {image_path}. Reason: {e}")
            
    return structure_the_results(all_results)


def predictEachAnimal(detections_dict):
    """Runs the species classifier on each detected animal."""
    model = CLASSIFIER
    final_results = []

    for entry in detections_dict.get('predictions', []):
        try:
            img = Image.open(entry['filepath'])
            for animal in entry.get('detections', []):
                left = animal['bbox'][0] * img.width
                upper = animal['bbox'][1] * img.height
                right = (animal['bbox'][0] + animal['bbox'][2]) * img.width
                lower = (animal['bbox'][1] + animal['bbox'][3]) * img.height
                
                crop_box = (left, upper, right, lower)
                cropped_image = img.crop(crop_box)
                
                resized_image= cropped_image.resize(CLASSIFIER_INPUT_SIZE)
                image_array = np.array(resized_image)
                
                image_wrapper = SimpleNamespace()
                image_wrapper.arr = image_array
                image_wrapper.orig_width = resized_image.width
                image_wrapper.orig_height = resized_image.height

                single_result = model.predict(img=image_wrapper, filepath=entry['filepath']) 
                final_results.append({
                    'filepath': entry['filepath'],
                    'bbox': animal['bbox'],
                    'prediction': single_result
                })
        except Exception as e:
            print(f"DEBUG: ERROR - Failed to classify animal in {entry.get('filepath', 'unknown file')}. Reason: {e}")
            
    return final_results


def extractTimestamps(flatPredictions):
    """Groups individual animal classifications by frame and species."""
    frame_data = {}
    for prediction in flatPredictions:
        try:
            filename = os.path.basename(prediction['filepath'])
            timestamp = int(filename.split('.')[0])
            
            classifications_dict = prediction.get('prediction', {}).get('classifications', {})
            classes_list = classifications_dict.get('classes', [';blank'])

            if classes_list:
                classifications_string = classes_list[0]
            else:
                classifications_string = ';blank'
                
            split_top_class = classifications_string.split(';')
            top_prediction = split_top_class[-1]

            if timestamp not in frame_data:
                frame_data[timestamp] = {top_prediction: 1}
            else:
                if top_prediction not in frame_data[timestamp]:
                    frame_data[timestamp][top_prediction] = 1
                else:
                    frame_data[timestamp][top_prediction] += 1
        except Exception as e:
            print(f"DEBUG: ERROR - Failed to extract timestamp for a prediction. Reason: {e}")

    return frame_data


def createEventSummary(frame_data):
    """Creates a final summary of continuous animal sighting events."""
    if not frame_data:
        return []
    
    active_events = {} 
    final_events = [] 

    min_event = min(frame_data.keys())
    max_event = max(frame_data.keys())

    for second in range(min_event, max_event + 1):
        species_in_frame = frame_data.get(second, {})
        for species in list(active_events.keys()):
            if species not in species_in_frame:
                event_data = active_events[species]
                final_record = {
                    'species': species,
                    'start': event_data['start'],
                    'end': second - 1,
                    'max_count': event_data['max_count']
                }
                final_events.append(final_record)
                del active_events[species]

        for species, count in species_in_frame.items():
            if species == 'blank':
                continue

            if species in active_events:
                if count > active_events[species]['max_count']:
                    active_events[species]['max_count'] = count
            else:
                active_events[species] = {
                    'start': second,
                    'max_count': count
                }
    
    for species, event_data in active_events.items():
        final_record = {
            'species': species,
            'start': event_data['start'],
            'end': max_event, 
            'max_count': event_data['max_count']
        }
        final_events.append(final_record)

    return final_events
