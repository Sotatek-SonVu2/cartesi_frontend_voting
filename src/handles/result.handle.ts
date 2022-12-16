import { createNotifications } from "common/Notification"
import useRequest from "hook/useRequest"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { CAMPAIGN_DETAIL, NOTI_TYPE, RESULT } from "utils/contants"
import { CampaignType, VotedType } from "utils/interface"

interface DataType {
    campaign: CampaignType[]
    title: string
    description: string
    voted_candidate: VotedType | null
}

export default function ResultHandle() {
    const { campaignId } = useParams();
    const { isLoading, fetchApi, fetchNotices, callMessage, success, setCallMessage } = useRequest()
    const [data, setData] = useState<DataType>({
        campaign: [],
        title: '',
        description: '',
        voted_candidate: {
            campaign_id: 0,
            candidate_id: 0,
            id: 0,
            user: '',
            voting_time: '',
            name: ''
        }
    })

    const getLists = async () => {
        if (campaignId) {
            const resultPayload = {
                action: RESULT,
                campaign_id: parseInt(campaignId)
            }
            const detailPayload = {
                action: CAMPAIGN_DETAIL,
                campaign_id: parseInt(campaignId)
            }
            const result = await fetchApi(resultPayload)  // Get result data
            const detail = await fetchApi(detailPayload) // Get detail data
            if (!result.error && !detail.error) {
                const campaign = result.campaign.map((item: CampaignType) => {
                    return {
                        ...item,
                        total_vote: result.total_vote,
                    }
                }).sort((a: CampaignType, b: CampaignType) => b.votes - a.votes)
                setData({
                    campaign,
                    title: detail?.campaign[0].name,
                    description: detail?.campaign[0].description,
                    voted_candidate: result.voted_candidate
                })
            } else {
                createNotifications(NOTI_TYPE.DANGER, result?.error)
            }
        }
    }


    return {
        getLists,
        // handleVoting,
        // onChooseCandidate,
        // setComment,
        // isLoadVoting,
        // comment,
        // isCloseVoting,
        // candidateId,
        data,
        isLoading,
        callMessage,
        success
    }
}