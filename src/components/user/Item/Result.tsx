import styled from 'styled-components'
import { BoxContent } from 'styled/common'
import { Avatar, AvatarText, ProcessBar, ResultName, VotingRate, Wrapper } from 'styled/list'
import { FlexLayout } from 'styled/main'
import { getAvatar, randomColor } from 'utils/common'
import { VotedType } from 'utils/interface'

const FlexLayoutBetween = styled(FlexLayout)`
	justify-content: space-between;
	align-items: center;
`

interface PropsType {
	data: {
		id: number
		name: string
		votes: number
		avatar: string
		total_vote: number
	}
	voted_candidate: VotedType | null
}

const ResultItem = ({ data, voted_candidate }: PropsType) => {
	const { id, name, votes, avatar, total_vote } = data
	const percent: string | number = votes && total_vote ? ((votes / total_vote) * 100).toFixed(2) : 0
	const checked = voted_candidate?.candidate_id === id
	return (
		<Wrapper key={id}>
			<BoxContent>
				<ProcessBar itemId={id} percent={percent} bgColor={randomColor()}></ProcessBar>
				<FlexLayoutBetween>
					<ResultName>
						<Avatar bgColor={avatar}>
							<AvatarText>{getAvatar(name)}</AvatarText>
						</Avatar>
						{name} {checked && '(voted)'}
					</ResultName>
					<VotingRate>
						{percent}% ({votes || 0})
					</VotingRate>
				</FlexLayoutBetween>
			</BoxContent>
		</Wrapper>
	)
}

export default ResultItem
