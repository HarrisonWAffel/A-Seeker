import React, {Component} from 'react';
import './css/bodyContent.css'
import './css/bootstrap.css';


class Register extends Component {

    constructor(props) {
        super(props);
        this.state = { email: '' , password: ''};
    }

    mySubmitHandler = (event) => {
        event.preventDefault();

        var requestOptions = {
                    method: 'POST',
                    redirect: 'follow'
                };
                const data = new FormData(event.email);
                console.log(data);
                console.log("http://localhost:1177/udserauth/register/new?email="+this.state.email +"&password="+this.state.password);
                fetch("http://localhost:1177/userauth/register/new?email="+this.state.email +"&password="+this.state.password, requestOptions)
                    .then(response => response.text())
                    .then(result => function(){
                        console.log(result);
                        console.log(result.status);

                    })
                    .catch(error => console.log('error', error));

    };


    emailChangeHandler = (event) => {
      this.setState({email: event.target.value})
    };


    passwordChangeHandler = (event) => {
        this.setState({password: event.target.value})
    };


    render() {
        return (
            <div>
                <h3>Sign In</h3>

                <form onSubmit={this.mySubmitHandler}  className="form-group">

                    <label>Email address</label>
                    <input type="email" className="form-control" placeholder="Enter email" onChange={this.emailChangeHandler}/>



                    <label>Password</label>
                    <input type="password" className="form-control" placeholder="Enter password" onChange={this.passwordChangeHandler}/>


                    <label>Password</label>
                    <input type="password" className="form-control" placeholder="Confirm password" onChange={this.passwordChangeHandler}/>

        <div className="form-row">
                <button type="submit" className="btn btn-primary btn-block">Register</button>
        </div>
                </form>
            </div>
        );
    }
}

export default Register;