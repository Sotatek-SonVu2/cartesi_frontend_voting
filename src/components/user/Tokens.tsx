import Loading from 'common/Loading'
import { createNotifications } from 'common/Notification'
import Table from 'common/Table'
import Title from 'common/Title'
import Tooltip from 'common/Tooltip'
import useTokensList from 'hook/useTokensList'
import { useEffect } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { useDispatch } from 'react-redux'
import { getTokens } from 'reducers/tokenSlice'
import { AppDispatch } from 'store'
import { Content } from 'styled/common'
import { StatusText } from 'styled/list'
import { Container, ContentWrapper } from 'styled/main'
import { formatAddress } from 'utils/common'
import { GET_CAN_CREATE, GET_CAN_VOTE, NOTI_TYPE, TOKEN_STATUS } from 'utils/contants'
import { tokenType } from 'utils/interface'

const Tokens = () => {
	const dispatch = useDispatch<AppDispatch>()
	const TokenVoting = useTokensList(GET_CAN_VOTE)
	const TokenCreating = useTokensList(GET_CAN_CREATE)

	const handleCopy = () => {
		createNotifications(NOTI_TYPE.SUCCESS, 'Copied!')
	}

	useEffect(() => {
		dispatch(getTokens())
	}, [])

	const addColumns = [
		{
			text: 'Icon',
			dataField: 'icon',
			formatter: (cell: string) => <img src={cell} alt='token-icon' width={20} />,
		},
		{
			text: 'Token',
			dataField: 'name',
		},
		{
			text: 'Address',
			dataField: 'address',
			formatter: (cell: string, row: tokenType) => (
				<Tooltip text={cell} placement='top' id={row.address} className='tooltip-sz-max'>
					<CopyToClipboard text={cell} onCopy={handleCopy}>
						<div style={{ width: '100%' }}>{formatAddress(cell)}</div>
					</CopyToClipboard>
				</Tooltip>
			),
		},
		{
			text: 'Fee',
			dataField: 'fee',
		},
		{
			text: 'Status',
			dataField: 'status',
			formatter: (cell: number) => (
				<StatusText
					is_disabled={cell === TOKEN_STATUS.DISABLED}
					is_locked={cell === TOKEN_STATUS.LOCKED}>
					{cell === TOKEN_STATUS.DISABLED
						? 'Inactive'
						: cell === TOKEN_STATUS.LOCKED
						? 'Locked'
						: 'Active'}
				</StatusText>
			),
		},
	]

	const voteColumns = [
		{
			text: 'Icon',
			dataField: 'icon',
			formatter: (cell: string) => <img src={cell} alt='token-icon' width={20} />,
		},
		{
			text: 'Token',
			dataField: 'name',
		},
		{
			text: 'Address',
			dataField: 'address',
			formatter: (cell: string, row: tokenType) => (
				<Tooltip text={cell} placement='top' id={row.address} className='tooltip-sz-max'>
					<CopyToClipboard text={cell} onCopy={handleCopy}>
						<div style={{ width: '100%' }}>{formatAddress(cell)}</div>
					</CopyToClipboard>
				</Tooltip>
			),
		},
		{
			text: 'Status',
			dataField: 'status',
			formatter: (cell: number) => (
				<StatusText
					is_disabled={cell === TOKEN_STATUS.DISABLED}
					is_locked={cell === TOKEN_STATUS.LOCKED}>
					{cell === TOKEN_STATUS.DISABLED
						? 'Inactive'
						: cell === TOKEN_STATUS.LOCKED
						? 'Locked'
						: 'Active'}
				</StatusText>
			),
		},
	]

	return (
		<Container>
			<ContentWrapper>
				{TokenVoting.isLoading || TokenCreating.isLoading ? (
					<Loading />
				) : (
					<Content>
						<Title text='Tokens' userGuideType='tokens' />
						<>
							<div>
								<p>The token you can use to create the campaign:</p>
								<div style={{ marginTop: '15px' }}>
									<Table columns={addColumns} data={TokenCreating.tokenList} keyField='address' />
								</div>
							</div>
							<div style={{ marginTop: '2rem' }}>
								<p>The token you can use to vote the campaign:</p>
								<div style={{ marginTop: '15px' }}>
									<Table columns={voteColumns} data={TokenVoting.tokenList} keyField='address' />
								</div>
							</div>
						</>
					</Content>
				)}
			</ContentWrapper>
		</Container>
	)
}

export default Tokens
