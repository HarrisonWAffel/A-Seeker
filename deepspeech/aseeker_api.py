import json
import os
import sys
# import tensorflow as tf
import transcribe
import aseeker_controller
from flask import Flask, request, send_from_directory

from DeepSpeech.training.deepspeech_training.util.config import initialize_globals
from DeepSpeech.training.deepspeech_training.util.flags import create_flags, FLAGS

AUDIO_FOLDER = './audio'
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)

ALLOWED_EXTENSIONS = {'wav', 'mp3', 'mp4'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = AUDIO_FOLDER

pending_transcripts = []

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload/<filename>/<threads>', methods=['POST'])
def upload_file(filename, threads):

    if "/" in filename:
        # Return 400 BAD REQUEST
        os.abort(400, "no subdirectories directories allowed")

    with open(os.path.join(AUDIO_FOLDER, filename), "wb") as fp:
        fp.write(request.data)

    pending_transcripts.append(filename)
    transcription = aseeker_controller.transcribe_input(os.path.join(AUDIO_FOLDER, filename), threads)
    pending_transcripts.remove(filename)

    return transcription, 201

@app.route('/get/pending', methods=['GET'])
def get_pending():
    return '\n'.join(map(str, pending_transcripts))


@app.route('/get/<filename>', methods=['GET'])
def get_file(filename):
    try:
        return send_from_directory(AUDIO_FOLDER, filename=filename, as_attachment=True)
    except FileNotFoundError:
        os.abort(404)


if __name__ == '__main__':
    # create_flags()

    #
    # tf.app.flags.DEFINE_string('src', '', 'Source path to an audio file or directory or catalog file.'
    #                                       'Catalog files should be formatted from DSAlign. A directory will'
    #                                       'be recursively searched for audio. If --dst not set, transcription logs (.tlog) will be '
    #                                       'written in-place using the source filenames with '
    #                                       'suffix ".tlog" instead of ".wav".')
    # tf.app.flags.DEFINE_string('dst', '', 'path for writing the transcription log or logs (.tlog). '
    #                                       'If --src is a directory, this one also has to be a directory '
    #                                       'and the required sub-dir tree of --src will get replicated.')
    # tf.app.flags.DEFINE_boolean('recursive', False, 'scan dir of audio recursively')
    # tf.app.flags.DEFINE_boolean('force', False, 'Forces re-transcribing and overwriting of already existing '
    #                                             'transcription logs (.tlog)')
    # tf.app.flags.DEFINE_integer('vad_aggressiveness', 2, 'How aggressive (0=lowest, 3=highest) the VAD should '
    #                                                      'split audio')
    # tf.app.flags.DEFINE_integer('batch_size', 2, 'Default batch size')
    # tf.app.flags.DEFINE_float('outlier_duration_ms', 5000,
    #                           'Duration in ms after which samples are considered outliers')
    # tf.app.flags.DEFINE_integer('outlier_batch_size', 1, 'Batch size for duration outliers (defaults to 1)')
    #
    #
    #
    #
    #
    # FLAGS(sys.argv)
    # initialize_globals()

    app.run(host='0.0.0.0', debug=False, threaded=True)

