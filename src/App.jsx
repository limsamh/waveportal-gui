import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');

	/*
   * All state property to store all waves
   */
	const [allWaves, setAllWaves] = useState([]);
	// Sample contract address
	const contractAddress = '0x44F59A58717E9c1671E73dC607456ab5629acBb2';
	const contractABI = abi.abi;

	/*
   * Checks if wallet is connected
   */
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

	/*
   * Gets all waves from our contract
   */
	const getAllWaves = async () => {
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

				/*
         * Call the getAllWaves method from your Smart Contract
         */
				const waves = await wavePortalContract.getAllWaves();

				/*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
				let wavesCleaned = [];
				waves.forEach(wave => {
					wavesCleaned.push({
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message
					});
				});

				/*
         * Store our data in React State
         */
				setAllWaves(wavesCleaned);
			} else {
				console.log("Ethereum object doesn't exist!");
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

				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}

				{allWaves.map((wave, index) => {
					return (
						<div
							key={index}
							style={{
								backgroundColor: 'OldLace',
								marginTop: '16px',
								padding: '8px'
							}}
						>
							<div>Address: {wave.address}</div>
							<div>Time: {wave.timestamp.toString()}</div>
							<div>Message: {wave.message}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default App;
