import React, {Component} from 'react';
import { Route, Link, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import Cookies from 'universal-cookie'
const cookies = new Cookies();

class Navbar extends Component {
    onClick= (event) => {
      //remove email cookie
        cookies.remove("email");
    };


    isLoggedin() {
        if (cookies.get("email") === undefined) {
            return (<div>
                        <Link className="padding" to="/login">Log In</Link>
                        <Link className="padding" to="/register">Sign Up</Link>
                    </div>);
        }else{
            return <a className="padding" href="/" onClick={this.onClick}>Log Out</a>
        }
    }

     render() {
         return (
             <header className="App-header">
                 <div>
                     {this.isLoggedin()}
                 </div>
             </header>

         );
     }
  }


export default Navbar;