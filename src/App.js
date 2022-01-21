import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
      NAME: "Rinkeby Test Network",
      SYMBOL: "ETH",
      ID: 4,
    },
    NFT_NAME: "Larv6",
    SYMBOL: "T6",
    MAX_SUPPLY: 100,
    WEI_COST: 22000000000000000,
    DISPLAY_COST: 0.022,
    GAS_LIMIT: 285000,
    MARKETPLACE: "Opeansea",
    MARKETPLACE_LINK: "https://testnets.opensea.io/collection/larv4",
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
      <div className="title">{data.totalSupply} / {CONFIG.MAX_SUPPLY}</div>
      <div className="contract-address"><a target="_blank" href={CONFIG.SCAN_LINK}>{truncate(CONFIG.CONTRACT_ADDRESS, 15)}</a></div>

      <div className="buttons">
        <button className="roadmap" onClick={(e) => {
          window.open("/config/roadmap.pdf", "_blank");
        }}>Roadmap</button>

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
                window.open('https://discord.gg/pwqNhFsz')
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
        </div>
      </div>

    </div>
  );
}

export default App;
