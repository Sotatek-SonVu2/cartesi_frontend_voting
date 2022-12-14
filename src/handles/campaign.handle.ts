import { createNotifications } from 'common/Notification'
import { OptionsType } from 'common/ReactSelect'
import useRequest from 'hook/useRequest'
import useTokensList from 'hook/useTokensList'
import moment from 'moment'
import { useState } from 'react'
import { FieldValues, UseFormSetValue } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { getDepositInfo } from 'reducers/authSlice'
import { PROSOSAL, ROUTER_PATH } from 'routes/contants'
import { AppDispatch } from 'store'
import { convertLocalToUtc, convertUtcToLocal, randomColor } from 'utils/common'
import {
	CAMPAIGN_DETAIL,
	CREATE_CAMPAIGN,
	EDIT_CAMPAIGN,
	FORMAT_DATETIME,
	GET_CAN_CREATE_ACTIVE,
	GET_CAN_VOTE_ACTIVE,
	LIST_CAMPAIGN,
	LIST_PROFILE_OF_CURRENT_USER,
	NOTI_TYPE,
} from 'utils/contants'
import getTokenAddress from 'utils/getTokenAddress'
import { AddEditDataType, CampaignHandleRes, OptionType, tokenType } from 'utils/interface'
import { validateDate } from 'utils/validate'

export default function CampaignHandle(setValue?: UseFormSetValue<FieldValues>): CampaignHandleRes {
	const navigate = useNavigate()
	const { campaignId, profileId, type } = useParams()
	const dispatch = useDispatch<AppDispatch>()
	const [data, setData] = useState(null)
	const [isMyCampaign, setIsMyCampaign] = useState<boolean>(false)
	const [tokenToCreate, setTokenToCreate] = useState<string>('')
	const [tokenToVote, setTokenToVote] = useState<string>('')
	const [paging, setPaging] = useState({
		currentPage: 1,
		pageSize: 10,
		totalPage: 1,
	})
	const [dateTime, setDateTime] = useState({
		startDate: new Date(),
		endDate: new Date(),
		formErrors: {
			startDate: '',
			endDate: '',
		},
	})
	const [campaignType] = useOutletContext<any>()
	const token_to_create = useTokensList(GET_CAN_CREATE_ACTIVE)
	const token_to_vote = useTokensList(GET_CAN_VOTE_ACTIVE)
	const { isLoading, fetchApi, fetchNotices, success } = useRequest()
	const { startDate, endDate, formErrors } = dateTime

	const getLists = async () => {
		const params = {
			action: LIST_CAMPAIGN,
			page: paging.currentPage,
			limit: paging.pageSize,
			type: campaignType,
			my_campaign: isMyCampaign,
		}
		const result = await fetchApi(params)
		setData(result.data)
		setPaging({
			currentPage: result.page,
			pageSize: result.limit,
			totalPage: result.total,
		})
	}

	const getDataForm = async () => {
		if (campaignId) {
			const params = {
				action: CAMPAIGN_DETAIL,
				campaign_id: parseInt(campaignId),
			}
			const result = await fetchApi(params)
			if (!result.error) {
				const { start_time, end_time, name, description, fee, accept_token } = result.campaign[0]
				const token = token_to_vote.tokenList?.find(
					(token: tokenType) => token.address === accept_token
				)?.name
				const options = result.candidates.map((item: OptionType) => {
					return {
						name: item.name,
						brief_introduction: item.brief_introduction,
						avatar: item.avatar || '',
					}
				})
				setTokenToVote(token)
				setDateTime({
					startDate: new Date(convertUtcToLocal(new Date(start_time))),
					endDate: new Date(convertUtcToLocal(new Date(end_time))),
					formErrors: { startDate: '', endDate: '' },
				})
				if (typeof setValue === 'function') {
					setValue('name', name)
					setValue('description', description)
					setValue('fee', fee)
					setValue('options', [...options])
				}
			} else {
				createNotifications(NOTI_TYPE.DANGER, result?.error)
			}
		}
	}

	const getProfileByUser = async () => {
		const params = {
			action: LIST_PROFILE_OF_CURRENT_USER,
		}
		const result = await fetchApi(params)
		setData(result.data)
	}

	const handleChangeDate = (key: string) => (value: Date) => {
		const validate = validateDate(key, value, endDate, startDate)
		setDateTime({
			...dateTime,
			formErrors: { ...formErrors, ...validate },
			[key]: value,
		})
	}

	const handleCreateSuccess = (payload: any) => {
		let router = ''
		if (payload) {
			const { id, campaign } = payload
			router = `${ROUTER_PATH.VOTING}/${id}/profile/${campaign.profile_id}/${campaign.profile_type}`
		} else if (profileId && !payload) {
			router = `${ROUTER_PATH.PROFILE}/${profileId}${PROSOSAL}`
		} else {
			router = ROUTER_PATH.HOMEPAGE
		}
		dispatch(getDepositInfo())
		navigate(`${router}`)
	}

	const handleEditSuccess = () => {
		dispatch(getDepositInfo())
		navigate(`${ROUTER_PATH.VOTING}/${campaignId}/profile/${profileId}/${type}`)
	}

	const createCampaign = async (data: AddEditDataType) => {
		fetchNotices(data, handleCreateSuccess)
	}

	const editCampaign = async (data: AddEditDataType) => {
		fetchNotices(data, handleEditSuccess)
	}

	const onSubmit = async (dataForm: any) => {
		const checkDate = validateDate('startDate', startDate, endDate, startDate)
		const accept_token = tokenToVote || token_to_vote?.tokenList[0]?.name
		const token_address = tokenToCreate || token_to_create?.tokenList[0]?.name
		if (!checkDate?.startDate) {
			const data: AddEditDataType = {
				action: !campaignId ? CREATE_CAMPAIGN : EDIT_CAMPAIGN,
				name: dataForm.name,
				description: dataForm.description,
				profile_id: profileId ? parseInt(profileId) : null,
				start_time: moment(convertLocalToUtc(startDate)).format(FORMAT_DATETIME), // Convert local datetime to UTC+0 datetime and format
				end_time: moment(convertLocalToUtc(endDate)).format(FORMAT_DATETIME), // Convert local datetime to UTC+0 datetime and format
				accept_token: getTokenAddress(token_to_vote.tokenList, accept_token),
				fee: dataForm.fee,
				candidates: dataForm.options.map((item: OptionType) => {
					return {
						name: item.name,
						brief_introduction: item.brief_introduction,
						avatar: randomColor(),
					}
				}),
			}
			if (!campaignId) {
				const newData: AddEditDataType = {
					token_address: getTokenAddress(token_to_create.tokenList, token_address),
					...data,
				}
				createCampaign(newData)
			} else {
				const newData: AddEditDataType = {
					id: parseInt(campaignId),
					...data,
				}
				editCampaign(newData)
			}
		} else {
			setDateTime({
				...dateTime,
				formErrors: { ...formErrors, ...checkDate },
			})
			createNotifications(NOTI_TYPE.DANGER, 'Please check the entered data!')
		}
	}

	return {
		getLists,
		setIsMyCampaign,
		setPaging,
		handleChangeDate,
		onSubmit,
		getDataForm,
		setTokenToCreate,
		getProfileByUser,
		setTokenToVote,
		tokenToCreate,
		token_to_create,
		tokenToVote,
		token_to_vote,
		dateTime,
		data,
		isMyCampaign,
		isLoading,
		paging,
		campaignType,
		success,
	}
}
