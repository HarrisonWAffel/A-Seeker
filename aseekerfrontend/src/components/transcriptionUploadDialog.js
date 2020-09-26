import React, {Component, useState} from 'react';


import Cookies from "universal-cookie";
import TranscriptionUploadButton from "./transcriptionUploadButton";


const cookies = new Cookies();

export default class transcriptionUploadDialog extends React.Component {
    render() {
        return(
            <div>
                <div>
                        <textarea
                            className="form-control transcriptionUploadTitleInput"
                            id="exampleFormControlTextarea1"
                            rows="1"
                            placeholder={"Enter Transcription Title Here "}
                            contentEditable={"true"}
                        />
                    <br/>
                    <TranscriptionUploadButton/>
                </div>
            </div>
        );
    }

}

