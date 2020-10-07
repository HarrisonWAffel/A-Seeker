import React, {Component, useState} from 'react';

import Dropzone from 'react-dropzone'
import Cookies from "universal-cookie";
const cookies = new Cookies();
let hide = true;


class TranscriptionUploadButton extends React.Component {

    constructor(props) {
        super(props);
        this.flip = this.flip.bind(this);
        this.setMessage = this.setMessage.bind(this);
        this.setDetail = this.setDetail.bind(this);
        if(cookies.get("email") === "" || cookies.get("email") === undefined) {
            this.state = {
                hidden: false,
                message: "Please login to submit a transcription"
            };

        }else {
            this.state = {
                hidden: true,
                message: ""
            };
        }
    }

    flip() {
        if(cookies.get("email") === "" || cookies.get("email") === undefined) {
            this.setState({hidden:false})
            this.setMessage("Please login to submit a transcription")
            return
        }
        var cur = this.state.hidden;
        this.setState({hidden: !cur})
    }

    setMessage(message){
        this.setState({message: message})
    }

    setDetail(detail){
        this.setState({detail: detail})
    }

    render() {
        return (
            <div>

                 <Dropzone
                        onDropAccepted={acceptedFiles => {
                        //do upload post
                        var uploadBox = document.getElementById("exampleFormControlTextarea1");
                        const formData = new FormData();
                        formData.append('file', acceptedFiles[0]); //only one file at a time

                        var threadCountBox = document.getElementById("thread");

                        if(uploadBox.valueOf() !== '' && uploadBox.value !== '') {

                            this.setMessage("Starting Upload.");
                            this.setDetail("Please do not leave this screen until file upload is complete");
                            this.flip();
                            fetch("http://localhost:1177/deepSpeech/media/upload?email='"+cookies.get("email")+"'&filename='"+uploadBox.value+"&threads='"+threadCountBox.value+"'", {
                                method: 'POST',
                                body: formData
                            })
                                .then(response => {
                                    this.setMessage("Upload Accepted!");
                                    this.setDetail("Your file has begun processing, it will appear below when finished. Feel free to leave this page. ");
                                    response.text()
                                }).catch(error => {
                                    this.setMessage("Error Uploading File, Please Try Again (Sorry!)");
                                    this.setDetail("");
                                })
                        }else{
                            this.setMessage("Upload Rejected");
                            this.setDetail("Please enter a title");
                            this.flip()
                        }
                    }}>
                {({getRootProps, getInputProps}) => (
                    <section  >
                        <div {...getRootProps()}>
                            <input {...getInputProps()} type="file" />
                            <p> After entering a transcription title and dragging and dropping a file here, the file will begin processing. </p>
                        </div>
                    </section>
                )}
                 </Dropzone>

                <div hidden={this.state.hidden}>
                    <h3 >{this.state.message}</h3>
                    <p>{this.state.detail}</p>
                    <button onClick={this.flip}>Dismiss</button>
                </div>
            </div>
        );
    }
}
export default TranscriptionUploadButton;