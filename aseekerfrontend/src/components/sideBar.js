import React, {Component} from 'react';
import { Route, Link, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import "./css/sideStyle.css"
import Cookies from 'universal-cookie'
const cookies = new Cookies();


class SideBar extends Component {

    constructor() {
        super();
        this.state = {
            pending: "",
            numTranscriptions: ""
        }


    }

    componentDidMount() {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow',
        };
        this.updatePending()
        setInterval(() => {this.updatePending()}, 30000);

        if (this.loggedin()) {
            fetch('http://localhost:1177/transcriptions/count?email=' + cookies.get("email"), requestOptions)
                .then((response) => response.text())
                .then(response => {
                    if (response === "") {
                        this.setState({numTranscriptions: ""})
                    } else {
                        this.setState({numTranscriptions: response})
                    }
                }).catch(err => {

            });
        }
    }


    loggedin(){
        return !(cookies.get("email") !== undefined || cookies.get("email") !== "");
    }


    updatePending(){
        var requestOptions = {
            method: 'GET',
            redirect: 'follow',
        };

        fetch('http://localhost:1177/transcriptions/get/pending', requestOptions)
            .then((response) => response.text())
            .then(response => {
                if (response === ""){
                    var pending = "No Transcriptions Being Processed Currently";
                    this.setState({pending: pending})
                }else{
                    this.setState({pending: response})
                }
            }).catch(err =>{

            var pending = "No Transcriptions Being Processed Currently";
            this.setState({pending: pending})
        });
    }


    getuser(){
        var u = cookies.get("email");
        if (u === undefined){
            return <br/>
        }else{
            return (
                <div className="userinfo">
                    <br/>
                    <h4>{cookies.get("email")}</h4>
                    <div>{this.state.numTranscriptions}</div>
                    <br/><br/><br/><br/>
                    <hr/>
                    <p>Transcriptions Being Processed</p>
                    <hr/>
                    <p>{this.state.pending}</p>
                </div>);
        }
    }



    render() {
        return (
            <div>
               <div className="App-Sidebar">
                   <div>
                       <h1>A-Seeker</h1>
                   </div>
                   <nav>
                       <ul>
                           <li>
                               <p><NavLink to = "/">Home</NavLink></p>
                           </li>
                           <li>
                               <p><NavLink to = "/transcriptions">Transcriptions</NavLink></p>
                           </li>
                           <li>
                               <p><NavLink to = "/account">Account</NavLink></p>
                           </li>
                       </ul>
                   </nav>
                   {this.getuser()}
               </div>
             </div>
        );
    }
}

export default SideBar;