import { createNotifications } from "../common/Notification"
import { NOTI_TYPE } from "./contants"

const CONNECT_METAMASK_ERROR_CODE = -32002
const CONNECT_METAMASK_ERROR_MESSAGE = 'Please connect to MetaMask.'

export const checkConnected = async () => {
    try {
        const { ethereum } = window
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length === 0) {
            createNotifications(NOTI_TYPE.DANGER, CONNECT_METAMASK_ERROR_MESSAGE)
            return false
        }
        return true
    } catch (error: any) {
        if (error.code === CONNECT_METAMASK_ERROR_CODE) {
            createNotifications(NOTI_TYPE.DANGER, CONNECT_METAMASK_ERROR_MESSAGE)
        } else {
            throw error
        }
    }
}