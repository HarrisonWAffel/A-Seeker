#!/usr/bin/env python

# Author: Harrison Affel!

# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function

import sys
import threading
import time
import json
import os
import shlex
import subprocess
import wave
from asyncio.queues import Queue

import wavSplit
from DeepSpeech.native_client.python import Model
import json
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import logging
logging.getLogger('sox').setLevel(logging.ERROR)
import queue
import numpy as np
global output

NUM_THREADS = 4
CHUNK_SIZE = 60000

class ChunkWorker(threading.Thread):

    def __init__(self, ReadQueue, WriteQueue, ds):
        threading.Thread.__init__(self)
        self.ds = ds
        self.ReadQueue = ReadQueue
        self.WriteQueue = WriteQueue

    def run(self):
        while True:
            words = []
            word_times = []

            segment_info = self.ReadQueue.get()

            if segment_info.get('index') == -1:
                print("sentinel", file=sys.stderr, flush=True)
                return

            word = ''
            cur_time = 0.0
            chunkstart = time.time()
            audio = np.frombuffer(segment_info.get('chunk').bytes, dtype=np.int16)

            # print("Thread is begining to start processing a chunk", file=sys.stderr, flush=True)
            output = self.ds.sttWithMetadata(audio, 1)  # Run Deepspeech
            # print("Thread has FINISHED processing a chunk. It took {} ".format(time.time() - chunkstart),
            #       file=sys.stderr, flush=True)


            for token in output.transcripts[0].tokens:
                if word == '':
                    word_times.append(cur_time + token.start_time)
                word += (str(token.text)).strip()
                if token.text == ' ':
                    words.append(word)
                    word = ''


            words.append(word)
            stamped_words = [{"word": w, "time": t} for w, t in zip(words, word_times)]
            out = {'result': stamped_words, 'index': segment_info.get('index')}
            if len(stamped_words) == 0:
                return
            self.WriteQueue.put(out)  # send the chunk result back to the master


def transcribe_file(audio_path, ds):

    audio, sample_rate, audio_length = wavSplit.read_wave(audio_path)
    segments = list(wavSplit.frame_generator(CHUNK_SIZE, audio, sample_rate))

    print("Beginning to process generated file chunks")
    inference_time = time.time()

    # make a set of queues for upstream and downstream communication
    WriteQueue = queue.Queue()
    ReadQueue = queue.Queue()
    workers = []

    for i in range(NUM_THREADS):
        x = ChunkWorker(WriteQueue, ReadQueue, ds) # all chunks get the same queues and inference model
        x.start()
        workers.append(x)


    print("Workers started...", file=sys.stderr, flush=True)
    for i, segment in enumerate(segments):
        print("Writing segment num {}".format(i), file=sys.stderr, flush=True)
        WriteQueue.put({'chunk': segment, 'index': i})


    print("All Chunks sent...", file=sys.stderr, flush=True)
    for i in range(NUM_THREADS):
        print("stopping worker {}".format(i), file=sys.stderr, flush=True)
        WriteQueue.put({"index" : -1})  # send a sentinel value to all threads


    for i in range(NUM_THREADS):
        workers[i].join()  # wait for all threads to join
        print(" worker {} has joined".format(i), file=sys.stderr, flush=True)



    processed_chunks = []
    for ele in list(ReadQueue.queue):
        print(ele, file=sys.stderr, flush=True)
        processed_chunks.append(ele)
    # each thread will send both the inference result
    # as well as the chunk id which is used to sort
    # the ReadQueue, allowing for asynchronous processing
    processed_chunks.sort(key=lambda p: p.get('index'))


    # because each chunk is processed discretely, each word will have a time
    # value within the range of zero and CHUNK_SIZE in seconds represented by a float value.
    # To accurately associate each word with its proper time within the media, and not within
    # the range described above, we need to add an offset to all tokens in each segment
    # - excluding the zeroth segment as it needs no adjustment.

    currentTime = 0.0 # the Nth time element of each adjusted chunk
    i = 0
    adjusted_tokens = []
    while i < len(processed_chunks) != 1: # no need to adjust the first chunk, the media was in the bounds of 0 and CHUNK_SIZE
        current_item = processed_chunks[i].get('result')
        if len(current_item) != 0: # if we get a chunk that has no speech within it, such as instrumental music, ignore it
            if i == 0:
                currentTime = current_item[len(current_item) - 1]['time'] # This is the end of the first chunk - used
                i = i + 1
                continue

            j = 0
            while j < len(current_item):
                current_word = current_item[j]
                current_word['time'] = current_word['time'] + currentTime
                j = j + 1
                adjusted_tokens.append(current_word)

            # take the last element of the current chunk to apply as an offset for the next chunk
            currentTime = adjusted_tokens[len(adjusted_tokens) - 1]['time']
            i = i + 1

    print("done with file; took{}".format(time.time() - inference_time), file=sys.stderr, flush=True)

    if len(processed_chunks) == 1:
        # only one chunk was processed and as such adjusted_tokens is empty
        return json.dumps(processed_chunks[0].get('result'))
    else:
        return json.dumps(adjusted_tokens)
