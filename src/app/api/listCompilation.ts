import { ProfileView, ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

interface ListArgs {
    filters: string[]
    reposts: ProfileView[]|undefined
    likes: ProfileView[]|undefined
    replies: ProfileViewBasic[]|undefined
    post: string
}

export const constructList = async ({filters, reposts, likes, replies, post}: ListArgs) => {

    if(filters.length === 1 && post !== ""){
        switch (true) {
            case filters[0] === "reposts":
            return reposts
            case filters[0] === "likes":
            console.log(likes)
            return likes
            case filters[0] === "replies":
            return replies
        }
    }

    // different possible combinations w/ filter array.
    if(filters.length > 1 && post !== ""){
        if(filters.includes("reposts") && filters.includes("likes")){
            if(reposts && likes){
            return reposts.filter(like => {return likes.some((repost) => {return (like.handle == repost.handle)})});
            }
            return reposts
        }
        else if(filters.includes("replies") && filters.includes("reposts")){
            if(reposts && replies){
            return reposts.filter(repost => {return replies.some((reply) => {return (repost.handle == reply.handle)})});
            }
            return reposts
        }
        else if(filters.includes("likes") && filters.includes("replies")){
            if(likes && replies){
            return likes.filter(like => {return replies.some((reply) => {return (like.handle == reply.handle)})});
            }
            return likes
        }
        else {
            if(reposts && replies && likes){
            const filteredOnce = reposts.filter(repost => {return likes!.some((like) => {return (like.handle == repost.handle)})});
            return filteredOnce.filter(repost => {return replies.some((reply) => {return repost.handle === reply.handle})})
            }
            return reposts
        }
    }

};