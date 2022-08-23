import { useEffect, useState } from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DepositModal from "../components/Modal/DepositModal";
import EthIcon from "../images/cartesi_icon.png";
import logo from '../images/Cartesi_Logo_White.svg';
import LogoutIcon from "../images/logout-icon.svg";
import { clearAccount, getDepositInfo } from "../reducers/authSlice";
import { ROUTER_PATH } from "../routes/contants";
import { AppDispatch, RootState } from "../store";
import { Address, Content, Currency, Deposit, DepositContent, InforUser, Menu } from "../styled/header";
import { Tooltip } from "../styled/list";
import { Loader } from "../styled/loading";
import { formatAddress } from "../utils/common";

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>()
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isCopied, setIsCopied] = useState<boolean>(false)
    const authState = useSelector((state: RootState) => state.auth)
    const { address, deposit_info, isLoading } = authState
    const { amount, used_amount } = deposit_info

    useEffect(() => {
        // Get deposit info. But Version 0.5 does not allow calling multiple API at the same time, delaying the call by 1.5s
        setTimeout(() => {
            dispatch(getDepositInfo())
        }, 1500)
    }, [])

    const handleLogout = async () => {
        dispatch(clearAccount())
        navigate(ROUTER_PATH.LOGIN, { replace: true })
        window.location.reload();
    }

    useEffect(() => {
        if (!window.ethereum) return;

        window.ethereum.on("accountsChanged", handleLogout);
        window.ethereum.on("disconnect", handleLogout);
        window.ethereum.on("chainChanged", () => {
            window.location.reload();
        });
        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener("accountsChanged", handleLogout);
                // window.ethereum.removeListener("chainChanged", handleLogout);
                window.ethereum.removeListener("disconnect", handleLogout);
            }
        };
    }, [window.ethereum]);

    const toggleModal = () => {
        setIsVisible(!isVisible);
    }

    const handleCopy = () => {
        setIsCopied(true)
        setTimeout(() => {
            setIsCopied(false)
        }, 1000)
    }

    return (
        <>
            <Content>
                <img src={logo} alt="logo" width={110} onClick={() => navigate(ROUTER_PATH.HOMEPAGE)} />
                <Menu>
                    <InforUser>
                        <CopyToClipboard text={address} onCopy={handleCopy}>
                            <Address>
                                <Tooltip>
                                    <span>{formatAddress(address)}</span>
                                    <div className="tooltiptext">{!isCopied ? 'Copy to Clipboard' : 'Copied!'}</div>
                                </Tooltip>

                            </Address>
                        </CopyToClipboard>
                        <Currency>
                            {isLoading && (<Loader />)}
                            <img src={EthIcon} alt="ethIcon" width={15} />
                            <span>{amount} CTSI [used: {used_amount}]</span>
                        </Currency>
                    </InforUser>
                    <Deposit onClick={toggleModal}>
                        <DepositContent>
                            Deposit
                        </DepositContent>
                    </Deposit>
                    <img className="logoutIcon" src={LogoutIcon} alt="logoutIcon" width={20} onClick={handleLogout} />
                </Menu>

                {isVisible && (
                    <DepositModal
                        isVisible={isVisible}
                        toggleModal={toggleModal}
                    />
                )}
            </Content>
        </>
    )
}

export default Header