import { getNotice } from '../helper/notices'
import { NO_RESPONSE_ERROR } from '../utils/contants'
import { getReport } from './report'

// Call notices (fulfilled) and reports (rejected) to get response (If it fail, continue calling. Maximum number of call: 20)
export const handleResponse = async (
	epoch: number | undefined,
	input: number | undefined,
	callback: any
) => {
	var times = 20
	const myInterval = setInterval(async () => {
		try {
			const notice = await getNotice({
				epoch,
				input,
			})
			const report = await getReport({
				epoch,
				input,
			})
			let [msgNotice, msgReport] = await Promise.all([notice, report])
			const prsNotice = JSON.parse(msgNotice)
			const prsReport = JSON.parse(msgReport)
			const result = prsNotice.length > 0 ? prsNotice : prsReport
			console.log(
				`Waiting...number to calls: ${times}, call result:`,
				result.length > 0 ? 'success' : 'fail'
			)
			if (--times === 0) {
				clearInterval(myInterval)
				console.log('Call fail!')
				callback('')
			} else if (result.length > 0) {
				const payload = JSON.parse(result[0]?.payload)
				if (payload) {
					clearInterval(myInterval)
					console.log('Call successful!')
					callback(payload)
				}
			} else {
				callback({
					message: NO_RESPONSE_ERROR,
					times,
				})
			}
		} catch (error) {
			clearInterval(myInterval)
			throw error
		}
	}, 1500)
}
