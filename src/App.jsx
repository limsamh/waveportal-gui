import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');

  // Sample contract address
	const contractAddress = '0xd0A6954F29c6dfF58aBb8Bd93Dc3974Eea7170c8';
	const contractABI = abi.abi;

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				console.log('Make sure you have metamask!');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });
			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);
			} else {
				console.log('No authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * Connect to our wallet
	 */
	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const wave = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());

				/*
        * Execute the actual wave from the smart contract
        */
				const waveTxn = await wavePortalContract.wave();
				console.log('Mining...', waveTxn.hash);
        
				await waveTxn.wait();
				console.log('Mined -- ', waveTxn.hash);
        
				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	/*
  * Runs our function when the page loads.
  */
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>
				<div className="bio">
					I am Salim, connect your Ethereum wallet and wave at me!
				</div>
				<button className="waveButton" onClick={wave}>
					Wave at Me
				</button>
				{/*
        * If there is no currentAccount render this button
        */}
				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}
			</div>
		</div>
	);
};

export default App;
