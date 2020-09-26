import React, {Component} from 'react';
import { Route, Link, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import NotFound from "./404Component";
import "./css/sideStyle.css"
import Cookies from 'universal-cookie'
const cookies = new Cookies();

class SideBar extends Component {

    getuser(){
        var u = cookies.get("email");
        if (u === undefined){
            return <br/>
        }else{
            return (<div className="userinfo">

                        <p> -> {cookies.get("email")}</p>


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
               </div>
                {this.getuser()}
             </div>
        );
    }
}

export default SideBar;