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

from DeepSpeech.native_client.python import Model
import json
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import logging

logging.getLogger('sox').setLevel(logging.ERROR)
import numpy as np

from DeepSpeech.training.deepspeech_training.util.config import initialize_globals

import wavTranscriber
import queue

init = False


def init():
    initialize_globals()


def fail(message, code=1):
    from DeepSpeech.training.deepspeech_training.util.logging import log_error
    log_error(message)
    sys.exit(code)

def chunkChecker(segment, index):

    print("------------>{}<------------\n\n\n\n\n\n\n\n\n".format(segment), file=sys.stderr, flush=True)
    return index

global output

# most cpu's are quad cores nowadays, but powers of 2 are always nice
NUM_THREADS = 4


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

            self.WriteQueue.put(out)  # send the chunk result back to the master


def transcribe_file(audio_path, ds):

    # break audio up into chunks to be processed
    print("Chunking file...", file=sys.stderr, flush=True)
    segments = wavTranscriber.vad_segment_generator(audio_path, 3)
    print("Beginning to process generated file chunks")


    inference_time = time.time()


    # make a set of queues for upstream and downstream communication
    WriteQueue = queue.Queue()
    ReadQueue = queue.Queue()
    workers = []

    for i in range(NUM_THREADS):
        x = ChunkWorker(WriteQueue, ReadQueue, ds)
        x.start()
        workers.append(x)  # the queue is used for audio chunks, the other two can be appended to in a thread safe manner

    print("Workers started...", file=sys.stderr, flush=True)

    for i, segment in enumerate(segments):
        print("Writing segment num {}".format(i), file=sys.stderr, flush=True)
        WriteQueue.put({'chunk': segment, 'index': i})

    print("All Chunks sent...", file=sys.stderr, flush=True)

    for i in range(NUM_THREADS):
        print("stopping worker {}".format(i), file=sys.stderr, flush=True)
        WriteQueue.put({"index" : -1})  # send a sentinel to all threads

    for i in range(NUM_THREADS):
        workers[i].join()  # wait for all threads
        print(" worker {} has joined".format(i), file=sys.stderr, flush=True)

    processed_chunks = []

    #apply an offset to every n+1 elements

    for ele in list(ReadQueue.queue):
        print(ele, file=sys.stderr, flush=True)
        processed_chunks.append(ele)

    processed_chunks.sort(key=lambda p: p.get('index'))



    curtime = 0.0
    i = 0
    new = []
    while i < len(processed_chunks):
        curitem = processed_chunks[i].get('result')
        if i == 0:
            curtime = curitem[len(curitem) - 1]['time']
            i = i + 1
            continue

        j = 0
        while j < len(curitem):
            curword = curitem[j]
            curword['time'] = curword['time'] + curtime
            j = j + 1
            new.append(curword)
        curtime = new[len(new) - 1]['time']
        i = i + 1

    print("done with file; took{}".format(time.time() - inference_time))

    print("\n\n\n\n\n\n\n\n {} \n\n\n\n\n\n\n\n\n\n".format(new), file=sys.stderr, flush=True)

    return json.dumps(new)
