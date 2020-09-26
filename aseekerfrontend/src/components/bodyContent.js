import React from 'react';
import './css/App.css';
import './css/bodyContent.css'
function bodyContent() {
  return (
    <div className="bodyContent">
        {/*Page specific content*/}
        <div className="quickStart">
            <div className="quickStartLeft">
                <h2> What is A-Seeker?</h2>
                <p>
                    A-Seeker is a media processing and transcription service, utilizing automatic speech recognition and audio processing tools to efficiently transcribe almost any audio, or audio video file.
                </p>
            </div>

            <div className="quickStartRight">
                <h2>Let's Get Started: </h2>
                <p>
                    To get started with A-Seeker, first you should go to the <a href="/signup">Sign Up</a> page to register an account. Afterwards you can go to the <a href="/transcriptions">Transcriptions page</a>, enter an upload title into the text box and select a file, the rest will be taken care of for you!
                </p>
            </div>
        </div>
        <div className="summary">
            <h2>Why was A-Seeker Made?</h2>
            <p>
                In this digital age, especially during the current
                global pandemic, consumers are overwhelmed with online audio-video content that is produced and distributed at lightning speed.
                Even though the content is available and accessible, it takes
                significant time to look for a piece of information needed, resulting
                in lots of frustration and wasted time. A-Seeker, short for Audio
                Seeker, is a solution to this problem.
            </p>
        </div>
    </div>
  );
}

export default bodyContent;
