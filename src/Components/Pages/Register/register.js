import React, { Component } from 'react';

import $ from 'jquery';

import './register.css'

class Register extends Component {
	constructor(props) {
		super(props)
		this.complainContract = props.contractObject
		this.web3 = props.web3Obj
		console.log('Class: Register')
		console.log(this.complainContract)

		this.formPreventDefault = this.formPreventDefault.bind(this);
		this.updateUser = this.updateUser.bind(this);
    	this.register = this.register.bind(this);

    	this.state = {
    		notify: '',
    		notiClass: 'success'
    	}

    	this.accounts = []

		this.getAccounts()

		this.selectUser = 0;

	}

	getAccounts() {
    	var context = this
    	this.web3.eth.getAccounts().then(function(res) {
    		context.accounts = res
    		console.log(context.accounts)
    	})
    }

	formPreventDefault(e) {
	    alert('here');  
		e.preventDefault();
	}
	  
	register(e) {

		var latdata = 0, longdata = 0
        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                console.log("Geolocation is not supported by this browser.");
            }
        }
        function showPosition(position) {
            latdata = parseInt(position.coords.latitude * 1e12)
            longdata = parseInt(position.coords.longitude * 1e12) 
        }

        getLocation()


		e.preventDefault();

		var data = []
        data.push($('#input-name').val().replace(new RegExp(',', 'g'), '#'))
        data.push($('#input-address').val().replace(new RegExp(',', 'g'), '#'))
        data.push($('#input-desc').val().replace(new RegExp(',', 'g'), '#'))
        console.log(data)
        data = data.toString().replace(new RegExp(',', 'g'), '?').replace(new RegExp('#', 'g'), ',');
        console.log(data)

        var catdata = $('#type').val()

        var reward = parseInt($('#input-reward').val()) * 1e9

        /*let objJsonStr = JSON.stringify(data);
        let objJsonB64 = new Buffer(objJsonStr).toString("base64");*/

        var part = btoa(data)

        var context = this

		this.complainContract.methods.registerComplain(part, longdata, latdata, catdata).send({from: this.accounts[this.selectUser], value: reward})
		.then(function(response) {
            context.complainContract.methods.registerComplain(part, longdata, latdata, catdata).call().then(function(cid) {
                console.log('CID: ' + cid)
                context.setState({notify: 'Complain Registered.', notiClass: 'success'})
                //$('#notify').html("Complain Registered with ID: " + cid)
            });
            
            console.log(response)
            console.log('End of Response')
        }).catch(function(err) {
        	context.setState({notify: 'Error: Complain not Registered.', notiClass: 'danger'})
            console.log('Error: Message: ' + err.message);
        });

		
	}

	/*componentWillMount() {


		

		console.log(this.complainContract)

		
	}*/

	

	updateUser(e) {
		this.selectUser = e.target.value

		this.setState({gg: 'some'})

		/*if(this.selectUser == 0) {

			this.setState({secondBtn: 'invisible', isSuperUser: 'visible',isCitizen: 'invisible', classFirst: 'glyphicon glyphicon-plus', classSecond: 'hidden', tipFirst: 'Assign new Police accounts', tipSecond: 'Empty'}, function() {
	    		this.setState({table: this.renderTable()})
	    	})
		}
		else if(this.selectUser == 1) {
			this.setState({secondBtn: 'visible', isSuperUser: 'invisible',isCitizen: 'invisible', classFirst: 'glyphicon glyphicon-arrow-up', classSecond: 'glyphicon glyphicon-arrow-down', tipFirst: 'Upgrade complain status', tipSecond: 'Downgrade complain status'}, function() {
	    		this.setState({table: this.renderTable()})
	    	})
		}
		else if(this.selectUser == 2 || this.selectUser == 3) {
			this.setState({secondBtn: 'visible', isSuperUser: 'invisible',isCitizen: 'visible', classFirst: 'glyphicon glyphicon-flash', classSecond: 'glyphicon glyphicon-send', tipFirst: 'Fund a complain', tipSecond: 'Report a Solution'}, function() {
	    		this.setState({table: this.renderTable()})
	    	})
		}*/

    	
    	//console.log(this.state.classFirst)
	}

	render() {
		return (
			<div id="register-class">
				<p>Select a User to perform the following action.</p>
				<select className="form-control" onChange={this.updateUser}>
					<option value="0">Super User</option>
					<option value="1">Police</option>
					<option value="2">Citizen 1</option>
					<option value="3">Citizen 2</option>
				</select>
				<h4><span className="label label-default">Account No: {this.accounts[this.selectUser]}</span></h4>
				<br/>
				<hr/>
				<br/>
				<p>
					To register a complain please fill the following form.
				</p>
				<form className="form-horizontal" onSubmit={this.formPreventDefault}>
					<div className="form-group">
						<label htmlFor="input-name" className="col-sm-2 control-label">Name: </label>
						<div className="col-sm-10">
							<input type="name" className="form-control" id="input-name" placeholder="Your Name" />
						</div>
					</div>
					<div className="form-group">
						<label htmlFor="input-address" className="col-sm-2 control-label">Address: </label>
						<div className="col-sm-10">
							<input type="name" className="form-control" id="input-address" placeholder="Address" />
						</div>
					</div>
					<div className="form-group">
						<label htmlFor="input-reward" className="col-sm-2 control-label">Reward: </label>
						<div className="col-sm-10">
							<input type="name" className="form-control" id="input-reward" placeholder="Reward in &#8377;"/>
						</div>
					</div>
					<div className="form-group">
						<label htmlFor="input-desc" className="col-sm-2 control-label">Description: </label>
						<div className="col-sm-10">
							<textarea className="form-control" rows="3" id="input-desc" placeholder="Description"></textarea>
						</div>
					</div>
					<div className="form-group">
						<label htmlFor="input-desc" className="col-sm-2 control-label">Type of Offence: </label>
						<div className="col-sm-10">
							<select className="form-control" id="type">
								<option value="0">Lost</option>
								<option value="1">Theft</option>
							</select>
						</div>
					</div>
					<div className="form-group">
						<div className="col-sm-offset-2 col-sm-10">
							<button type="submit" className="btn btn-default btn-block" id="complain-submit" onClick={this.register}>Submit</button>
						</div>
					</div>
					<div className={"notify alert alert-"+this.state.notiClass}>
						{this.state.notify}
					</div>
				</form>
			</div>
		);
	}
}

	export default Register;

