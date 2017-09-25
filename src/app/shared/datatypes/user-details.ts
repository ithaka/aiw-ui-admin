export interface UserDetails {
    createdDate: string
    totalAccessDays: number
    hasAdminPriv: boolean
    ssEnabled: boolean
    archivedUser: boolean
    optInEmail: boolean
    user: string
    daysAccessRemaining: number
    profileId: string
    optInSurvey: boolean
    timeLastAccessed: string
    ssAdmin: boolean
}

export interface UserUpdate {
    profileId: string
    ssEnabled?: boolean
    optInEmail?: boolean
    optInSurvey?: boolean
    ssAdmin?: boolean
    hasAdminPriv?: boolean
    archivedUser?: boolean
    daysAccessRemaining?: number
}