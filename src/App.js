import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Image1 from './images/Web_01-01.png'
import Image2 from './images/Web_02-01.png'
import Image3 from './images/Web_03-01.png'
import Image4 from './images/Web_04-01.png'
import Image5 from './images/Web_05-01.png'
import Image6 from './images/Web_06-01.png'
import Image7 from './images/Web_07-01.png'
import Image8 from './images/Web_08-01.png'
import Image9 from './images/Web_09-01.png'

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "0x2b0290A07fE4bD8096Ad89136d25d2d0d4A709D1",
    SCAN_LINK: "https://rinkeby.etherscan.io/address/0x2b0290a07fe4bd8096ad89136d25d2d0d4a709d1",
    NETWORK: {
      NAME: "Ethereum mainnet",
      SYMBOL: "ETH",
      ID: 1,
    },
    NFT_NAME: "Larva Sads",
    SYMBOL: "LARS",
    MAX_SUPPLY: 5000,
    WEI_COST: 15000000000000000,
    DISPLAY_COST: 0.015,
    GAS_LIMIT: 285000,
    MARKETPLACE: "Opeansea",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);

    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <div className="app-container">

      <div className="site-title">
        <h1>
          Larva Sads
        </h1>
      </div>
      <div className="images">

        <img src={Image1} alt="image" />
        <img src={Image2} alt="image" />
        <img src={Image3} alt="image" />
        <img src={Image4} alt="image" />
        <img src={Image5} alt="image" />
        <img src={Image6} alt="image" />
        <img src={Image7} alt="image" />
        <img src={Image8} alt="image" />
        <img src={Image9} alt="image" />

      </div>


      <div className="blockchain-data">

        <div className="title">{data.totalSupply} / {CONFIG.MAX_SUPPLY}</div>
        <div className="contract-address"><a target="_blank" href={CONFIG.SCAN_LINK}>{truncate(CONFIG.CONTRACT_ADDRESS, 15)}</a></div>

        <div className="buttons">
          {/* <button className="roadmap" onClick={(e) => {
            window.open("/config/roadmap.pdf", "_blank");
          }}>Roadmap</button> */}

          <button className="marketplace" onClick={(e) => {
            window.open(CONFIG.MARKETPLACE_LINK, "_blank");
          }}>{CONFIG.MARKETPLACE}</button>
        </div>

        {
          Number(data.totalSupply) >= CONFIG.MAX_SUPPLY
            ?
            (
              <div>
                <p>The sale has ended.</p>
                <p>You can still find {CONFIG.NFT_NAME} on</p>
                <a target="_blank" href={CONFIG.MARKETPLACE_LINK}>{CONFIG.MARKETPLACE}</a>
              </div>
            )
            :
            (
              <div>
                <p>1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}{CONFIG.NETWORK.SYMBOL}.</p>
                <p>Excluding gas fees.</p>

                {
                  blockchain.account === "" || blockchain.smartContract === null ?
                    (
                      <div className="connect">
                        <p>Connect to the {CONFIG.NETWORK.NAME} network</p>
                        <button onClick={(e) => {
                          e.preventDefault();
                          dispatch(connect());
                          getData();
                        }}>Connect</button>

                        {blockchain.errorMsg !== "" ? (<p className="error-message">{blockchain.errorMsg}</p>) : null}
                      </div>
                    )
                    :
                    (
                      <div className="feedback">
                        <p>{feedback}</p>

                        <div className="mint-amount">
                          <button onClick={(e) => {
                            e.preventDefault();
                            decrementMintAmount();
                          }}>-</button>

                          <p>{mintAmount}</p>

                          <button onClick={(e) => {
                            e.preventDefault();
                            incrementMintAmount();
                          }}>+</button>
                        </div>

                        <button disabled={claimingNft ? 1 : 0} onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}>
                          {claimingNft ? "BUSY" : "BUY"}
                        </button>
                      </div>
                    )
                }
              </div>
            )
        }

        <div className="socials">
          <p>Find us on our socials</p>

          <div className="links">
            <div className="link">
              <FontAwesomeIcon
                onClick={(e) => {
                  e.preventDefault;
                  window.open('https://discord.gg/rhGMp5AeAZ')
                }}
                icon={["fab", "discord"]}
              />
            </div>
            <div className="link">
              <FontAwesomeIcon
                onClick={(e) => {
                  e.preventDefault;
                  window.open('https://twitter.com/LarvaSads')
                }}
                icon={["fab", "twitter"]}
              />
            </div>
            <div className="link opensea">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 408.62 369.81"
                onClick={(e) => {
                  e.preventDefault;
                  window.open(CONFIG.MARKETPLACE_LINK)
                }}>
                <defs>
                  <style></style>
                </defs>
                <g id="Layer_2" data-name="Layer 2">
                  <g id="Layer_1-2" data-name="Layer 1">
                    <path class="cls-1" d="M132.18,27.39c18.45,3.82,35,9.29,52.65,13.81,0-8.5.18-16.42-.05-24.33-.26-9.07,5.71-12.79,12.83-15.63,6-2.4,11.35-1.28,16.35,3C219.6,9,222,15,221.83,22.27c-.17,8.62.06,17.24-.1,25.87,0,2.5,1.27,2.94,3,4.27,7.84,5.92,15.94,11.58,22.81,18.74,6.61,6.89,13.56,13.45,20.21,20.3a169.41,169.41,0,0,1,31.5,45.16c2.94,6.16,5.7,12.63,5.74,19.82,0,2.86,1.88,5.34,1.9,8.47.11,16.29-5.07,30.86-14.09,44.09-6.34,9.27-12.77,18.47-20.63,26.7-4.08,4.28-7.79,9.09-12,13.41-5.16,5.33-10.8,9-18.89,8.09-6.33-.7-12.79-.14-19.36-.14v37c13.83,0,27.64.65,41.35-.28a28.28,28.28,0,0,0,17.75-8.2c5.47-5.42,11.43-10.46,16.2-16.44,5-6.35,12.23-7.87,19-10,3.81-1.17,7.64-2.53,11.49-3.48,12-3,23.63-7.16,35.72-9.79,7-1.51,13.72-4,20.57-6.05,5.48-1.65,10.95-3.32,16.44-4.93,2.2-.64,4.44-1.15,7.32-1.88,1.47,8.92,0,18,.74,26.78-8.3,4.58-16.83,7.92-24.52,13.1-8.93,6-15.89,13.7-21.74,22.37-8.4,12.44-15.53,25.76-24.29,37.92-9.2,12.76-19.14,25.19-34.45,31.5-2.63,1.08-5.17,2.58-7.9,3.19a61.93,61.93,0,0,1-13.07,1.85q-85.47.18-170.94,0c-6.21,0-12.42-1.19-18.64-1.75S81.45,364,75.2,364.25c-6-4.55-14.41-4.46-19.8-10.21-12.11-5.34-20.87-14.89-29.63-24.25-8.17-8.73-13.88-19.3-18.06-30.35-1.57-4.13-5.58-7.93-4-13.13-3.8-3.34.1-9-3.7-12.33V253.59H101.65a72.28,72.28,0,0,0,0,7.92c1.13,10.41,4.73,19.08,13.93,25.64a35.55,35.55,0,0,0,22.18,6.91c15.39-.16,30.78-.05,46.59-.05v-37H143a51.53,51.53,0,0,1-6.46-.05c-2.89-.38-3.85-3.41-2.14-5.9,6-8.83,12.22-17.53,17.27-27,3.21-6.06,6.57-12,9.64-18.18,4.09-8.21,7.12-16.82,10.11-25.38,1.9-5.45,2.24-11.67,2.16-17.53s1.94-12.06-1.55-17.79c-.68-1.12-.39-3.06-.08-4.53,1-4.94-1.53-9.32-1.93-14-.37-4.33-2.47-8.34-3.14-12.5C165.06,103,160,92.88,157,82.13a94,94,0,0,0-5.51-14.34C145.49,54.88,139.23,42.07,132.18,27.39Z" />
                    <path class="cls-1" d="M115.63,70.06c6.11,16.3,12.05,30.5,16.65,45.12,2,6.51,3.21,13.53,4.8,20.25,2.49,10.6,1,21.1,1.45,31.62.25,5.87-2.55,11.19-4.94,16.37C130,191.18,125.9,198.7,122,206.3c-1.31,2.54-2.72,5-4.3,7.92H23.94c.15-1.74-.23-3.52.48-4.56,10.63-15.51,20.39-31.58,30.47-47.43,5.86-9.22,11.62-18.56,17.51-27.72,7.19-11.2,14.1-22.61,21.7-33.57,5.26-7.58,9.91-15.58,15-23.3C110.51,75.49,112.46,73.7,115.63,70.06Z" />
                  </g>
                </g>
              </svg>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
