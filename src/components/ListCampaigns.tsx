import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "../common/Loading";
import NoData from "../common/NoData";
import { createNotifications } from "../common/Notification";
import Pagination from "../common/Pagination";
import { handleInspectApi } from "../helper/handleInspectApi";
import { RootState } from "../store";
import { Content, Title } from "../styled/common";
import { ERROR_MESSAGE, LIST_CAMPAIGN, NOTI_TYPE } from "../utils/contants";
import { CampaignDataType, MetadataType } from "../utils/interface";
import CampaignItem from "./Item/Campaign";

const ListCampaigns = () => {
    const metadata: MetadataType = useSelector((state: RootState) => state.auth.metadata)
    const listStatus = useSelector((state: RootState) => state.campaign.listStatus)
    const [items, setItems] = useState<CampaignDataType[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [paging, setPaging] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPage: 1
    });

    const getData = async () => {
        try {
            setIsLoading(true)
            const data = {
                action: LIST_CAMPAIGN,
                page: paging.currentPage,
                limit: paging.pageSize,
                type: listStatus
            }
            const result = await handleInspectApi(data, metadata)
            if (result && !result.error) {
                setItems(result.data)
                setPaging({
                    currentPage: result.page,
                    pageSize: result.limit,
                    totalPage: result.total
                })
            } else {
                createNotifications(NOTI_TYPE.DANGER, result?.error || ERROR_MESSAGE)
            }
        } catch (error) {
            createNotifications(NOTI_TYPE.DANGER, ERROR_MESSAGE)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [paging.currentPage, listStatus])

    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                <Content>
                    <Title>
                        List campaigns
                    </Title>
                    {items?.length > 0 ? items?.map((item: CampaignDataType) => (
                        <div key={item.id}>
                            <CampaignItem data={item} />
                        </div>
                    )) : (
                        <NoData />
                    )}
                    {items?.length > 0 && (
                        <Pagination
                            currentPage={paging.currentPage}
                            totalCount={paging.totalPage}
                            pageSize={paging.pageSize}
                            onPageChange={(page: number) => {
                                setPaging({ ...paging, currentPage: page })
                            }}
                        />
                    )}
                </Content>
            )}
        </>
    )
}

export default ListCampaigns