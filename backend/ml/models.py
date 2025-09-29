# ml/models.py (or equivalent file)

from speciesnet import SpeciesNetDetector, SpeciesNetClassifier, DEFAULT_MODEL

_DETECTOR = None
_CLASSIFIER = None

def get_detector():
    """Lazily loads and returns the SpeciesNetDetector model."""
    global _DETECTOR
    if _DETECTOR is None:
        print("DEBUG: First use; loading SpeciesNetDetector model...")
        _DETECTOR = SpeciesNetDetector(DEFAULT_MODEL)
    return _DETECTOR

def get_classifier():
    """Lazily loads and returns the SpeciesNetClassifier model."""
    global _CLASSIFIER
    if _CLASSIFIER is None:
        print("DEBUG: First use; loading SpeciesNetClassifier model...")
        _CLASSIFIER = SpeciesNetClassifier(DEFAULT_MODEL)
    return _CLASSIFIER