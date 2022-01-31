import React, {useEffect, useState} from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft  from './assets/mintNft.json';
import {ethers} from 'ethers';

// Constants
const TWITTER_HANDLE = 'LayerWired';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/assets/squarenft-2o4sptc9m3';
const TOTAL_MINT_COUNT = 50;

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [mintedNfts, setMintedNfts] = useState(0);
  const [currentlyMinting, setCurrentlyMinting] = useState(false);

  const CONTRACT_ADDRESS = "0x62ce607781b5Ebf5b95ac2101A558e1fbbdFc82C"

  const checkIfWalletIsConnected = async () => {
    
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      checkNetwork();
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }

  }

  const setupEventListener = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        let currentTotal = await connectedContract.getTotalNFTsMintedSoFar();
        setMintedNfts(currentTotal.toNumber());


        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setMintedNfts(tokenId.toNumber());
          alert(`Hey There! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 minutes to appear on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      checkNetwork()
    } catch (error) {console.log(error)};
  }

  const checkNetwork = async () => {
    let chainId = await ethereum.request({method: 'eth_chainId'});
      console.log("Connected to chain " + chainId);
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network");
      }
  }

  const askContractToMintNft = async () => {

    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setCurrentlyMinting(true);
        console.log("Mining...please wait.")
        await nftTxn.wait();
        setCurrentlyMinting(false);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }


  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const viewCollectionButton = () => (
    <a href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"><button className="cta-button connect-wallet-button">
      View Collection
    </button></a>
  );

  const renderMintUI = () => (
    <><p className="sub-text">
        {mintedNfts}/50 so far    </p>
        {currentlyMinting === true ? renderProgress(): 
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
    Mint Nft
    </button>}</>
  )

  const renderProgress = () => (
    <div className="progress">
      <div className="color"></div>
    </div>
  )

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p>{viewCollectionButton()}</p>
          {currentAccount === "" ?(renderNotConnectedContainer()) : renderMintUI()}
          
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;