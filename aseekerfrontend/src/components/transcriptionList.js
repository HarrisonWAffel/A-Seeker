import React, {Component} from 'react';
import TranscriptionUploadButton from "./transcriptionUploadButton";
import css from "./css/transcriptionList.css"
import {ListGroup, ListGroupItem} from "react-bootstrap";
import {withRouter} from 'react-router-dom';
import  Cookies  from 'universal-cookie';
import ModalContext from "react-bootstrap/cjs/ModalContext";
import Modal from './modal'
import  transcriptionUpload from "./css/transcriptionUploadCSS.css"
const cookies = new Cookies();
 
class TranscriptionList extends React.Component {

    constructor(props) {
        super(props);
        this.goToTranscription = this.goToTranscription.bind(this);
        this.state = {
            transcriptions: [],
            threadCount: 1
        }
    }

    componentWillMount() {
        //get the user email from the cookies
        var requestOptions = {
            method: 'GET',
            redirect: 'follow',
        };

        //call the middleware to get the requested transcription.
        fetch('http://localhost:1177/transcriptions/get/all?email='+cookies.get("email"),requestOptions )
            .then((response) => response.json())
            .then(transcriptionList => {
                this.setState({ transcriptions: transcriptionList });
            }).catch (err => {
                if(cookies.get("email") === ""){
                    alert("Please Register to submit media for transcriptions");
                }
                console.log(err)
            });
    }

    goToTranscription(title){
        // load the transcription view for this element
        this.props.history.push({
            pathname: "/transcription/view",
            state: {title : title}
        })
    }
    changeThreadNum(e){
        this.setState({threadCount: e.value})
    }
    render() {
        return (
            <div className={css.transcriptionList}>
                <div className="transcriptionUpload">
                    <div>
                        <textarea
                            className="form-control transcriptionUploadTitleInput textarea-left"
                            id="exampleFormControlTextarea1"
                            rows="1"
                            placeholder={"Enter Transcription Title Here "}
                            contentEditable={"true"}
                        />


                        <div className="textarea-right form-control" >
                            <label htmlFor="thread"> Select Thread Num </label>

                            <select id="thread" onChange={this.changeThreadNum}>
                                <optgroup label="Thread Count">
                                    <option value="1">One</option>
                                    <option value="2">Two</option>
                                    <option value="4">Four</option>
                                    <option value="8">Eight</option>
                                    <option value="16">Sixteen</option>
                                </optgroup>
                            </select>
                        </div>

                    <br/><br/>
                    <TranscriptionUploadButton/>
                </div>
            </div>
               <br/><br/>
                    <ul className="transcriptionList">
                        <ListGroup id="list-group-tabs-example">
                        {this.state.transcriptions.map((transcription) =>
                                <ListGroup.Item action onClick={() => this.goToTranscription(transcription.title)}>
                                    <div>
                                        <h4>{transcription.title}</h4>
                                        <br/>
                                        <h6>{transcription.contentFilePath}</h6>
                                    </div>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </ul>
            </div>
        );
    };
}

export default withRouter(TranscriptionList);