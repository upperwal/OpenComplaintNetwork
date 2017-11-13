import React, { Component } from 'react';

import './accounts.css'

class Accounts extends Component {

	constructor(props) {
		super(props)
		this.complainContract = props.contractObject
		this.web3 = props.web3Obj

		this.state = {
			table: ''
		}

		this.globalPromise = []
		this.accounts = []
		this.balances = []
	}

	componentWillMount() {
		this.getAllAccounts()
		console.log('Got Accounts')
		this.getBalances()

	}
	getAllAccounts() {
		var context = this
    	this.web3.eth.getAccounts().then(function(res) {
    		context.accounts = res
    		console.log(context.accounts)
    	})
	}

	getBalances() {
		console.log('Inside')
		console.log(this.accounts)
		var context = this
		new Promise(function(resolve, reject) {
			var pro = []
			for(var i = 0; i<context.accounts.length; i++) {
				pro.push(context.web3.eth.getBalance(context.accounts[i]))
			}
			for(var i = 0; i<context.accounts.length; i++) {
				pro[i].then(function(res) {
					console.log(res)
					this.balances.push(res)
				})
			}
			Promise.all(pro).then((e) => {resolve(e)}).catch((e) => {reject(e)})
		}).then(console.log)
	}



	render() {
		return(

			<div className="accounts-class">
				<div className="panel panel-default">
					<div className="panel-heading">All accounts currently in your wallet</div>
					<table className="table" id="table-data"> 
						<thead> 
							<tr> 
								<th>#</th> 
								<th>Name</th> 
								<th>Location</th> 
								<th>Description</th>
								<th>Type</th> 
								<th>Reward</th> 
								<th>Status</th> 
								<th>Action</th>
							</tr> 
						</thead>

							{this.state.table}




					</table> 
				</div>
			</div>

			);
	}

}

export default Accounts