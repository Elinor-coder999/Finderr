import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { loadGigs, removeGig } from '../store/actions/gig.actions'
import { UserList } from '../cmps/user/UserList'
import { UserProfile } from './UserProfile'
import { loadWatchedUser } from '../store/user/user.actions'
import { ReviewList } from '../cmps/review/ReviewList'
import { ReviewBar } from '../cmps/review/ReviewBar'

import { userService } from '../services/user/user.service.remote'; 
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'

export function UserIndex() {
    const watchedUser = useSelector(storeState => storeState.userModule.watchedUser)
    const gigs = useSelector(storeState => storeState.gigModule.gigs)
    const { userId } = useParams()
    const [, setTime] = useState('')
    const [user, setUser] = useState(null)

    useEffect(() => {
        userId && loadWatchedUser(userId)
        async function loadUser() {
            try {
                const user = await userService.getById(userId)
                setUser(user)
            } catch (err) {
                console.log('user =>', err)
            }
        }
        loadUser()
        loadGigs({userId})
        loadUser()
    }, [ userId])

    useEffect(() => {
        const updateTime = () => {
            const currentDate = new Date()
            const hours = currentDate.getHours()
            const minutes = currentDate.getMinutes()
            const AmPm = hours >= 12 ? 'PM' : 'AM'
            const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${AmPm} local time`
            setTime(formattedTime)
        }

        updateTime()
        const intervalId = setInterval(updateTime, 60000)
        return () => clearInterval(intervalId)
    }, [])

   

    async function onRemoveGig(gigId) {
        try {
            await removeGig(gigId)
            showSuccessMsg('Gig removed')
        } catch (err) {
            showErrorMsg('Cannot remove gig')
        }
    }

    if (!user) return <div className="loader-container">
        <div className="loader"></div>
    </div>
    return (
        <section className="user-index">
            <aside className="user-info">
                <UserProfile watchedUser={watchedUser} />
                <div className="user-review-bar">{watchedUser && watchedUser.reviews && <ReviewBar userReviews={watchedUser.reviews} />}</div>
                {watchedUser && gigs && <UserList gigs={gigs} onRemoveGig={onRemoveGig} user={watchedUser} />}
                {watchedUser && watchedUser.reviews && <ReviewList userReviews={watchedUser.reviews} />}
            </aside>
        </section>
    )
}