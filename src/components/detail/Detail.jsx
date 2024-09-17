// import { auth } from "../firebase"
import { useUserStore} from "../../lib/userStore.js"
import { useChatStore} from "../../lib/chatStore.js"
import { db } from "../firebase"
import { doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import {auth} from "../firebase"
import "./detail.css"

const Detail = ()=>{
    const{chatId , user , isCurrentUserBlocked , isReceiverBlocked , changeBlock} = useChatStore()
    const {currentUser} = useUserStore()
    const handleBlock = async ()=>{
        if (!user) return 

        const userDocRef = doc(db , "users" ,currentUser.id )
        try{
            await updateDoc(userDocRef , {
                blocked : isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            })
            changeBlock()
        } catch(err){
            console.log(err)
        }
    }
    return (
        <div className="detail">
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                <h2>{user?.username}</h2>
                <p>Lorem ipsum dolor sit amet.</p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Chat Settings</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>Privacy & help</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>



                <div className="option">
                    <div className="title">
                        <span>Chat Settings</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>


                <div className="option">
                    <div className="title">
                        <span>Shared photos</span>
                        <img src="./arrowDown.png" alt="" />
                    </div>
                    <div className="photos">
                       
                        <div className="photoItem">
                            <div className="photoDetail">
                            <img src="https://i.pinimg.com/736x/a4/6b/ba/a46bba75ea009158ac114b218ca11640.jpg" alt="" />
                            <span>photo_2024_2.png</span>
                            </div>
                            
                       
                        <img src="./download.png" className="icon" alt="" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                            <img src="https://i.pinimg.com/736x/a4/6b/ba/a46bba75ea009158ac114b218ca11640.jpg" alt="" />
                            <span>photo_2024_2.png</span>
                            </div>
                            
                       
                        <img src="./download.png" className="icon" alt="" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                            <img src="https://i.pinimg.com/736x/a4/6b/ba/a46bba75ea009158ac114b218ca11640.jpg" alt="" />
                            <span>photo_2024_2.png</span>
                            </div>
                            
                       
                        <img src="./download.png" className="icon" alt="" />
                        </div>
                    </div>
                </div>

                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <button onClick={handleBlock} >{
                    isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "User blocked" : "Block User"
                    }</button>
                <button className="logout" onClick={()=>auth.signOut()}>Logout</button>
            </div>
        </div>
    )
}


export default Detail