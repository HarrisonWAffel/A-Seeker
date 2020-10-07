import React, {Component} from 'react';
import './css/bootstrap.css'
import './css/bodyContent.css'
import Cookies from 'universal-cookie'
import './css/transcriptionView.css'
import './css/transcriptionTextWindow.css'
import {Button, ButtonGroup, ToggleButton} from "react-bootstrap";

const cookies = new Cookies();

var id

class TranscriptionView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            title: this.props.location.state.title,
            tokens: [],
            filter_tokens: [],
            search: null,
            body: []
        };
        this.extract_words = this.extract_words.bind(this);
        id =   setInterval(() => {this.getBody()}, 750);
    }


    componentDidMount() {

        var requestOptions = {
            method: 'GET',
            redirect: 'follow',
        };

        fetch('http://localhost:1177/transcriptions/get/single?email=' + cookies.get("email") + "&title="+this.state.title, requestOptions)
            .then((response) => response.json())
            .then(response => {
                this.setState({
                    transcription: this.extract_words(response.fulTranscription).join(' '),
                    times: this.extract_times(response.fulTranscription),
                    tokens: response.fulTranscription
                });
                console.log(response)
            }).catch(err => {
            if (cookies.get("email") === undefined) {
                alert("Please Login To submit media files for transcriptions");
            }
        });
        var video = document.getElementById("video");

        fetch('http://localhost:1177/deepSpeech/media/get?filename='+this.state.title, requestOptions)
            .then(response => response.blob())
            .then( blob => {
                video.src = window.URL.createObjectURL(blob);
            });
    }

    componentWillUnmount() {
        clearInterval(id)
    }

    extract_words(api_response) {
        const words = []
        for(var i=0; i<api_response.length; i++){
            words.push(api_response[i].word.valueOf(String))
        }
        return words
    }

    extract_times(api_response) {
        const times = []
        for(var i=0; i<api_response.length; i++){
            times.push(api_response[i].time)
        }
        return times
    }

    searchList=(event)=>{
        let keyword = event.target.value;
        this.setState({search:keyword})
    };


    enableEditing(t_title, token_list) {
        this.props.history.push({
            pathname: "/transcription/edit",
            state: {
                title: t_title,
                tokens : token_list,
                email: this.state.email,
            }
        })
    }


    getBody(){
        var video = document.getElementById("video");
        var tick = false
        var e = this.state.tokens.map((transcription) => {
                if ((transcription.time).toFixed() === (video.currentTime).toFixed()) {
                    return (
                        <b>
                            <p onClick={function () {
                                //manipulate the media player to the time
                                video.currentTime = transcription.time;
                            }}>{transcription.word}</p>
                        </b>
                    );
                } else {
                    return (<p onClick={function () {
                        //manipulate the media player to the time
                        video.currentTime = transcription.time;


                    }}>{transcription.word}</p>);
                }
            }
        );
        this.setState({body: e})
    }

    getResults() {
        var found = [];
        let k = 0;
        for (var i = 0; i < this.state.tokens.length; i++) {
            if (this.state.search !== null) {
                if (this.state.search.length > 1) {
                    if (this.state.tokens[i].word.toLowerCase().includes(this.state.search.toLowerCase())) {


                        // //get the words of surrounding tokens to provide a textual context to the search result

                        // //get the 5 words prior and after the found search result
                        var firstTenWords = "";
                        for(let j = i-10; j < i; j++){
                            if(this.state.tokens[i] !== undefined && this.state.tokens[j] !== undefined) {
                                firstTenWords += this.state.tokens[j].word + " "
                            }
                        }

                        var nextTenWords = "";
                        if( i < this.state.tokens.length - 1){
                            for(let j = i; j < i+10; j++){
                                // console.log(j)
                                if(this.state.tokens[i] !== undefined && this.state.tokens[j] !== undefined) {
                                    // console.log(this.state.tokens[j].word);
                                    nextTenWords += this.state.tokens[j].word + " ";
                                }
                            }
                        }


                        let fin = firstTenWords.concat(nextTenWords);
                        found[k] = {
                          word: fin,
                          time: this.state.tokens[i].time
                        };
                        k++;
                    }
                }
            }
        }


        var elements = [];
        if(found.length === 0){
            return (
            <li>
                <span></span>
                <span></span>
            </li>
            );
        }

        if (found.length > 0) {
            for (i = 0; i < found.length; i++) {
                if(found[i] !== undefined) {
                    console.log(found[i].time);
                    let curtime = found[i].time;
                    elements[i] = (
                        <li onClick={()=>{
                            var video = document.getElementById("video");
                            //manipulate the media player to the time
                            video.currentTime = curtime; //take 750ms off so that we can actually hear the search result
                        }}>
                            <p>{found[i].word}</p>
                            <p>({found[i].time})</p>
                        </li>);
                }
            }
        }
        return elements;
    }


    deleteTranscription(){


    }

    render(){
        return (
            <div className="transcriptionView">
                <div className="buttons">
                    <h4 className="title"> {this.state.title} </h4>
                    <br/>
                    <Button variant="primary" size="sm" onClick={() =>
                        this.enableEditing(this.state.title, this.state.tokens)}
                    >Edit</Button>

                    <Button variant="danger" size="sm" onClick={() => {

                         var requestOptions = {
                            method: 'DELETE',
                            redirect: 'follow',
                        };

                        fetch('http://localhost:1177/transcriptions/delete?email=' + cookies.get("email") + "&title="+this.state.title, requestOptions)
                            .then((response) => response.json())
                            .then(response => {
                                alert("You will now be redirected to the transcription list");
                                this.props.history.push({
                                    pathname: "/transcriptions",
                                    state: {
                                        email: this.state.email,
                                    }
                                })
                            }).catch(err => {
                            alert(err.toString())
                        });}}>
                        Delete</Button>

                </div>

                <hr/>
                <br/>
                <div className="mediaAndSearch">
                    <video
                        id="video"
                        controls
                    />

                    <div className="search-bar">
                        <input type="text" placeholder="Search Transcription..." onChange={(e)=>this.searchList(e)}/>
                        <ul>
                            {this.getResults()}
                        </ul>
                    </div>

                </div>
                <div className="main-transcription">
                    {this.state.body}
                </div>
            </div>
        );
    }
}

export default TranscriptionView;
