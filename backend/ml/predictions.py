from speciesnet import SpeciesNetDetector, SpeciesNetClassifier, load_rgb_image
import os
import numpy as np
from types import SimpleNamespace
from PIL import Image
import cv2


def split_video_fun(video_path, img_directory):
    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        return 0

    fps = video.get(cv2.CAP_PROP_FPS)
    frame_interval = round(fps) if fps > 0 else 1

    if not os.path.exists(img_directory):
        os.makedirs(img_directory)

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

    video.release()
    cv2.destroyAllWindows()


def get_all_full_image_paths_from(img_directory):
    full_paths = []
    image_filenames = os.listdir(img_directory)
    for filename in image_filenames:
        full_path = os.path.join(img_directory, filename)
        full_paths.append(full_path)
    return full_paths


def structure_the_results(detection_list):
    detections_dict = {'predictions': []}

    for detection in detection_list:
        detections_dict['predictions'].append(detection)
    
    return detections_dict


def detectAllAnimals(img_directory, chosen_model):
    full_image_paths = get_all_full_image_paths_from(img_directory)
    all_results = []
    model = SpeciesNetDetector(chosen_model)

    for image_path in full_image_paths:
        image_object = load_rgb_image(image_path) 
        model_input_size = (640, 640)
        resized_image = image_object.resize(model_input_size)

        image_array = np.array(resized_image)
        image_wrapper = SimpleNamespace()
        
        image_wrapper.arr = image_array
        image_wrapper.orig_width = image_object.width
        image_wrapper.orig_height = image_object.height
        single_result = model.predict(img=image_wrapper, filepath=image_path) 
        all_results.append(single_result)
        
    final_detections_dict = structure_the_results(all_results)

    return final_detections_dict


def predictEachAnimal(detections_dict, chosen_model):
    model = SpeciesNetClassifier(chosen_model)
    final_results = []

    for entry in detections_dict['predictions']:
        img = Image.open(entry['filepath'])
        for animal in entry['detections']:

            left = animal['bbox'][0] * img.width
            upper = animal['bbox'][1] * img.height
            right = (animal['bbox'][0] + animal['bbox'][2]) * img.width
            lower = (animal['bbox'][1] + animal['bbox'][3]) * img.height
            crop_box = (left, upper, right, lower)
            cropped_image = img.crop(crop_box)
            model_input_size = (480, 480)
            resized_image= cropped_image.resize(model_input_size)
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
    
    return final_results

def extractTimestamps(flatPredictions):
    
    frame_data = {}

    for prediction in flatPredictions:

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
            frame_data[timestamp] = {top_prediction :1}

        else:
            if top_prediction in frame_data[timestamp]:
                frame_data[timestamp][top_prediction] += 1

            else:
                frame_data[timestamp][top_prediction] = 1

    return frame_data


def createEventSummary(frame_data):

    if not frame_data:
        return []
    
    active_events = {}  
    final_events = [] 

    min_event = min(frame_data.keys())
    max__event = max(frame_data.keys())

    for second in range(min_event, max__event+1):
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
            'end': max__event,  
            'max_count': event_data['max_count']
        }
        final_events.append(final_record)


    return final_events


